-- ============================================
-- NEXUS CAPITAL ELITE - RESTAURAÇÃO COMPLETA DO BANCO
-- ============================================
-- Instruções: Copie este arquivo inteiro e execute
-- no SQL Editor do Supabase de uma só vez.
-- ============================================

-- ============================================
-- 1. RESET INICIAL E TABELAS BASE (transactions, assets)
-- ============================================
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticker TEXT NOT NULL,
    classe TEXT NOT NULL CHECK (classe IN ('Stocks', 'Crypto')),
    quantidade DECIMAL(20,8) NOT NULL CHECK (quantidade > 0),
    preco_medio DECIMAL(15,2) NOT NULL CHECK (preco_medio > 0),
    preco_atual DECIMAL(15,2) NOT NULL CHECK (preco_atual > 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_assets_ticker ON assets(ticker);
CREATE INDEX idx_assets_updated_at ON assets(updated_at DESC);

-- ============================================
-- 2. TABELAS COMPLEMENTARES (companies, scheduled_transactions, attachments)
-- ============================================
DROP TABLE IF EXISTS companies CASCADE;
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    cnpj TEXT,
    description TEXT,
    avatar_color TEXT DEFAULT '#2563EB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_companies_name ON companies(name);

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

CREATE INDEX idx_scheduled_due_date ON scheduled_transactions(due_date);
CREATE INDEX idx_scheduled_is_paid ON scheduled_transactions(is_paid);

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

-- ============================================
-- 3. NOVAS TABELAS (accounts, budgets, goals, dividends, etc)
-- ============================================

CREATE TABLE IF NOT EXISTS accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment', 'wallet', 'credit')),
    bank TEXT,
    color TEXT DEFAULT '#2563EB',
    initial_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_accounts_name ON accounts(name);

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

CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    limit_amount DECIMAL(15,2) NOT NULL CHECK (limit_amount > 0),
    month TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(category, month)
);
CREATE INDEX idx_budgets_month ON budgets(month);

CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0,
    deadline DATE NOT NULL,
    category TEXT DEFAULT 'savings' CHECK (category IN ('savings', 'investment', 'purchase', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS dividends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    type TEXT DEFAULT 'dividend' CHECK (type IN ('dividend', 'jcp', 'rental')),
    payment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_dividends_asset ON dividends(asset_id);
CREATE INDEX idx_dividends_date ON dividends(payment_date DESC);

CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    price DECIMAL(15,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_price_history_asset_date ON price_history(asset_id, recorded_at DESC);

-- ============================================
-- 4. TABELAS DA ACADEMY
-- ============================================

CREATE TABLE IF NOT EXISTS academy_profiles (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE INDEX idx_academy_srs_next_review ON academy_srs(next_review);

CREATE TABLE IF NOT EXISTS academy_wrong_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES academy_profiles(user_id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    subject TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS academy_paper_trading (
    user_id UUID REFERENCES academy_profiles(user_id) ON DELETE CASCADE PRIMARY KEY,
    balance DECIMAL(15,2) DEFAULT 100000.00,
    positions JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- 5. TABELAS PARTNERS & WHATSAPP
-- ============================================

CREATE TABLE IF NOT EXISTS partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    share DECIMAL(15,2) NOT NULL DEFAULT 0,
    pro_labore DECIMAL(15,2) NOT NULL DEFAULT 0,
    withdrawals DECIMAL(15,2) NOT NULL DEFAULT 0,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'approved', 'rejected')),
    votes_for INTEGER NOT NULL DEFAULT 0,
    votes_against INTEGER NOT NULL DEFAULT 0,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.whatsapp_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    whatsapp_number TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    category TEXT NOT NULL,
    project_company TEXT DEFAULT 'Geral',
    transaction_type TEXT NOT NULL,
    original_message TEXT NOT NULL
);

-- ============================================
-- 5b. TABELAS DE CARTÕES DE CRÉDITO
-- ============================================

CREATE TABLE IF NOT EXISTS credit_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    last_four TEXT NOT NULL,
    brand TEXT NOT NULL,
    credit_limit DECIMAL(15,2) NOT NULL CHECK (credit_limit > 0),
    used_amount DECIMAL(15,2) DEFAULT 0,
    closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
    due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    color TEXT DEFAULT 'from-blue-600 to-blue-800',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);

CREATE TABLE IF NOT EXISTS card_installments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    installment_amount DECIMAL(15,2) NOT NULL,
    total_installments INTEGER NOT NULL,
    current_installment INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_card_installments_card_id ON card_installments(card_id);

-- ============================================
-- 6. DADOS INICIAIS (OPCIONAL)
-- ============================================

INSERT INTO transactions (description, amount, type, category, created_at) VALUES
('Salário', 5000.00, 'income', 'Salário', NOW() - INTERVAL '5 days'),
('Uber', -85.00, 'expense', 'Transporte', NOW() - INTERVAL '2 days');

INSERT INTO accounts (name, type, bank, color, initial_balance) VALUES
('Conta Principal', 'checking', 'Nubank', '#8B5CF6', 5000.00),
('Poupança', 'savings', 'Itaú', '#10B981', 15000.00);

-- ============================================
-- 7. MIGRAÇÃO DE AUTENTICAÇÃO E RLS
-- ============================================

-- Adiciona user_id nas tabelas
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id') THEN
        ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'user_id') THEN
        ALTER TABLE assets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'user_id') THEN
        ALTER TABLE companies ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'user_id') THEN
        ALTER TABLE accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budgets' AND column_name = 'user_id') THEN
        ALTER TABLE budgets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_goals' AND column_name = 'user_id') THEN
        ALTER TABLE financial_goals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dividends' AND column_name = 'user_id') THEN
        ALTER TABLE dividends ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'price_history' AND column_name = 'user_id') THEN
        ALTER TABLE price_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scheduled_transactions' AND column_name = 'user_id') THEN
        ALTER TABLE scheduled_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_partners_user') THEN
        ALTER TABLE partners ADD CONSTRAINT fk_partners_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_proposals_user') THEN
        ALTER TABLE proposals ADD CONSTRAINT fk_proposals_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; END IF;
END $$;

-- Habilita RLS em todas
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_srs ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_wrong_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_paper_trading ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_installments ENABLE ROW LEVEL SECURITY;

-- Limpa políticas antigas
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE policyname LIKE 'allow_all_%' OR policyname LIKE 'user_%' OR policyname LIKE 'users_own_%') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Cria políticas RLS restritas para o usuário logado
CREATE POLICY "users_own_transactions" ON transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_assets" ON assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_companies" ON companies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_accounts" ON accounts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_budgets" ON budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_financial_goals" ON financial_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_dividends" ON dividends FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_price_history" ON price_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_scheduled_transactions" ON scheduled_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_transaction_attachments" ON transaction_attachments FOR ALL USING (true) WITH CHECK (true); -- Anexos podem precisar de regras específicas via bucket
CREATE POLICY "users_own_partners" ON partners FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_proposals" ON proposals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable all check for academy_profiles" ON academy_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_academy_srs" ON academy_srs FOR ALL USING (auth.uid() = (SELECT user_id FROM academy_profiles WHERE user_id = auth.uid())) WITH CHECK (auth.uid() = (SELECT user_id FROM academy_profiles WHERE user_id = auth.uid()));
CREATE POLICY "users_own_academy_wrong_answers" ON academy_wrong_answers FOR ALL USING (auth.uid() = (SELECT user_id FROM academy_profiles WHERE user_id = auth.uid())) WITH CHECK (auth.uid() = (SELECT user_id FROM academy_profiles WHERE user_id = auth.uid()));
CREATE POLICY "users_own_academy_paper_trading" ON academy_paper_trading FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for whatsapp" ON public.whatsapp_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for whatsapp" ON public.whatsapp_transactions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "users_own_credit_cards" ON credit_cards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_card_installments" ON card_installments FOR ALL USING (
  card_id IN (SELECT id FROM credit_cards WHERE user_id = auth.uid())
) WITH CHECK (
  card_id IN (SELECT id FROM credit_cards WHERE user_id = auth.uid())
);

-- Permissões
GRANT ALL ON TABLE public.whatsapp_transactions TO anon;
GRANT ALL ON TABLE public.whatsapp_transactions TO authenticated;
GRANT ALL ON TABLE public.whatsapp_transactions TO service_role;

-- Criação de Índices
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_dividends_user_id ON dividends(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_user_id ON scheduled_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);

SELECT '✅ Banco de dados recriado com sucesso com Autenticação e RLS!' as status;
