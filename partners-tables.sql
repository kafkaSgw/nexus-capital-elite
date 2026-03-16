-- ============================================
-- NEXUS CAPITAL ELITE - TABELAS DE SÓCIOS
-- Execute no SQL Editor do Supabase
-- ============================================

-- ========== TABELA: PARTNERS (Sócios) ==========
CREATE TABLE IF NOT EXISTS partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    share DECIMAL(15,2) NOT NULL DEFAULT 0,
    pro_labore DECIMAL(15,2) NOT NULL DEFAULT 0,
    withdrawals DECIMAL(15,2) NOT NULL DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_partners" ON partners FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_partners_user_id ON partners(user_id);

-- ========== TABELA: PROPOSALS (Votações) ==========
CREATE TABLE IF NOT EXISTS proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'approved', 'rejected')),
    votes_for INTEGER NOT NULL DEFAULT 0,
    votes_against INTEGER NOT NULL DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_proposals" ON proposals FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_proposals_user_id ON proposals(user_id);

-- ========== RESUMO ==========
SELECT '✅ Tabelas de Sócios (partners, proposals) criadas com sucesso!' as status;
