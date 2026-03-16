import { NextResponse } from 'next/server'
import axios from 'axios'
import { supabase } from '@/lib/supabase'

interface YahooQuote {
  symbol: string
  regularMarketPrice: number
}

export async function GET() {
  try {
    // Busca todos os ativos do banco
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')

    if (error) {
      console.error('Erro ao buscar ativos:', error)
      return NextResponse.json({ error: 'Erro ao buscar ativos' }, { status: 500 })
    }

    if (!assets || assets.length === 0) {
      return NextResponse.json({ message: 'Nenhum ativo para atualizar' }, { status: 200 })
    }

    // Busca cotação do dólar para converter criptomoedas
    let usdBrlRate = 5.0 // Taxa padrão caso falhe
    try {
      const usdResponse = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/USDBRL=X`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      )
      usdBrlRate = usdResponse.data?.chart?.result?.[0]?.meta?.regularMarketPrice || 5.0
    } catch (error) {
      console.error('Erro ao buscar cotação do dólar:', error)
    }

    // Atualiza preços de cada ativo
    const updates = []

    for (const asset of assets) {
      try {
        let ticker = asset.ticker
        let precoAtual = asset.preco_atual

        // Define o ticker correto baseado na classe
        if (asset.classe === 'Stocks') {
          // Ações brasileiras precisam do sufixo .SA
          if (!ticker.includes('.')) {
            ticker = `${ticker}.SA`
          }
        } else if (asset.classe === 'Crypto') {
          // Criptomoedas em USD
          ticker = `${ticker}-USD`
        }

        // Busca cotação na Yahoo Finance
        const response = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        )

        const price = response.data?.chart?.result?.[0]?.meta?.regularMarketPrice

        if (price) {
          // Se for cripto, converte de USD para BRL
          if (asset.classe === 'Crypto') {
            precoAtual = price * usdBrlRate
          } else {
            precoAtual = price
          }

          // Atualiza no banco
          const { error: updateError } = await supabase
            .from('assets')
            .update({
              preco_atual: precoAtual,
              updated_at: new Date().toISOString()
            })
            .eq('id', asset.id)

          if (updateError) {
            console.error(`Erro ao atualizar ${asset.ticker}:`, updateError)
          } else {
            // Salva histórico de preço
            await supabase.from('price_history').insert({
              asset_id: asset.id,
              price: precoAtual
            })

            updates.push({
              ticker: asset.ticker,
              preco_atual: precoAtual,
              success: true
            })
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar cotação de ${asset.ticker}:`, error)
        updates.push({
          ticker: asset.ticker,
          success: false,
          error: 'Falha ao buscar cotação'
        })
      }

      // Aguarda 500ms entre requisições para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return NextResponse.json({
      message: 'Atualização concluída',
      usdBrlRate,
      updates
    })
  } catch (error) {
    console.error('Erro geral na API de cotações:', error)
    return NextResponse.json({ error: 'Erro ao processar cotações' }, { status: 500 })
  }
}

// Endpoint específico para atualizar um único ativo
export async function POST(request: Request) {
  try {
    const { ticker, classe } = await request.json()

    let searchTicker = ticker
    if (classe === 'Stocks' && !ticker.includes('.')) {
      searchTicker = `${ticker}.SA`
    } else if (classe === 'Crypto') {
      searchTicker = `${ticker}-USD`
    }

    // Busca cotação
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${searchTicker}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    const price = response.data?.chart?.result?.[0]?.meta?.regularMarketPrice

    if (!price) {
      return NextResponse.json({ error: 'Cotação não encontrada' }, { status: 404 })
    }

    let precoFinal = price

    // Se for cripto, converte para BRL
    if (classe === 'Crypto') {
      const usdResponse = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/USDBRL=X`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      )
      const usdBrlRate = usdResponse.data?.chart?.result?.[0]?.meta?.regularMarketPrice || 5.0
      precoFinal = price * usdBrlRate
    }

    return NextResponse.json({
      ticker,
      preco: precoFinal,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao buscar cotação individual:', error)
    return NextResponse.json({ error: 'Erro ao buscar cotação' }, { status: 500 })
  }
}
