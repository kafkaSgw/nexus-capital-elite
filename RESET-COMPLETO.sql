-- ============================================
-- NEXUS CAPITAL ELITE - RESET COMPLETO
-- Copie TUDO e execute no SQL Editor do Supabase
-- ============================================

-- PASSO 1: DELETAR TUDO (limpa qualquer coisa anterior)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir tudo em transactions" ON transactions;
DROP POLICY IF EXISTS "Permitir tudo em assets" ON assets;
DROP POLICY IF EXISTS "Enable all access for transactions" ON transactions;
DROP POLICY IF EXISTS "Enable all access for assets" ON assets;

-- PASSO 2: CRIAR TABELA DE TRANSAÇÕES
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- PASSO 3: CRIAR TABELA DE ATIVOS
CREATE TABLE assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticker TEXT NOT NULL,
    classe TEXT NOT NULL CHECK (classe IN ('Stocks', 'Crypto')),
    quantidade DECIMAL(20,8) NOT NULL CHECK (quantidade > 0),
    preco_medio DECIMAL(15,2) NOT NULL CHECK (preco_medio > 0),
    preco_atual DECIMAL(15,2) NOT NULL CHECK (preco_atual > 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- PASSO 4: HABILITAR ROW LEVEL SECURITY
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- PASSO 5: CRIAR POLÍTICAS DE ACESSO (permite tudo)
CREATE POLICY "allow_all_transactions" 
ON transactions 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "allow_all_assets" 
ON assets 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- PASSO 6: CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_assets_ticker ON assets(ticker);
CREATE INDEX idx_assets_updated_at ON assets(updated_at DESC);

-- PASSO 7: INSERIR DADOS DE TESTE
INSERT INTO transactions (description, amount, type, category, created_at) VALUES
('Salário Janeiro', 5000.00, 'income', 'Salário', NOW() - INTERVAL '30 days'),
('Projeto Cliente ABC', 3500.00, 'income', 'Interpira', NOW() - INTERVAL '25 days'),
('Vídeo Patrocinado', 2000.00, 'income', 'TikTok', NOW() - INTERVAL '20 days'),
('Comissão Produtos', 1200.00, 'income', 'Afiliados', NOW() - INTERVAL '15 days'),
('Freelance Site', 1800.00, 'income', 'Freelance', NOW() - INTERVAL '10 days'),
('Supermercado', -450.00, 'expense', 'Alimentação', NOW() - INTERVAL '28 days'),
('Aluguel Janeiro', -2000.00, 'expense', 'Moradia', NOW() - INTERVAL '27 days'),
('Uber', -85.00, 'expense', 'Transporte', NOW() - INTERVAL '22 days'),
('Restaurante', -120.00, 'expense', 'Alimentação', NOW() - INTERVAL '18 days'),
('Cinema', -60.00, 'expense', 'Lazer', NOW() - INTERVAL '12 days'),
('Salário Fevereiro', 5000.00, 'income', 'Salário', NOW() - INTERVAL '5 days'),
('Projeto Cliente XYZ', 4200.00, 'income', 'Interpira', NOW() - INTERVAL '3 days'),
('TikTok Creator Fund', 1500.00, 'income', 'TikTok', NOW() - INTERVAL '2 days'),
('Mercado', -380.00, 'expense', 'Alimentação', NOW() - INTERVAL '1 day');

INSERT INTO assets (ticker, classe, quantidade, preco_medio, preco_atual) VALUES
('PETR4', 'Stocks', 100, 38.50, 38.50),
('VALE3', 'Stocks', 50, 65.00, 65.00),
('ITUB4', 'Stocks', 200, 28.00, 28.00),
('BTC', 'Crypto', 0.1, 250000.00, 250000.00),
('ETH', 'Crypto', 1.5, 12000.00, 12000.00);

-- VERIFICAÇÃO FINAL
SELECT 'Setup completo com sucesso!' as status;
SELECT 'Tabela transactions: ' || COUNT(*) || ' registros' as info FROM transactions;
SELECT 'Tabela assets: ' || COUNT(*) || ' registros' as info FROM assets;

-- Mostrar dados inseridos
SELECT 'TRANSAÇÕES:' as tipo;
SELECT description, amount, type, category FROM transactions ORDER BY created_at DESC LIMIT 5;

SELECT 'ATIVOS:' as tipo;
SELECT ticker, classe, quantidade, preco_atual FROM assets;
