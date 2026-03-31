-- 003_triggers.sql
-- Triggers para automação: alertas de estoque, atualizações timestamps, etc

-- ============================================================================
-- FUNÇÃO: Atualizar timestamp de modificação
-- ============================================================================

CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de timestamp a todas as tabelas relevantes
CREATE TRIGGER tr_usuario_timestamp
BEFORE UPDATE ON usuario
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER tr_cliente_timestamp
BEFORE UPDATE ON cliente
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER tr_ordem_servico_timestamp
BEFORE UPDATE ON ordem_servico
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER tr_produto_timestamp
BEFORE UPDATE ON produto
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

-- ============================================================================
-- FUNÇÃO: Verificar e atualizar alerta de estoque baixo
-- ============================================================================

CREATE OR REPLACE FUNCTION verificar_estoque_baixo()
RETURNS TRIGGER AS $$
BEGIN
  -- Se quantidade <= estoque_minimo, ativa alerta
  UPDATE produto
  SET alerta_ativo = (NEW.quantidade <= NEW.estoque_minimo)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger em inserts e updates de produto
CREATE TRIGGER tr_produto_alerta_insert
AFTER INSERT ON produto
FOR EACH ROW
EXECUTE FUNCTION verificar_estoque_baixo();

CREATE TRIGGER tr_produto_alerta_update
AFTER UPDATE ON produto
FOR EACH ROW
EXECUTE FUNCTION verificar_estoque_baixo();

-- ============================================================================
-- FUNÇÃO: Atualizar quantidade de produto após movimento de estoque
-- ============================================================================

CREATE OR REPLACE FUNCTION atualizar_quantidade_produto()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    ajuste_quantidade INT;
  BEGIN
    -- Determinar se aumenta ou diminui
    ajuste_quantidade := CASE
      WHEN NEW.tipo = 'entrada' THEN NEW.quantidade
      WHEN NEW.tipo IN ('saida_os', 'saida_venda') THEN -NEW.quantidade
      WHEN NEW.tipo = 'ajuste' THEN NEW.quantidade
      ELSE 0
    END;
    
    -- Atualizar quantidade do produto
    UPDATE produto
    SET quantidade = quantidade + ajuste_quantidade
    WHERE id = NEW.produto_id;
    
    -- Verificar alerta de estoque
    PERFORM verificar_estoque_baixo()
    FROM produto
    WHERE id = NEW.produto_id;
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao inserir movimento de estoque
CREATE TRIGGER tr_movimento_estoque_atualiza_quantidade
AFTER INSERT ON movimento_estoque
FOR EACH ROW
EXECUTE FUNCTION atualizar_quantidade_produto();

-- ============================================================================
-- FUNÇÃO: Dar baixa automática de peças ao concluir OS
-- ============================================================================

CREATE OR REPLACE FUNCTION baixar_pecas_ao_concluir()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status mudou para CONCLUIDA, criar movimentos de estoque
  IF OLD.status != 'concluida' AND NEW.status = 'concluida' THEN
    -- Inserir movimentos para cada item da OS
    INSERT INTO movimento_estoque (produto_id, os_id, tipo, quantidade, motivo, data)
    SELECT 
      io.produto_id,
      NEW.id,
      'saida_os',
      io.quantidade,
      'Saída automática ao concluir OS #' || NEW.numero,
      now()
    FROM item_os io
    WHERE io.os_id = NEW.id
      AND io.produto_id NOT IN (
        SELECT produto_id FROM movimento_estoque 
        WHERE os_id = NEW.id AND tipo = 'saida_os'
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao atualizar status de OS
CREATE TRIGGER tr_ordem_servico_baixar_pecas
BEFORE UPDATE ON ordem_servico
FOR EACH ROW
EXECUTE FUNCTION baixar_pecas_ao_concluir();

-- ============================================================================
-- FUNÇÃO: Dar baixa automática ao inserir venda
-- ============================================================================

CREATE OR REPLACE FUNCTION baixar_pecas_venda()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar movimentos de estoque para cada item da venda
  INSERT INTO movimento_estoque (produto_id, venda_id, tipo, quantidade, motivo, data)
  SELECT 
    iv.produto_id,
    NEW.id,
    'saida_venda',
    iv.quantidade,
    'Venda #' || NEW.numero,
    now()
  FROM item_venda iv
  WHERE iv.venda_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao criar venda
CREATE TRIGGER tr_venda_baixar_pecas
AFTER INSERT ON venda
FOR EACH ROW
EXECUTE FUNCTION baixar_pecas_venda();

-- ============================================================================
-- FUNÇÃO: Gerar número único para OS
-- ============================================================================

CREATE OR REPLACE FUNCTION gerar_numero_os()
RETURNS TRIGGER AS $$
DECLARE
  novo_numero TEXT;
  proximo_seq INT;
BEGIN
  -- Se número não foi fornecido, gera automaticamente
  IF NEW.numero IS NULL THEN
    -- Pega o maior número existente e incrementa
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 3) AS INT)), 0) + 1
    INTO proximo_seq
    FROM ordem_servico
    WHERE numero ~ '^OS[0-9]+$';
    
    NEW.numero := 'OS' || LPAD(proximo_seq::TEXT, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao criar OS
CREATE TRIGGER tr_ordem_servico_gerar_numero
BEFORE INSERT ON ordem_servico
FOR EACH ROW
EXECUTE FUNCTION gerar_numero_os();

-- ============================================================================
-- FUNÇÃO: Gerar número único para Venda
-- ============================================================================

CREATE OR REPLACE FUNCTION gerar_numero_venda()
RETURNS TRIGGER AS $$
DECLARE
  novo_numero TEXT;
  proximo_seq INT;
BEGIN
  -- Se número não foi fornecido, gera automaticamente
  IF NEW.numero IS NULL THEN
    -- Pega o maior número existente e incrementa
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 4) AS INT)), 0) + 1
    INTO proximo_seq
    FROM venda
    WHERE numero ~ '^VND[0-9]+$';
    
    NEW.numero := 'VND' || LPAD(proximo_seq::TEXT, 5, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao criar venda
CREATE TRIGGER tr_venda_gerar_numero
BEFORE INSERT ON venda
FOR EACH ROW
EXECUTE FUNCTION gerar_numero_venda();

-- ============================================================================
-- FUNÇÃO: Validar quantidade disponível antes de venda
-- ============================================================================

CREATE OR REPLACE FUNCTION validar_quantidade_venda()
RETURNS TRIGGER AS $$
DECLARE
  quantidade_disponivel INT;
BEGIN
  SELECT quantidade INTO quantidade_disponivel
  FROM produto
  WHERE id = NEW.produto_id;
  
  IF quantidade_disponivel IS NULL OR quantidade_disponivel < NEW.quantidade THEN
    RAISE EXCEPTION 'Quantidade insuficiente em estoque para produto %', NEW.produto_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao inserir item de venda
CREATE TRIGGER tr_item_venda_validar_quantidade
BEFORE INSERT ON item_venda
FOR EACH ROW
EXECUTE FUNCTION validar_quantidade_venda();

-- ============================================================================
-- VIEW: Produtos com alerta
-- ============================================================================

CREATE OR REPLACE VIEW vw_produtos_alerta AS
SELECT 
  id,
  nome,
  sku,
  tipo,
  quantidade,
  estoque_minimo,
  (estoque_minimo - quantidade) AS falta_para_minimo,
  alerta_ativo
FROM produto
WHERE alerta_ativo = true AND ativo = true
ORDER BY falta_para_minimo DESC;

-- ============================================================================
-- VIEW: OS vencidas
-- ============================================================================

CREATE OR REPLACE VIEW vw_os_vencidas AS
SELECT 
  os.id,
  os.numero,
  os.cliente_id,
  c.nome as cliente_nome,
  c.telefone,
  os.status,
  os.prazo_estimado,
  (CURRENT_DATE - os.prazo_estimado::date) as dias_vencimento
FROM ordem_servico os
JOIN cliente c ON os.cliente_id = c.id
WHERE os.prazo_estimado < CURRENT_DATE
  AND os.status NOT IN ('entregue', 'cancelada')
ORDER BY dias_vencimento DESC;

-- ============================================================================
-- VIEW: OS abertas por técnico
-- ============================================================================

CREATE OR REPLACE VIEW vw_os_por_tecnico AS
SELECT 
  u.id,
  u.nome as tecnico_nome,
  COUNT(CASE WHEN os.status IN ('aberta', 'em_diagnostico', 'em_reparo') THEN 1 END) as os_ativas,
  COUNT(CASE WHEN os.status = 'concluida' THEN 1 END) as os_concluidas,
  COUNT(CASE WHEN os.status = 'entregue' THEN 1 END) as os_entregues
FROM usuario u
LEFT JOIN ordem_servico os ON u.id = os.tecnico_id
WHERE u.perfil = 'tecnico' AND u.ativo = true
GROUP BY u.id, u.nome
ORDER BY os_ativas DESC;

-- ============================================================================
-- VIEW: Faturamento do mês
-- ============================================================================

CREATE OR REPLACE VIEW vw_faturamento_mes AS
SELECT 
  DATE_TRUNC('day', COALESCE(os.data_entrada, v.data))::DATE as data,
  COUNT(DISTINCT CASE WHEN os.orcamento_aprovado THEN os.id END) as os_aprovadas,
  SUM(CASE WHEN os.orcamento_aprovado THEN os.valor_orcamento ELSE 0 END) as receita_os,
  COUNT(DISTINCT v.id) as num_vendas,
  SUM(v.total) as receita_vendas,
  SUM(CASE WHEN os.orcamento_aprovado THEN os.valor_orcamento ELSE 0 END) +
    SUM(COALESCE(v.total, 0)) as receita_total
FROM ordem_servico os
FULL OUTER JOIN venda v ON DATE_TRUNC('day', os.data_entrada)::DATE = DATE_TRUNC('day', v.data)::DATE
WHERE DATE_TRUNC('month', COALESCE(os.data_entrada, v.data)) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE_TRUNC('day', COALESCE(os.data_entrada, v.data))::DATE
ORDER BY data DESC;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON FUNCTION verificar_estoque_baixo() IS 'Verifica se estoque está baixo e ativa alerta automático';
COMMENT ON FUNCTION atualizar_quantidade_produto() IS 'Atualiza quantidade de produto após movimento de estoque';
COMMENT ON FUNCTION baixar_pecas_ao_concluir() IS 'Cria movimentos de estoque automaticamente ao concluir OS';
COMMENT ON FUNCTION gerar_numero_os() IS 'Gera número único sequencial para nova OS (OS0001, OS0002, ...)';
COMMENT ON FUNCTION gerar_numero_venda() IS 'Gera número único sequencial para nova Venda (VND00001, VND00002, ...)';

COMMENT ON VIEW vw_produtos_alerta IS 'Produtos que estão com estoque abaixo do mínimo';
COMMENT ON VIEW vw_os_vencidas IS 'Ordens de serviço que venceram o prazo';
COMMENT ON VIEW vw_os_por_tecnico IS 'Relatório de OS por técnico (ativas, concluídas, entregues)';
COMMENT ON VIEW vw_faturamento_mes IS 'Faturamento do mês atual (OS + Vendas)';
