-- 001_init.sql
-- Criação das tabelas principais do sistema

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  perfil TEXT CHECK (perfil IN ('admin', 'tecnico', 'atendente')) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de ordens de serviço
CREATE TABLE IF NOT EXISTS ordem_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES cliente(id) ON DELETE RESTRICT,
  tecnico_id UUID REFERENCES usuario(id) ON DELETE SET NULL,
  atendente_id UUID REFERENCES usuario(id) ON DELETE SET NULL,
  numero TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'aberta' CHECK (status IN (
    'aberta', 'em_diagnostico', 'aguardando_aprovacao', 
    'em_reparo', 'concluida', 'entregue', 'cancelada'
  )),
  defeito_relatado TEXT NOT NULL,
  diagnostico TEXT,
  valor_orcamento DECIMAL(10,2),
  orcamento_aprovado BOOLEAN DEFAULT false,
  prazo_estimado DATE,
  data_entrada TIMESTAMPTZ DEFAULT now(),
  data_saida TIMESTAMPTZ,
  dias_garantia INT DEFAULT 90,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID REFERENCES ordem_servico(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('celular', 'notebook', 'tablet', 'console', 'outro')),
  marca TEXT,
  modelo TEXT,
  imei_serial TEXT,
  condicao_entrada TEXT,
  acessorios_entregues TEXT,
  fotos_url TEXT[],
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de produtos (peças, acessórios, aparelhos para venda)
CREATE TABLE IF NOT EXISTS produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  sku TEXT UNIQUE,
  tipo TEXT CHECK (tipo IN ('peca', 'acessorio', 'aparelho_venda')) NOT NULL,
  categoria TEXT,
  preco_custo DECIMAL(10,2),
  preco_venda DECIMAL(10,2),
  quantidade INT DEFAULT 0,
  estoque_minimo INT DEFAULT 0,
  alerta_ativo BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de itens usados em uma OS
CREATE TABLE IF NOT EXISTS item_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID REFERENCES ordem_servico(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produto(id) ON DELETE RESTRICT,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2),
  descricao TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de vendas (PDV)
CREATE TABLE IF NOT EXISTS venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES cliente(id) ON DELETE SET NULL,
  vendedor_id UUID REFERENCES usuario(id) ON DELETE RESTRICT,
  numero TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('acessorio', 'aparelho_semi_novo', 'aparelho_lacrado')),
  total DECIMAL(10,2),
  forma_pagamento TEXT,
  data TIMESTAMPTZ DEFAULT now(),
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de itens de venda
CREATE TABLE IF NOT EXISTS item_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES venda(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produto(id) ON DELETE RESTRICT,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2),
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de documentos gerados (PDFs)
CREATE TABLE IF NOT EXISTS documento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID REFERENCES ordem_servico(id) ON DELETE CASCADE,
  venda_id UUID REFERENCES venda(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('via_cliente', 'termo_garantia', 'recibo_venda')) NOT NULL,
  url_pdf TEXT,
  impresso BOOLEAN DEFAULT false,
  gerado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de movimentação de estoque
CREATE TABLE IF NOT EXISTS movimento_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES produto(id) ON DELETE RESTRICT,
  os_id UUID REFERENCES ordem_servico(id) ON DELETE SET NULL,
  venda_id UUID REFERENCES venda(id) ON DELETE SET NULL,
  tipo TEXT CHECK (tipo IN ('entrada', 'saida_os', 'saida_venda', 'ajuste')) NOT NULL,
  quantidade INT NOT NULL,
  motivo TEXT,
  data TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_ordem_servico_cliente ON ordem_servico(cliente_id);
CREATE INDEX idx_ordem_servico_tecnico ON ordem_servico(tecnico_id);
CREATE INDEX idx_ordem_servico_status ON ordem_servico(status);
CREATE INDEX idx_ordem_servico_data_entrada ON ordem_servico(data_entrada);
CREATE INDEX idx_equipamento_os ON equipamento(os_id);
CREATE INDEX idx_item_os_os ON item_os(os_id);
CREATE INDEX idx_item_venda_venda ON item_venda(venda_id);
CREATE INDEX idx_movimento_estoque_produto ON movimento_estoque(produto_id);
CREATE INDEX idx_documento_os ON documento(os_id);

-- Comentários (para documentação)
COMMENT ON TABLE ordem_servico IS 'Coração do sistema: cada reparo registrado como uma OS';
COMMENT ON TABLE produto IS 'Peças (uso interno), acessórios e aparelhos para venda';
COMMENT ON TABLE movimento_estoque IS 'Rastreabilidade: qual peça foi usada em qual OS por qual técnico';
