-- 002_rls.sql
-- Row Level Security (RLS) - Controle de acesso por perfil

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimento_estoque ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA TABELA: usuario
-- ============================================================================

-- Admin vê todos os usuários
CREATE POLICY "Admin vê todos usuários"
  ON usuario FOR SELECT
  USING ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin');

-- Usuários veem apenas a si mesmos
CREATE POLICY "Usuários veem apenas a si mesmos"
  ON usuario FOR SELECT
  USING (id = auth.uid());

-- ============================================================================
-- POLÍTICAS PARA TABELA: cliente
-- ============================================================================

-- Todos os usuários autenticados podem ver clientes
CREATE POLICY "Usuários autenticados veem clientes"
  ON cliente FOR SELECT
  USING (auth.jwt() ->> 'sub' IS NOT NULL);

-- Admin pode criar/editar clientes
CREATE POLICY "Admin cria/edita clientes"
  ON cliente FOR INSERT
  WITH CHECK ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin atualiza clientes"
  ON cliente FOR UPDATE
  USING ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- POLÍTICAS PARA TABELA: ordem_servico
-- ============================================================================

-- Admin vê TODAS as OS
CREATE POLICY "Admin vê todas as OS"
  ON ordem_servico FOR SELECT
  USING ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin');

-- Atendente vê TODAS as OS (gestão de clientes)
CREATE POLICY "Atendente vê todas as OS"
  ON ordem_servico FOR SELECT
  USING ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'atendente');

-- Técnico vê APENAS suas próprias OS
CREATE POLICY "Técnico vê apenas suas OS"
  ON ordem_servico FOR SELECT
  USING (
    (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'tecnico'
    AND tecnico_id = auth.uid()
  );

-- Admin pode criar/editar/eliminar OS
CREATE POLICY "Admin cria OS"
  ON ordem_servico FOR INSERT
  WITH CHECK ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin/Atendente criam OS"
  ON ordem_servico FOR INSERT
  WITH CHECK (
    (SELECT perfil FROM usuario WHERE id = auth.uid()) IN ('admin', 'atendente')
  );

CREATE POLICY "Qualquer um atualiza sua OS"
  ON ordem_servico FOR UPDATE
  USING (
    (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin'
    OR atendente_id = auth.uid()
    OR tecnico_id = auth.uid()
  )
  WITH CHECK (
    (SELECT perfil FROM usuario WHERE id = auth.uid()) IN ('admin', 'atendente', 'tecnico')
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA: equipamento
-- ============================================================================

-- Mesmo acesso que ordem_servico (via JOINs)
CREATE POLICY "Ver equipamento se vê OS"
  ON equipamento FOR SELECT
  USING (
    os_id IN (
      SELECT id FROM ordem_servico 
      WHERE 
        (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin'
        OR (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'atendente'
        OR tecnico_id = auth.uid()
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA: produto
-- ============================================================================

-- Todos veem produtos ativos
CREATE POLICY "Todos veem produtos ativos"
  ON produto FOR SELECT
  USING (ativo = true);

-- Admin/Atendente veem até inativos
CREATE POLICY "Admin/Atendente veem todos produtos"
  ON produto FOR SELECT
  USING ((SELECT perfil FROM usuario WHERE id = auth.uid()) IN ('admin', 'atendente'));

-- Admin cria/edita produtos
CREATE POLICY "Admin edita produtos"
  ON produto FOR INSERT
  WITH CHECK ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin atualiza produtos"
  ON produto FOR UPDATE
  USING ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- POLÍTICAS PARA TABELA: item_os
-- ============================================================================

-- Ver itens da OS se vê a OS
CREATE POLICY "Ver itens se vê OS"
  ON item_os FOR SELECT
  USING (
    os_id IN (
      SELECT id FROM ordem_servico 
      WHERE 
        (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin'
        OR (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'atendente'
        OR tecnico_id = auth.uid()
    )
  );

-- Técnico pode adicionar itens à sua OS
CREATE POLICY "Técnico adiciona itens sua OS"
  ON item_os FOR INSERT
  WITH CHECK (
    os_id IN (
      SELECT id FROM ordem_servico WHERE tecnico_id = auth.uid()
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA: venda
-- ============================================================================

-- Todos veem vendas
CREATE POLICY "Ver vendas"
  ON venda FOR SELECT
  USING (auth.jwt() ->> 'sub' IS NOT NULL);

-- Admin/Atendente/Vendedor podem criar vendas
CREATE POLICY "Admin/Atendente/Vendedor criam vendas"
  ON venda FOR INSERT
  WITH CHECK (
    (SELECT perfil FROM usuario WHERE id = auth.uid()) IN ('admin', 'atendente', 'tecnico')
    OR vendedor_id = auth.uid()
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA: item_venda
-- ============================================================================

-- Ver itens da venda se vê a venda
CREATE POLICY "Ver itens venda"
  ON item_venda FOR SELECT
  USING (
    venda_id IN (
      SELECT id FROM venda WHERE 
        (SELECT perfil FROM usuario WHERE id = auth.uid()) IS NOT NULL
    )
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA: documento
-- ============================================================================

-- Ver documentos se vê a OS ou venda relacionada
CREATE POLICY "Ver documentos"
  ON documento FOR SELECT
  USING (
    -- Se tem OS, verifica acesso à OS
    CASE 
      WHEN os_id IS NOT NULL THEN
        os_id IN (
          SELECT id FROM ordem_servico 
          WHERE 
            (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin'
            OR (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'atendente'
            OR tecnico_id = auth.uid()
        )
      ELSE true -- Se é venda, acesso geral
    END
  );

-- ============================================================================
-- POLÍTICAS PARA TABELA: movimento_estoque
-- ============================================================================

-- Admin/Atendente veem movimentação
CREATE POLICY "Admin/Atendente veem movimento"
  ON movimento_estoque FOR SELECT
  USING ((SELECT perfil FROM usuario WHERE id = auth.uid()) IN ('admin', 'atendente'));

-- Técnico vê movimentações de sua OS
CREATE POLICY "Técnico vê movimento sua OS"
  ON movimento_estoque FOR SELECT
  USING (
    (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'tecnico'
    AND os_id IN (
      SELECT id FROM ordem_servico WHERE tecnico_id = auth.uid()
    )
  );

-- Admin/Técnico podem inserir movimentos
CREATE POLICY "Admin/Técnico inserem movimento"
  ON movimento_estoque FOR INSERT
  WITH CHECK ((SELECT perfil FROM usuario WHERE id = auth.uid()) IN ('admin', 'tecnico'));

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE COM RLS
-- ============================================================================

CREATE INDEX idx_usuario_perfil ON usuario(perfil);
CREATE INDEX idx_ordem_servico_estado_tecnico ON ordem_servico(status, tecnico_id);
CREATE INDEX idx_movimento_estoque_os_tecnico ON movimento_estoque(os_id);
