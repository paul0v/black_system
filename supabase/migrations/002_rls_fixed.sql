-- 002_rls_fixed.sql
-- Row Level Security - Versão corrigida sem recursão infinita

-- ============================================================================
-- DESABILITAR RLS EXISTENTE (remover políticas com recursão)
-- ============================================================================

ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE cliente DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_servico DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipamento DISABLE ROW LEVEL SECURITY;
ALTER TABLE produto DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_os DISABLE ROW LEVEL SECURITY;
ALTER TABLE venda DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_venda DISABLE ROW LEVEL SECURITY;
ALTER TABLE documento DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimento_estoque DISABLE ROW LEVEL SECURITY;

-- DROP existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin vê todos usuários" ON usuario;
DROP POLICY IF EXISTS "Usuários veem apenas a si mesmos" ON usuario;
DROP POLICY IF EXISTS "Usuários autenticados veem clientes" ON cliente;
DROP POLICY IF EXISTS "Admin cria/edita clientes" ON cliente;
DROP POLICY IF EXISTS "Admin atualiza clientes" ON cliente;
DROP POLICY IF EXISTS "Admin vê todas as OS" ON ordem_servico;
DROP POLICY IF EXISTS "Atendente vê todas as OS" ON ordem_servico;
DROP POLICY IF EXISTS "Técnico vê apenas suas OS" ON ordem_servico;
DROP POLICY IF EXISTS "Admin cria OS" ON ordem_servico;
DROP POLICY IF EXISTS "Admin/Atendente criam OS" ON ordem_servico;
DROP POLICY IF EXISTS "Qualquer um atualiza sua OS" ON ordem_servico;
DROP POLICY IF EXISTS "Ver equipamento se vê OS" ON equipamento;
DROP POLICY IF EXISTS "Todos veem produtos ativos" ON produto;
DROP POLICY IF EXISTS "Admin/Atendente veem todos produtos" ON produto;
DROP POLICY IF EXISTS "Admin edita produtos" ON produto;
DROP POLICY IF EXISTS "Admin atualiza produtos" ON produto;
DROP POLICY IF EXISTS "Ver itens se vê OS" ON item_os;
DROP POLICY IF EXISTS "Técnico adiciona itens sua OS" ON item_os;
DROP POLICY IF EXISTS "Ver vendas" ON venda;
DROP POLICY IF EXISTS "Admin/Atendente/Vendedor criam vendas" ON venda;
DROP POLICY IF EXISTS "Ver itens venda" ON item_venda;
DROP POLICY IF EXISTS "Ver documentos" ON documento;
DROP POLICY IF EXISTS "Admin/Atendente veem movimento" ON movimento_estoque;
DROP POLICY IF EXISTS "Técnico vê movimento sua OS" ON movimento_estoque;
DROP POLICY IF EXISTS "Admin/Técnico inserem movimento" ON movimento_estoque;

-- ============================================================================
-- HABILITAR RLS COM POLÍTICAS SIMPLES (sem recursão)
-- ============================================================================

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
-- POLÍTICAS SIMPLES (sem subqueries que causam recursão)
-- ============================================================================

-- USUARIO: Ver próprios dados + ser visto por usuários autenticados
CREATE POLICY "Ver dados do próprio usuário"
  ON usuario FOR SELECT
  USING (id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "Inserir novo usuário (signup)"
  ON usuario FOR INSERT
  WITH CHECK (id = auth.uid());

-- CLIENTE: Todos autenticados podem ver e criar
CREATE POLICY "Autenticados veem clientes"
  ON cliente FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados criam clientes"
  ON cliente FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados atualizam clientes"
  ON cliente FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ORDEM_SERVICO: Todos autenticados
CREATE POLICY "Autenticados veem OS"
  ON ordem_servico FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados criam OS"
  ON ordem_servico FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados atualizam OS"
  ON ordem_servico FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados deletam OS"
  ON ordem_servico FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- EQUIPAMENTO
CREATE POLICY "Autenticados veem equipamentos"
  ON equipamento FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados criam equipamentos"
  ON equipamento FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados atualizam equipamentos"
  ON equipamento FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- PRODUTO
CREATE POLICY "Todos veem produtos ativos"
  ON produto FOR SELECT
  USING (ativo = true);

CREATE POLICY "Autenticados criam produtos"
  ON produto FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados atualizam produtos"
  ON produto FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ITEM_OS
CREATE POLICY "Autenticados veem items OS"
  ON item_os FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados criam items OS"
  ON item_os FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados atualizam items OS"
  ON item_os FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- VENDA
CREATE POLICY "Autenticados veem vendas"
  ON venda FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados criam vendas"
  ON venda FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados atualizam vendas"
  ON venda FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ITEM_VENDA
CREATE POLICY "Autenticados veem items venda"
  ON item_venda FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados criam items venda"
  ON item_venda FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados atualizam items venda"
  ON item_venda FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- DOCUMENTO
CREATE POLICY "Autenticados veem documentos"
  ON documento FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados criam documentos"
  ON documento FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados atualizam documentos"
  ON documento FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- MOVIMENTO_ESTOQUE
CREATE POLICY "Autenticados veem movimentos"
  ON movimento_estoque FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados criam movimentos"
  ON movimento_estoque FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_perfil ON usuario(perfil);
CREATE INDEX IF NOT EXISTS idx_ordem_servico_cliente ON ordem_servico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordem_servico_tecnico ON ordem_servico(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_ordem_servico_status ON ordem_servico(status);
CREATE INDEX IF NOT EXISTS idx_equipamento_os ON equipamento(os_id);
CREATE INDEX IF NOT EXISTS idx_item_os_os ON item_os(os_id);
CREATE INDEX IF NOT EXISTS idx_venda_vendedor ON venda(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_item_venda_venda ON item_venda(venda_id);
CREATE INDEX IF NOT EXISTS idx_movimento_estoque_produto ON movimento_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_documento_os ON documento(os_id);
CREATE INDEX IF NOT EXISTS idx_documento_venda ON documento(venda_id);
