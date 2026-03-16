import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()
    const apiKey = process.env.GROQ_API_KEY

    // Se não tiver API key, usa modo offline
    if (!apiKey) {
      return NextResponse.json({ response: getOfflineResponse(message) })
    }

    const systemPrompt = context
      ? `Você é um assistente financeiro da Nexus Capital. Responda em português do Brasil, seja educativo e objetivo. Máximo 200 palavras. Use emojis 💰📊\n\nAqui estão os dados financeiros reais do usuário para contexto:\n${context}`
      : 'Você é um assistente financeiro da Nexus Capital. Responda em português do Brasil, seja educativo e objetivo. Máximo 200 palavras. Use emojis 💰📊'

    // Chama API do Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      return NextResponse.json({ response: getOfflineResponse(message) })
    }

    const data = await response.json()
    return NextResponse.json({
      response: data.choices?.[0]?.message?.content || getOfflineResponse(message)
    })

  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ response: getOfflineResponse('') })
  }
}

function getOfflineResponse(message: string): string {
  const msg = message.toLowerCase()

  if (msg.includes('bitcoin') || msg.includes('btc')) {
    return `📊 **Bitcoin** é a maior criptomoeda. Funciona como reserva de valor digital.

**Pontos-chave:**
- Oferta limitada (21M)
- Alta volatilidade  
- 5-10% do portfólio

💡 Nunca invista mais que pode perder!`
  }

  if (msg.includes('diversif') || msg.includes('portf')) {
    return `🎯 **Diversificação** = distribuir investimentos para reduzir risco.

**Exemplo:**
- 40% Renda Fixa
- 30% Ações
- 20% FIIs
- 10% Cripto

💰 Não coloque tudo numa cesta só!`
  }

  if (msg.includes('ações') || msg.includes('b3')) {
    return `📈 **Ações** são partes de empresas (B3).

**Como começar:**
1. Abra conta na corretora
2. Estude fundamentos
3. Pense longo prazo (5+ anos)

**Populares:** PETR4, VALE3, ITUB4

⚠️ Alta oscilação no curto prazo!`
  }

  if (msg.includes('reserva')) {
    return `🛡️ **Reserva de Emergência**

**Quanto:** 6-12 meses de despesas

**Onde:** Tesouro Selic, CDB liquidez diária

💡 Monte ANTES de investir em ações!`
  }

  return `💰 **Nexus Capital - Assistente**

Posso ajudar com:
📊 Investimentos
💵 Orçamento  
📈 Estratégias

**Pergunte:**
- "Como diversificar?"
- "O que é Bitcoin?"
- "Reserva de emergência?"

Como posso ajudar? 😊`
}
