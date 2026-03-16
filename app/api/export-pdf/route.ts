import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { transactions, assets, summary, date } = await request.json()

    // HTML do relatório
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif;
      padding: 40px;
      color: #333;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563EB;
    }
    .logo { 
      font-size: 32px;
      font-weight: bold;
      color: #2563EB;
      margin-bottom: 5px;
    }
    .subtitle { 
      color: #666;
      font-size: 14px;
    }
    .date {
      text-align: right;
      color: #666;
      font-size: 12px;
      margin-bottom: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2563EB;
    }
    .summary-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin: 30px 0 15px 0;
      color: #2563EB;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #2563EB;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 12px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 11px;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .income { color: #10B981; font-weight: bold; }
    .expense { color: #EF4444; font-weight: bold; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">NEXUS CAPITAL ELITE</div>
    <div class="subtitle">Relatório Financeiro Completo</div>
  </div>

  <div class="date">
    Gerado em: ${new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="summary-label">Patrimônio Total</div>
      <div class="summary-value">R$ ${summary.totalWealth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="summary-card" style="border-left-color: #10B981;">
      <div class="summary-label">Total Receitas</div>
      <div class="summary-value" style="color: #10B981;">R$ ${summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="summary-card" style="border-left-color: #EF4444;">
      <div class="summary-label">Total Despesas</div>
      <div class="summary-value" style="color: #EF4444;">R$ ${summary.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="summary-card" style="border-left-color: ${summary.balance >= 0 ? '#10B981' : '#EF4444'};">
      <div class="summary-label">Saldo do Período</div>
      <div class="summary-value" style="color: ${summary.balance >= 0 ? '#10B981' : '#EF4444'};">
        R$ ${summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>
    </div>
  </div>

  <div class="section-title">📊 Transações do Período</div>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Categoria</th>
        <th>Tipo</th>
        <th style="text-align: right;">Valor</th>
      </tr>
    </thead>
    <tbody>
      ${transactions.map((t: any) => `
        <tr>
          <td>${new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
          <td>${t.description}</td>
          <td>${t.category}</td>
          <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
          <td style="text-align: right;" class="${t.type === 'income' ? 'income' : 'expense'}">
            R$ ${Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">💼 Carteira de Investimentos</div>
  <table>
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Classe</th>
        <th style="text-align: right;">Quantidade</th>
        <th style="text-align: right;">Preço Médio</th>
        <th style="text-align: right;">Preço Atual</th>
        <th style="text-align: right;">Total Investido</th>
        <th style="text-align: right;">Valor Atual</th>
      </tr>
    </thead>
    <tbody>
      ${assets.map((a: any) => {
      const totalInvestido = a.quantidade * a.preco_medio
      const valorAtual = a.quantidade * a.preco_atual
      return `
          <tr>
            <td><strong>${a.ticker}</strong></td>
            <td>${a.classe}</td>
            <td style="text-align: right;">${a.quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">R$ ${a.preco_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">R$ ${a.preco_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">R$ ${totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;"><strong>R$ ${valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
          </tr>
        `
    }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p><strong>Nexus Capital Elite</strong> - Sistema de Gestão Financeira Premium</p>
    <p>Este relatório foi gerado automaticamente. Para dúvidas, consulte seu assessor financeiro.</p>
  </div>
</body>
</html>
    `

    // Retorna HTML para conversão em PDF (cliente fará conversão)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="relatorio.html"'
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 })
  }
}
