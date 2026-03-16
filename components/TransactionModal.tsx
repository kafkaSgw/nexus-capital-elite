'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, Repeat, X, AlertCircle, FileText, Upload, RefreshCw, HandCoins, Paperclip, CalendarClock } from 'lucide-react'
import { createTransaction, updateTransaction, createScheduledTransaction, Transaction, Account, supabase } from '@/lib/supabase'
import { addXP } from './XPSystem'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingTransaction?: Transaction | null
}

const CATEGORIES = [
  'Interpira', 'TikTok', 'Afiliados', 'Salário', 'Freelance',
  'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'
]

const TEMPLATES = [
  { name: 'Conta de Água', description: 'Pagamento Sabesp', amount: '', category: 'Moradia', type: 'expense' },
  { name: 'Conta de Luz', description: 'Pagamento Enel', amount: '', category: 'Moradia', type: 'expense' },
  { name: 'Internet', description: 'Pagamento Vivo/Claro', amount: '120', category: 'Moradia', type: 'expense' },
  { name: 'Salário Mensal', description: 'Salário Ref. Mês', amount: '', category: 'Salário', type: 'income' },
]

export default function TransactionModal({ isOpen, onClose, onSuccess, editingTransaction }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    category: 'Outros',
    company_id: '',
    account_id: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [companies, setCompanies] = useState<any[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<any[]>([])
  // Recurring fields
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceType, setRecurrenceType] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [dueDate, setDueDate] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!editingTransaction

  useEffect(() => {
    if (isOpen) {
      loadCompanies()
      loadAccounts()
      setTimeout(() => inputRef.current?.focus(), 100)

      if (editingTransaction) {
        setFormData({
          description: editingTransaction.description,
          amount: Math.abs(editingTransaction.amount).toString(),
          type: editingTransaction.type,
          category: editingTransaction.category,
          company_id: editingTransaction.company_id || '',
          account_id: editingTransaction.account_id || '',
          notes: editingTransaction.notes || ''
        })
        // loadExistingAttachments(editingTransaction.id) // Commented out as storage is not set up
      } else {
        resetForm()
      }
    }
  }, [isOpen, editingTransaction])

  const loadCompanies = async () => {
    try {
      const { data } = await supabase.from('companies').select('*').order('name')
      if (data) setCompanies(data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const loadAccounts = async () => {
    try {
      const { data } = await supabase.from('accounts').select('*').order('name')
      if (data) setAccounts(data)
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
    }
  }

  // const loadExistingAttachments = async (transactionId: string) => { // Commented out as storage is not set up
  //   try {
  //     const { data } = await supabase
  //       .from('transaction_attachments')
  //       .select('*')
  //       .eq('transaction_id', transactionId)
  //     if (data) setExistingAttachments(data)
  //   } catch (error) {
  //     console.error('Erro ao carregar anexos:', error)
  //   }
  // }

  const resetForm = () => {
    setFormData({ description: '', amount: '', type: 'income', category: 'Outros', company_id: '', account_id: '', notes: '' })
    setAttachments([])
    setExistingAttachments([])
    setIsRecurring(false)
    setRecurrenceType('monthly')
    setDueDate('')
    setError('')
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.description.trim() || formData.description.trim().length < 2) {
        setError('Descrição deve ter no mínimo 2 caracteres')
        setLoading(false)
        return
      }

      if (!formData.category) {
        setError('Selecione uma categoria')
        setLoading(false)
        return
      }

      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        setError('Valor inválido')
        setLoading(false)
        return
      }

      const txData = {
        description: formData.description,
        amount: formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        type: formData.type,
        category: formData.category,
        company_id: formData.company_id || null,
        account_id: formData.account_id || null,
        notes: formData.notes || null
      }

      let transactionId: string | undefined

      if (isEditMode && editingTransaction) {
        const updated = await updateTransaction(editingTransaction.id, txData)
        transactionId = updated?.id
      } else {
        const created = await createTransaction(txData)
        transactionId = created?.id

        // Also create scheduled if recurring
        if (isRecurring && dueDate) {
          await createScheduledTransaction({
            description: formData.description,
            amount: txData.amount,
            type: formData.type,
            category: formData.category,
            due_date: dueDate,
            is_recurring: true,
            recurrence_type: recurrenceType,
            is_paid: false,
            company_id: formData.company_id || null
          })
          addXP(50, 'Created recurring transaction')
        } else {
          addXP(20, 'Created transaction')
        }
      }

      // Upload new attachments - commented out as storage is not set up
      /*
      if (attachments.length > 0 && transactionId) {
        for (const file of attachments) {
          try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${transactionId}/${fileName}`

            const { error: uploadError } = await supabase.storage
              .from('transaction-attachments')
              .upload(filePath, file)

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('transaction-attachments')
                .getPublicUrl(filePath)

              await supabase.from('transaction_attachments').insert({
                transaction_id: transactionId,
                file_name: file.name,
                file_url: publicUrl,
                file_type: file.type,
                file_size: file.size
              })
            }
          } catch (err) {
            console.error('Erro ao fazer upload:', err)
          }
        }
      }
      */

      resetForm()
      onSuccess()
      onClose()
      toast.success(isEditMode ? 'Transação atualizada!' : 'Transação adicionada!')
    } catch (err) {
      console.error('Erro ao salvar transação:', err)
      setError('Erro ao salvar transação')
      toast.error('Erro ao salvar transação')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveExistingAttachment = async (attachmentId: string) => {
    try {
      /*
      await supabase.from('transaction_attachments').delete().eq('id', attachmentId)
      setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId))
      */
      toast.error('Sistema de anexos indisponível.')
    } catch (err) {
      console.error('Erro ao remover anexo:', err)
      toast.error('Erro ao remover anexo')
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card-premium w-full max-w-md max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border flex-shrink-0">
          <h2 className="text-xl font-bold text-white">
            {isEditMode ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Templates (only for new) */}
          {!isEditMode && (
            <div>
              <label className="label-premium">Acesso Rápido</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mt-1">
                {TEMPLATES.map(t => (
                  <button key={t.name} type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      description: t.description,
                      amount: t.amount,
                      category: t.category,
                      type: t.type as 'expense' | 'income'
                    }))}
                    className="px-3 py-1.5 flex-shrink-0 text-sm bg-dark-card hover:bg-primary/20 border border-dark-border hover:border-primary/50 rounded-lg transition-colors whitespace-nowrap text-gray-300"
                  >
                    ⚡ {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3">
              <p className="text-sm text-accent-red">{error}</p>
            </div>
          )}

          {/* Tipo */}
          <div>
            <label className="label-premium">Tipo</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${formData.type === 'income'
                  ? 'bg-accent-green/20 border-2 border-accent-green text-accent-green'
                  : 'bg-dark-card border border-dark-border text-gray-400 hover:border-gray-600'}`}
              >Receita</button>
              <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${formData.type === 'expense'
                  ? 'bg-accent-red/20 border-2 border-accent-red text-accent-red'
                  : 'bg-dark-card border border-dark-border text-gray-400 hover:border-gray-600'}`}
              >Despesa</button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="label-premium">Descrição</label>
            <input ref={inputRef} type="text" required value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-premium" placeholder="Ex: Pagamento cliente X" />
          </div>

          {/* Valor */}
          <div>
            <label className="label-premium">Valor (R$)</label>
            <input type="number" required step="0.01" min="0" value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-premium number-font" placeholder="0.00" />
          </div>

          {/* Categoria */}
          <div>
            <label className="label-premium">Categoria</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-premium">
              {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>

          {/* Conta */}
          {accounts.length > 0 && (
            <div>
              <label className="label-premium">Conta</label>
              <select value={formData.account_id} onChange={(e) => setFormData({ ...formData, account_id: e.target.value })} className="input-premium">
                <option value="">Sem conta vinculada</option>
                {accounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.name}{acc.bank ? ` (${acc.bank})` : ''}</option>))}
              </select>
            </div>
          )}

          {/* Empresa */}
          <div>
            <label className="label-premium">Empresa</label>
            <select value={formData.company_id} onChange={(e) => setFormData({ ...formData, company_id: e.target.value })} className="input-premium">
              <option value="">Pessoal (sem empresa)</option>
              {companies.map(company => (<option key={company.id} value={company.id}>{company.name}</option>))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="label-premium">Notas / Observações (Opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-premium min-h-[80px] resize-y custom-scrollbar"
              placeholder="Adicione detalhes, links ou anotações sobre esta transação..."
            />
          </div>

          {/* Recurring (only for new) */}
          {!isEditMode && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-accent-purple" />
                  <span className="text-sm font-medium text-white">Transação Recorrente</span>
                </div>
                <button type="button" onClick={() => setIsRecurring(!isRecurring)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${isRecurring ? 'bg-primary' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isRecurring ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {isRecurring && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <label className="label-premium text-xs">Data de Vencimento</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-premium" />
                  </div>
                  <div>
                    <label className="label-premium text-xs">Frequência</label>
                    <select value={recurrenceType} onChange={e => setRecurrenceType(e.target.value as any)} className="input-premium">
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Existing Attachments (edit mode) */}
          {isEditMode && existingAttachments.length > 0 && (
            <div>
              <label className="label-premium flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Anexos Existentes
              </label>
              <div className="mt-2 space-y-2">
                {existingAttachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-dark-card rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{att.file_name}</a>
                    </div>
                    <button type="button" onClick={() => handleRemoveExistingAttachment(att.id)} className="p-1 hover:bg-accent-red/10 rounded transition-colors">
                      <X className="w-4 h-4 text-accent-red" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Attachments */}
          <div>
            <label className="label-premium flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              {isEditMode ? 'Adicionar Novo Anexo' : 'Anexar Comprovante (Opcional)'}
            </label>
            <div className="mt-2">
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-dark-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-sm text-gray-400 group-hover:text-primary transition-colors">
                  Clique para selecionar arquivos
                </span>
                <input type="file" multiple accept="image/*,.pdf"
                  onChange={(e) => { if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]) }}
                  className="hidden" />
              </label>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-dark-card rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm text-gray-300">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))} className="p-1 hover:bg-accent-red/10 rounded transition-colors">
                        <X className="w-4 h-4 text-accent-red" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
