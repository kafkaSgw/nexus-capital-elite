'use client'

import { useState, useEffect } from 'react'
import { X, Building2, FileText, Hash, Palette } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  company?: any
}

const AVATAR_COLORS = [
  { name: 'Blue', bg: 'bg-primary', border: 'border-primary' },
  { name: 'Purple', bg: 'bg-accent-purple', border: 'border-accent-purple' },
  { name: 'Green', bg: 'bg-accent-green', border: 'border-accent-green' },
  { name: 'Orange', bg: 'bg-accent-orange', border: 'border-accent-orange' },
  { name: 'Pink', bg: 'bg-accent-pink', border: 'border-accent-pink' },
  { name: 'Indigo', bg: 'bg-accent-blue', border: 'border-accent-blue' },
  { name: 'Yellow', bg: 'bg-accent-yellow', border: 'border-accent-yellow' },
  { name: 'Red', bg: 'bg-accent-red', border: 'border-accent-red' },
]

export default function CompanyModal({ isOpen, onClose, onSuccess, company }: CompanyModalProps) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    cnpj: company?.cnpj || '',
    description: company?.description || '',
    avatar_color: company?.avatar_color || 'bg-primary',
  })
  const [loading, setLoading] = useState(false)

  // Reset form when modal opens or company changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: company?.name || '',
        cnpj: company?.cnpj || '',
        description: company?.description || '',
        avatar_color: company?.avatar_color || 'bg-primary',
      })
    }
  }, [isOpen, company])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('O nome da empresa é obrigatório!')
      return
    }

    if (formData.name.trim().length < 2) {
      toast.error('Nome deve ter no mínimo 2 caracteres')
      return
    }

    if (formData.cnpj && formData.cnpj.trim()) {
      const cnpjClean = formData.cnpj.replace(/\D/g, '')
      if (cnpjClean.length !== 14) {
        toast.error('CNPJ deve ter 14 dígitos')
        return
      }
    }

    setLoading(true)

    try {
      if (company) {
        // Update — try with all fields, fallback to just name+description
        try {
          const { error } = await supabase
            .from('companies')
            .update({ name: formData.name, cnpj: formData.cnpj || null, description: formData.description, avatar_color: formData.avatar_color })
            .eq('id', company.id)
          if (error) throw error
        } catch {
          const { error } = await supabase
            .from('companies')
            .update({ name: formData.name, description: formData.description })
            .eq('id', company.id)
          if (error) throw error
        }
        toast.success(`${formData.name} atualizada com sucesso!`)
      } else {
        // Create — try with all fields, fallback progressively
        let created = false

        // Attempt 1: all fields
        try {
          const { error } = await supabase
            .from('companies')
            .insert([{ name: formData.name, cnpj: formData.cnpj || null, description: formData.description, avatar_color: formData.avatar_color }])
          if (error) throw error
          created = true
        } catch {
          // Attempt 2: without avatar_color
          try {
            const { error } = await supabase
              .from('companies')
              .insert([{ name: formData.name, description: formData.description }])
            if (error) throw error
            created = true
          } catch {
            // Attempt 3: name only
            const { error } = await supabase
              .from('companies')
              .insert([{ name: formData.name }])
            if (error) throw error
            created = true
          }
        }

        if (created) {
          toast.success(`${formData.name} adicionada ao portfólio!`)
        }
      }

      onSuccess()
      onClose()
      setFormData({ name: '', cnpj: '', description: '', avatar_color: 'bg-primary' })
    } catch (err: any) {
      const msg = err?.message || 'Erro ao salvar empresa'
      toast.error(msg)
      console.error('Erro ao salvar empresa:', err)
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-dark-card border border-dark-border rounded-2xl shadow-corporate-lg animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-dark-border sticky top-0 bg-dark-card z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${formData.avatar_color} flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
              {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {company ? 'Editar Empresa' : 'Nova Empresa'}
              </h2>
              <p className="text-sm text-gray-400">
                {company ? 'Atualize os dados da empresa' : 'Adicione uma nova empresa ao portfólio'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome da Empresa */}
          <div>
            <label className="label-premium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Nome da Empresa *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Interpira Tecnologia"
              className="input-premium"
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="label-premium flex items-center gap-2">
              <Hash className="w-4 h-4" />
              CNPJ (Opcional)
            </label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              placeholder="Ex: 12.345.678/0001-90"
              className="input-premium"
            />
          </div>

          {/* Escolher Cor do Avatar */}
          <div>
            <label className="label-premium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cor do Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar_color: color.bg })}
                  className={`h-12 rounded-lg ${color.bg} flex items-center justify-center text-white font-bold text-xl transition-all hover:scale-105 ${formData.avatar_color === color.bg
                    ? `ring-2 ring-offset-2 ${color.border} ring-offset-dark-bg`
                    : ''
                    }`}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="label-premium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descrição (Opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Empresa de tecnologia e desenvolvimento de software"
              rows={3}
              className="input-premium resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                company ? 'Atualizar' : 'Adicionar Empresa'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
