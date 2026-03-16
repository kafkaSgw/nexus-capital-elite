-- ============================================
-- NEXUS CAPITAL ELITE - NOVAS TABELAS
-- Execute no SQL Editor do Supabase
-- ============================================

-- ========== TABELA: ACCOUNTS (Contas Bancárias) ==========
CREATE TABLE IF NOT EXISTS accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment', 'wallet', 'credit')),
    bank TEXT,
    color TEXT DEFAULT '#2563EB',
    initial_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_accounts_name ON accounts(name);

-- Adicionar account_id e notes nas transactions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'transactions' AND column_name = 'account_id'
    ) THEN
        ALTER TABLE transactions ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'transactions' AND column_name = 'notes'
    ) THEN
        ALTER TABLE transactions ADD COLUMN notes TEXT;
    END IF;
END $$;

-- ========== TABELA: BUDGETS (Orçamento Mensal) ==========
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    limit_amount DECIMAL(15,2) NOT NULL CHECK (limit_amount > 0),
    month TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(category, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_budgets_month ON budgets(month);

-- ========== TABELA: FINANCIAL_GOALS (Metas Financeiras) ==========
CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0,
    deadline DATE NOT NULL,
    category TEXT DEFAULT 'savings' CHECK (category IN ('savings', 'investment', 'purchase', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_financial_goals" ON financial_goals FOR ALL USING (true) WITH CHECK (true);

-- ========== TABELA: DIVIDENDS ==========
CREATE TABLE IF NOT EXISTS dividends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    type TEXT DEFAULT 'dividend' CHECK (type IN ('dividend', 'jcp', 'rental')),
    payment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_dividends" ON dividends FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_dividends_asset ON dividends(asset_id);
CREATE INDEX idx_dividends_date ON dividends(payment_date DESC);

-- ========== TABELA: PRICE_HISTORY ==========
CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    price DECIMAL(15,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_price_history" ON price_history FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_price_history_asset_date ON price_history(asset_id, recorded_at DESC);

-- ========== DADOS DE EXEMPLO ==========

-- Contas
INSERT INTO accounts (name, type, bank, color, initial_balance) VALUES
('Conta Principal', 'checking', 'Nubank', '#8B5CF6', 5000.00),
('Poupança', 'savings', 'Itaú', '#10B981', 15000.00),
('Carteira', 'wallet', NULL, '#F59E0B', 500.00);

-- Orçamentos do mês atual
INSERT INTO budgets (category, limit_amount, month) VALUES
('Alimentação', 1500.00, TO_CHAR(NOW(), 'YYYY-MM')),
('Transporte', 500.00, TO_CHAR(NOW(), 'YYYY-MM')),
('Moradia', 3000.00, TO_CHAR(NOW(), 'YYYY-MM')),
('Lazer', 800.00, TO_CHAR(NOW(), 'YYYY-MM'));

-- Metas de exemplo
INSERT INTO financial_goals (title, target_amount, current_amount, deadline, category) VALUES
('Reserva de Emergência', 30000.00, 15000.00, '2026-12-31', 'savings'),
('Viagem Europa', 20000.00, 5000.00, '2027-06-30', 'purchase');

-- ========== TABELA: ACADEMY_PROFILES (XP e Progresso Pessoal) ==========
CREATE TABLE IF NOT EXISTS academy_profiles (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Ideia: associar ao auth.users quando implementar login
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    last_study_date DATE,
    completed_chapters TEXT[] DEFAULT '{}',
    badges TEXT[] DEFAULT '{}',
    last_studied_chapter_id TEXT,
    last_studied_subject_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE academy_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_academy_profiles" ON academy_profiles FOR ALL USING (true) WITH CHECK (true);

-- ========== TABELA: ACADEMY_SRS (Spaced Repetition Data) ==========
CREATE TABLE IF NOT EXISTS academy_srs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES academy_profiles(user_id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    interval INTEGER NOT NULL DEFAULT 1,
    ease_factor DECIMAL(5,2) NOT NULL DEFAULT 2.5,
    next_review DATE NOT NULL,
    repetitions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, card_id)
);

ALTER TABLE academy_srs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_academy_srs" ON academy_srs FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_academy_srs_next_review ON academy_srs(next_review);

-- ========== TABELA: ACADEMY_WRONG_ANSWERS (Caderno de Erros) ==========
CREATE TABLE IF NOT EXISTS academy_wrong_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES academy_profiles(user_id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    subject TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE academy_wrong_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_academy_wrong_answers" ON academy_wrong_answers FOR ALL USING (true) WITH CHECK (true);

-- ========== TABELA: ACADEMY_PAPER_TRADING ==========
CREATE TABLE IF NOT EXISTS academy_paper_trading (
    user_id UUID REFERENCES academy_profiles(user_id) ON DELETE CASCADE PRIMARY KEY,
    balance DECIMAL(15,2) DEFAULT 100000.00,
    positions JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE academy_paper_trading ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_academy_paper_trading" ON academy_paper_trading FOR ALL USING (true) WITH CHECK (true);

-- ========== VERIFICAÇÃO ==========
SELECT '✅ Novas tabelas criadas com sucesso!' as status;
SELECT 'accounts: ' || COUNT(*) || ' registros' as info FROM accounts;
SELECT 'budgets: ' || COUNT(*) || ' registros' as info FROM budgets;
SELECT 'financial_goals: ' || COUNT(*) || ' registros' as info FROM financial_goals;
SELECT 'dividends: ' || COUNT(*) || ' registros' as info FROM dividends;
SELECT 'price_history: ' || COUNT(*) || ' registros' as info FROM price_history;
