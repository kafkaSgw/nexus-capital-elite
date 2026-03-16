// Formatação de moeda
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value).replace(/\u00A0/g, ' ').replace(/&nbsp;/g, ' ')
}

// Formatação de percentual
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100).replace(/\u00A0/g, ' ').replace(/&nbsp;/g, ' ')
}

// Formatação de número
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value).replace(/\u00A0/g, ' ').replace(/&nbsp;/g, ' ')
}

// Determina se um valor é positivo/negativo
export const getValueColor = (value: number): string => {
  if (value > 0) return 'text-accent-green'
  if (value < 0) return 'text-accent-red'
  return 'text-gray-400'
}

// Formata data
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Trunca texto
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Calcula variação percentual
export const calculatePercentageChange = (currentValue: number, initialValue: number): number => {
  if (initialValue === 0) return 0
  return ((currentValue - initialValue) / initialValue) * 100
}
