import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple cache to prevent rate limiting
let cache: { [key: string]: { price: number, timestamp: number } } = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Mapping for CoinGecko IDs
const COINGECKO_MAP: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'BNB': 'binancecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'LINK': 'chainlink',
}

export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 1. Fetch assets from Supabase
        const { data: assets, error } = await supabase
            .from('assets')
            .select('id, ticker, classe')

        if (error) throw error
        if (!assets || assets.length === 0) {
            return NextResponse.json({ message: 'No assets found' })
        }

        const updates = []

        // 2. Separate into types by classe
        const stocks = assets.filter(a => a.classe === 'Ações' || a.classe === 'Stocks' || a.classe === 'FIIs' || a.classe === 'BDRs' || a.classe === 'ETFs')
        const cryptos = assets.filter(a => a.classe === 'Criptomoedas' || a.classe === 'Crypto')

        // 3. Fetch Crypto Prices (CoinGecko)
        if (cryptos.length > 0) {
            const ids = cryptos
                .map(c => COINGECKO_MAP[c.ticker.toUpperCase()] || c.ticker.toLowerCase())

            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl`, {
                    next: { revalidate: 300 } // Next.js cache
                })

                if (response.ok) {
                    const data = await response.json()

                    for (const crypto of cryptos) {
                        const id = COINGECKO_MAP[crypto.ticker.toUpperCase()] || crypto.ticker.toLowerCase()
                        const price = data[id]?.brl

                        if (price) {
                            updates.push(
                                supabase.from('assets').update({ preco_atual: price }).eq('id', crypto.id)
                            )
                        }
                    }
                }
            } catch (err) {
                console.error('CoinGecko Error:', err)
            }
        }

        // 4. Fetch Stock Prices (BrAPI)
        if (stocks.length > 0) {
            const tickers = stocks.map(s => s.ticker).join(',')

            try {
                // Using FREE public endpoint from BrAPI
                const response = await fetch(`https://brapi.dev/api/quote/${tickers}?range=1d&interval=1d`, {
                    next: { revalidate: 300 }
                })

                if (response.ok) {
                    const data = await response.json()
                    // BrAPI returns { results: [ { symbol: 'PETR4', regularMarketPrice: 30.5, ... } ] }

                    if (data.results) {
                        for (const stock of stocks) {
                            // Exact match or find by symbol
                            const quote = data.results.find((q: any) => q.symbol.toUpperCase() === stock.ticker.toUpperCase())
                            if (quote && quote.regularMarketPrice) {
                                updates.push(
                                    supabase.from('assets').update({ preco_atual: quote.regularMarketPrice }).eq('id', stock.id)
                                )
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('BrAPI Error:', err)
            }
        }

        // 5. Execute all updates
        await Promise.all(updates)

        return NextResponse.json({
            success: true,
            updated: updates.length,
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
