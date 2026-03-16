-- ============================================
-- NEXUS CAPITAL ELITE - MIGRAÇÃO DE AUTENTICAÇÃO
-- Execute no SQL Editor do Supabase
-- ============================================
-- IMPORTANTE: Execute DEPOIS de configurar a Autenticação
-- no Supabase Dashboard (Authentication > Settings)

-- ========== 1. ADICIONAR user_id EM TODAS AS TABELAS ==========

-- TRANSACTIONS
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'transactions' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ASSETS
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'assets' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE assets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- COMPANIES
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'companies' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE companies ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ACCOUNTS
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'accounts' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE accounts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- BUDGETS
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'budgets' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE budgets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- FINANCIAL_GOALS
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'financial_goals' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE financial_goals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- DIVIDENDS
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dividends' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE dividends ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- PRICE_HISTORY
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'price_history' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE price_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- SCHEDULED_TRANSACTIONS
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scheduled_transactions' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE scheduled_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ========== 2. ATUALIZAR academy_profiles.user_id PARA REFERENCIAR auth.users ==========
-- (O user_id já existe mas sem FK para auth.users)
DO $$ BEGIN
    -- Primeiro, remove registros existentes para evitar conflitos
    DELETE FROM academy_srs;
    DELETE FROM academy_wrong_answers;
    DELETE FROM academy_paper_trading;
    DELETE FROM academy_profiles;
END $$;

-- ========== 3. REMOVER POLÍTICAS ABERTAS ANTIGAS ==========

-- Drop all old open policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE policyname LIKE 'allow_all_%'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ========== 4. CRIAR POLÍTICAS RLS SEGURAS ==========

-- TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_transactions" ON transactions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ASSETS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_assets" ON assets
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- COMPANIES
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_companies" ON companies
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ACCOUNTS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_accounts" ON accounts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BUDGETS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_budgets" ON budgets
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FINANCIAL_GOALS
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_financial_goals" ON financial_goals
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DIVIDENDS
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dividends" ON dividends
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PRICE_HISTORY
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_price_history" ON price_history
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SCHEDULED_TRANSACTIONS
ALTER TABLE scheduled_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_scheduled_transactions" ON scheduled_transactions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ACADEMY_PROFILES
ALTER TABLE academy_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_academy_profiles" ON academy_profiles
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ACADEMY_SRS
ALTER TABLE academy_srs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_academy_srs" ON academy_srs
    FOR ALL USING (auth.uid() = (SELECT user_id FROM academy_profiles WHERE user_id = auth.uid()))
    WITH CHECK (auth.uid() = (SELECT user_id FROM academy_profiles WHERE user_id = auth.uid()));

-- ACADEMY_WRONG_ANSWERS
ALTER TABLE academy_wrong_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_academy_wrong_answers" ON academy_wrong_answers
    FOR ALL USING (auth.uid() = (SELECT user_id FROM academy_profiles WHERE user_id = auth.uid()))
    WITH CHECK (auth.uid() = (SELECT user_id FROM academy_profiles WHERE user_id = auth.uid()));

-- ACADEMY_PAPER_TRADING
ALTER TABLE academy_paper_trading ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_academy_paper_trading" ON academy_paper_trading
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========== 5. CRIAR ÍNDICES PARA user_id ==========

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_dividends_user_id ON dividends(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_user_id ON scheduled_transactions(user_id);

-- ========== VERIFICAÇÃO ==========
SELECT '✅ Migração de autenticação concluída!' as status;
SELECT 'Próximo passo: Crie um usuário no Supabase Auth e faça login no app.' as info;
