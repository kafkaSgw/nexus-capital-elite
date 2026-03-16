'use client'

import { useState, useEffect } from 'react'
import { Paperclip, X, Download, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Attachment {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
}

interface AttachmentsViewerProps {
  transactionId: string
}

export default function AttachmentsViewer({ transactionId }: AttachmentsViewerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingUrl, setViewingUrl] = useState<string | null>(null)

  useEffect(() => {
    loadAttachments()
  }, [transactionId])

  const loadAttachments = async () => {
    try {
      const { data, error } = await supabase
        .from('transaction_attachments')
        .select('*')
        .eq('transaction_id', transactionId)

      if (error) throw error
      setAttachments(data || [])
    } catch (error) {
      console.error('Erro ao carregar anexos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    return '📎'
  }

  if (loading) {
    return <div className="text-xs text-gray-500">Carregando anexos...</div>
  }

  if (attachments.length === 0) {
    return <div className="text-xs text-gray-500">Sem anexos</div>
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Paperclip className="w-3 h-3" />
          {attachments.length} anexo(s)
        </p>
        
        <div className="space-y-1">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-2 bg-dark-bg rounded-lg text-xs"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span>{getFileIcon(attachment.file_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{attachment.file_name}</p>
                  <p className="text-gray-500">{formatFileSize(attachment.file_size)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewingUrl(attachment.file_url)}
                  className="p-1 hover:bg-primary/10 rounded transition-colors"
                  title="Visualizar"
                >
                  <Eye className="w-4 h-4 text-primary" />
                </button>
                <a
                  href={attachment.file_url}
                  download={attachment.file_name}
                  className="p-1 hover:bg-accent-green/10 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-accent-green" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Visualização */}
      {viewingUrl && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl h-[90vh]">
            <button
              onClick={() => setViewingUrl(null)}
              className="absolute -top-12 right-0 p-2 bg-accent-red hover:bg-accent-red/80 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
              {viewingUrl.includes('.pdf') ? (
                <iframe
                  src={viewingUrl}
                  className="w-full h-full"
                  title="Comprovante"
                />
              ) : (
                <img
                  src={viewingUrl}
                  alt="Comprovante"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
