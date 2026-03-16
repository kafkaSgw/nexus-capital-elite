-- ============================================
-- NEXUS CAPITAL ELITE - RLS USER POLICIES
-- Execute no SQL Editor do Supabase para reforçar a segurança
-- ============================================

-- Função utilitária para limpar policies antigas inseguras (usadas apenas para desenvolvimento)
-- DROPS DE POLICIES ANTIGAS
DROP POLICY IF EXISTS "allow_all_transactions" ON transactions;
DROP POLICY IF EXISTS "allow_all_assets" ON assets;
DROP POLICY IF EXISTS "allow_all_companies" ON companies;
DROP POLICY IF EXISTS "allow_all_accounts" ON accounts;
DROP POLICY IF EXISTS "allow_all_budgets" ON budgets;
DROP POLICY IF EXISTS "allow_all_financial_goals" ON financial_goals;
DROP POLICY IF EXISTS "allow_all_dividends" ON dividends;
DROP POLICY IF EXISTS "allow_all_price_history" ON price_history;
DROP POLICY IF EXISTS "allow_all_scheduled_transactions" ON scheduled_transactions;
DROP POLICY IF EXISTS "allow_all_partners" ON partners;
DROP POLICY IF EXISTS "allow_all_proposals" ON proposals;

-- Certificando que todas as tabelas possuem user_id e foreign key
-- (Isso assume que as colunas já existem e são UUID)

-- ============================================
-- CRIAÇÃO DE POLICIES RESTRICTION (auth.uid() = user_id)
-- ============================================

-- Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_transactions" ON transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_assets" ON assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_companies" ON companies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_accounts" ON accounts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_budgets" ON budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Financial Goals
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_financial_goals" ON financial_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Dividends
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_dividends" ON dividends FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Price History
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_price_history" ON price_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Scheduled Transactions
ALTER TABLE scheduled_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_scheduled_transactions" ON scheduled_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Partners
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_partners" ON partners FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Proposals
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_proposals" ON proposals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
SELECT '✅ Políticas RLS restritas ao auth.uid() criadas com sucesso!' as status;
