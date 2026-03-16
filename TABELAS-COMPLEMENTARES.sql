-- ============================================
-- NEXUS CAPITAL ELITE - TABELAS COMPLEMENTARES
-- Copie TUDO e execute no SQL Editor do Supabase
-- (depois de já ter executado o RESET-COMPLETO.sql)
-- ============================================

-- ========== TABELA: COMPANIES ==========
-- Usada em: Holding, Dashboard, TransactionModal, CompaniesDashboard

DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    cnpj TEXT,
    description TEXT,
    avatar_color TEXT DEFAULT '#2563EB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_companies"
ON companies
FOR ALL
USING (true)
WITH CHECK (true);

CREATE INDEX idx_companies_name ON companies(name);

-- Adicionar FK de company_id nas transactions (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_transactions_company'
    ) THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT fk_transactions_company 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'FK já existe ou não pode ser criada: %', SQLERRM;
END $$;


-- ========== TABELA: SCHEDULED_TRANSACTIONS ==========
-- Usada em: CashFlowProjection (Fluxo de Caixa)

DROP TABLE IF EXISTS scheduled_transactions CASCADE;

CREATE TABLE scheduled_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL DEFAULT 'Outros',
    due_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'monthly', 'yearly')),
    is_paid BOOLEAN DEFAULT FALSE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE scheduled_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_scheduled_transactions"
ON scheduled_transactions
FOR ALL
USING (true)
WITH CHECK (true);

CREATE INDEX idx_scheduled_due_date ON scheduled_transactions(due_date);
CREATE INDEX idx_scheduled_is_paid ON scheduled_transactions(is_paid);


-- ========== TABELA: TRANSACTION_ATTACHMENTS ==========
-- Usada em: TransactionModal (anexos de comprovantes)

DROP TABLE IF EXISTS transaction_attachments CASCADE;

CREATE TABLE transaction_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE transaction_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_transaction_attachments"
ON transaction_attachments
FOR ALL
USING (true)
WITH CHECK (true);


-- ========== DADOS DE EXEMPLO ==========

-- Empresas de exemplo
INSERT INTO companies (name, cnpj, description, avatar_color) VALUES
('Interpira', '12.345.678/0001-01', 'Agência de marketing digital', '#2563EB'),
('TikTok Projects', '12.345.678/0001-02', 'Projetos e conteúdo TikTok', '#EC4899'),
('Afiliados Corp', NULL, 'Programas de afiliados', '#10B981');

-- Transações agendadas de exemplo
INSERT INTO scheduled_transactions (description, amount, type, category, due_date, is_recurring, recurrence_type) VALUES
('Aluguel', -2000.00, 'expense', 'Moradia', CURRENT_DATE + INTERVAL '5 days', true, 'monthly'),
('Internet', -150.00, 'expense', 'Moradia', CURRENT_DATE + INTERVAL '10 days', true, 'monthly'),
('Recebimento Cliente ABC', 3500.00, 'income', 'Interpira', CURRENT_DATE + INTERVAL '15 days', false, NULL),
('Plano de Saúde', -450.00, 'expense', 'Saúde', CURRENT_DATE + INTERVAL '20 days', true, 'monthly');


-- ========== VERIFICAÇÃO ==========
SELECT '✅ Tabelas complementares criadas!' as status;
SELECT 'companies: ' || COUNT(*) || ' registros' as info FROM companies;
SELECT 'scheduled_transactions: ' || COUNT(*) || ' registros' as info FROM scheduled_transactions;
SELECT 'transaction_attachments: ' || COUNT(*) || ' registros' as info FROM transaction_attachments;
