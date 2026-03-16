import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Prevent crash if environment variables are missing during build/runtime
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

if (!supabase) {
  console.warn('Supabase env variables are missing. Check your Vercel settings.');
}

// Helper to get the current user's ID
const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return user.id
}

// ======================== TYPES ========================

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  company_id?: string | null
  account_id?: string | null
  notes?: string | null
  user_id?: string
  created_at: string
}

export interface Asset {
  id: string
  ticker: string
  classe: 'Stocks' | 'Crypto' | 'Ações' | 'Criptomoedas' | 'FIIs' | 'BDRs' | 'ETFs'
  quantidade: number
  preco_medio: number
  preco_atual: number
  user_id?: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  cnpj?: string
  description?: string
  avatar_color?: string
  user_id?: string
  created_at: string
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'investment' | 'wallet' | 'credit'
  bank?: string | null
  color: string
  initial_balance: number
  user_id?: string
  created_at: string
}

export interface CostCenter {
  id: string
  name: string
  company: string
  budget: number
  spent: number
  status: 'active' | 'completed' | 'paused'
  user_id?: string
  created_at: string
}

export interface Budget {
  id: string
  category: string
  limit_amount: number
  month: string
  user_id?: string
  created_at: string
}

export interface FinancialGoal {
  id: string
  title: string
  target_amount: number
  current_amount: number
  deadline: string
  category: 'savings' | 'investment' | 'purchase' | 'other'
  user_id?: string
  created_at: string
}

export interface Dividend {
  id: string
  asset_id: string
  amount: number
  type: 'dividend' | 'jcp' | 'rental'
  payment_date: string
  user_id?: string
  created_at: string
}

export interface PriceHistoryRecord {
  id: string
  asset_id: string
  price: number
  user_id?: string
  recorded_at: string
}

export interface ScheduledTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  due_date: string
  is_recurring: boolean
  recurrence_type?: 'weekly' | 'monthly' | 'yearly' | null
  is_paid: boolean
  company_id?: string | null
  user_id?: string
  created_at: string
}

// ======================== TRANSACTIONS ========================

export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Transaction[]
}

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...transaction, user_id }])
    .select()

  if (error) throw error
  return data[0] as Transaction
}

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Transaction
}

// ======================== ASSETS ========================

export const getAssets = async () => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('ticker', { ascending: true })

  if (error) throw error
  return data as Asset[]
}

export const createAsset = async (asset: Omit<Asset, 'id' | 'updated_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('assets')
    .insert([{ ...asset, user_id }])
    .select()

  if (error) throw error
  return data[0] as Asset
}

export const updateAssetPrice = async (id: string, preco_atual: number) => {
  const { data, error } = await supabase
    .from('assets')
    .update({ preco_atual, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Asset
}

export const deleteAsset = async (id: string) => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ======================== COMPANIES ========================

export const getCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data as Company[]
}

export const createCompany = async (company: Omit<Company, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('companies')
    .insert([{ ...company, user_id }])
    .select()

  if (error) throw error
  return data[0] as Company
}

export const updateCompany = async (id: string, updates: Partial<Company>) => {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Company
}

export const deleteCompany = async (id: string) => {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ======================== ACCOUNTS ========================

export const getAccounts = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data as Account[]
}

export const createAccount = async (account: Omit<Account, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('accounts')
    .insert([{ ...account, user_id }])
    .select()

  if (error) throw error
  return data[0] as Account
}

export const updateAccount = async (id: string, updates: Partial<Account>) => {
  const { data, error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Account
}

export const deleteAccount = async (id: string) => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ======================== BUDGETS ========================

export const getBudgets = async (month: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', month)
    .order('category', { ascending: true })

  if (error) throw error
  return data as Budget[]
}

export const createBudget = async (budget: Omit<Budget, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('budgets')
    .insert([{ ...budget, user_id }])
    .select()

  if (error) throw error
  return data[0] as Budget
}

export const updateBudget = async (id: string, updates: Partial<Budget>) => {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Budget
}

export const deleteBudget = async (id: string) => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ======================== FINANCIAL GOALS ========================

export const getFinancialGoals = async () => {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .order('deadline', { ascending: true })

  if (error) throw error
  return data as FinancialGoal[]
}

export const createFinancialGoal = async (goal: Omit<FinancialGoal, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('financial_goals')
    .insert([{ ...goal, user_id }])
    .select()

  if (error) throw error
  return data[0] as FinancialGoal
}

export const updateFinancialGoal = async (id: string, updates: Partial<FinancialGoal>) => {
  const { data, error } = await supabase
    .from('financial_goals')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as FinancialGoal
}

export const deleteFinancialGoal = async (id: string) => {
  const { error } = await supabase
    .from('financial_goals')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ======================== COST CENTERS ========================

export const getCostCenters = async () => {
  const { data, error } = await supabase
    .from('cost_centers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as CostCenter[]
}

export const createCostCenter = async (center: Omit<CostCenter, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('cost_centers')
    .insert([{ ...center, user_id }])
    .select()

  if (error) throw error
  return data[0] as CostCenter
}

export const updateCostCenter = async (id: string, updates: Partial<CostCenter>) => {
  const { data, error } = await supabase
    .from('cost_centers')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as CostCenter
}

export const deleteCostCenter = async (id: string) => {
  const { error } = await supabase
    .from('cost_centers')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ======================== DIVIDENDS ========================

export const getDividends = async () => {
  const { data, error } = await supabase
    .from('dividends')
    .select('*')
    .order('payment_date', { ascending: false })

  if (error) throw error
  return data as Dividend[]
}

export const createDividend = async (dividend: Omit<Dividend, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('dividends')
    .insert([{ ...dividend, user_id }])
    .select()

  if (error) throw error
  return data[0] as Dividend
}

export const deleteDividend = async (id: string) => {
  const { error } = await supabase
    .from('dividends')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ======================== PRICE HISTORY ========================

export const getPriceHistory = async (assetId: string, days: number = 30) => {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('asset_id', assetId)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true })

  if (error) throw error
  return data as PriceHistoryRecord[]
}

export const addPriceHistory = async (assetId: string, price: number) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('price_history')
    .insert([{ asset_id: assetId, price, user_id }])
    .select()

  if (error) throw error
  return data[0] as PriceHistoryRecord
}

// ======================== SCHEDULED TRANSACTIONS ========================

export const getScheduledTransactions = async () => {
  const { data, error } = await supabase
    .from('scheduled_transactions')
    .select('*')
    .order('due_date', { ascending: true })

  if (error) throw error
  return data as ScheduledTransaction[]
}

export const createScheduledTransaction = async (st: Omit<ScheduledTransaction, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('scheduled_transactions')
    .insert([{ ...st, user_id }])
    .select()

  if (error) throw error
  return data[0] as ScheduledTransaction
}

export const updateScheduledTransaction = async (id: string, updates: Partial<ScheduledTransaction>) => {
  const { data, error } = await supabase
    .from('scheduled_transactions')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as ScheduledTransaction
}

export const deleteScheduledTransaction = async (id: string) => {
  const { error } = await supabase
    .from('scheduled_transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ======================== PARTNERS & PROPOSALS ========================

export interface Partner {
  id: string
  name: string
  share: number
  pro_labore: number
  withdrawals: number
  user_id?: string
  created_at?: string
}

export interface Proposal {
  id: string
  title: string
  description?: string
  status: 'active' | 'approved' | 'rejected'
  votes_for: number
  votes_against: number
  user_id?: string
  created_at?: string
}

export const getPartners = async () => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Partner[]
}

export const createPartner = async (partner: Omit<Partner, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('partners')
    .insert([{ ...partner, user_id }])
    .select()

  if (error) throw error
  return data[0] as Partner
}

export const updatePartner = async (id: string, updates: Partial<Partner>) => {
  const { data, error } = await supabase
    .from('partners')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Partner
}

export const deletePartner = async (id: string) => {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getProposals = async () => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Proposal[]
}

export const createProposal = async (proposal: Omit<Proposal, 'id' | 'created_at' | 'user_id'>) => {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from('proposals')
    .insert([{ ...proposal, user_id }])
    .select()

  if (error) throw error
  return data[0] as Proposal
}

export const updateProposal = async (id: string, updates: Partial<Proposal>) => {
  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Proposal
}

export const deleteProposal = async (id: string) => {
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id)

  if (error) throw error
}
