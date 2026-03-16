-- -------------------------------------------------------------
-- Nexus Capital: WhatsApp Integration MVP
-- -------------------------------------------------------------

-- 1. Create the whatsapp_transactions table
CREATE TABLE IF NOT EXISTS public.whatsapp_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    whatsapp_number TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    category TEXT NOT NULL,
    project_company TEXT DEFAULT 'Geral',
    transaction_type TEXT NOT NULL, -- 'Entrada' or 'Saída'
    original_message TEXT NOT NULL
);

-- 2. Add Row Level Security (RLS) policies
-- This ensures only authenticated users can access the data, 
-- but we'll also allow inserts from the backend service role
ALTER TABLE public.whatsapp_transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all transactions
CREATE POLICY "Enable read access for all users"
    ON public.whatsapp_transactions FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert (mostly for backend service role, but good practice)
CREATE POLICY "Enable insert access for all users"
    ON public.whatsapp_transactions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Grant permissions to the anon and authenticated roles
GRANT ALL ON TABLE public.whatsapp_transactions TO anon;
GRANT ALL ON TABLE public.whatsapp_transactions TO authenticated;
GRANT ALL ON TABLE public.whatsapp_transactions TO service_role;
