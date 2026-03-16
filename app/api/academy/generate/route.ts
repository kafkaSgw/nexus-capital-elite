import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { type, subjectContent } = await request.json();
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return NextResponse.json(getOfflineMock(type));
        }

        let fileContent = subjectContent || '';
        if (!fileContent) {
            try {
                const filePath = path.join(process.cwd(), 'data', 'user_study_material.txt');
                fileContent = fs.readFileSync(filePath, 'utf8');
            } catch (e) {
                console.error("[generate] Could not read user_study_material.txt", e);
            }
        }

        let systemPrompt = '';

        if (type === 'flashcard') {
            systemPrompt = `Você é um tutor educacional da Nexus Academy.
Abaixo está o conteúdo de estudo oficial do aluno.
Crie UM novo Flashcard (pergunta de múltipla escolha) que teste um conceito presente no texto.
A dificuldade pode variar, mas a pergunta DEVE ser baseada EXCLUSIVAMENTE no texto abaixo.
As 4 opções devem ser frases completas e plausíveis (nunca use apenas letras como A, B, C, D).
A resposta no campo "answer" deve ser IDÊNTICA a uma das opções.

Retorne APENAS um objeto JSON puro (sem markdown, sem crases):
{
  "id": "string aleatória",
  "question": "A pergunta baseada no texto",
  "options": ["opção errada 1", "opção correta", "opção errada 2", "opção errada 3"],
  "answer": "opção correta",
  "teaching": "Explicação clara apoiada no material.",
  "difficulty": "intermediario"
}

--- MATERIAL DE ESTUDO DO ALUNO ---
${fileContent}`;
        } else {
            systemPrompt = `Você é um tutor educacional da Nexus Academy.
Abaixo está o conteúdo de estudo oficial do aluno.
Crie UM novo "Business Case Study" simulado baseado no material de estudo abaixo.
Use linguagem simples e direta. O cenário deve testar tomada de decisão.
Ofereça 2-3 escolhas com trade-offs claros.

Retorne APENAS um objeto JSON puro (sem markdown, sem crases):
{
  "id": "string aleatoria",
  "title": "Título do Caso",
  "scenario": "Descrição do problema baseada na teoria do material",
  "industry": "Setor de atuação",
  "difficulty": "intermediario",
  "choices": [
    {
      "id": "c1",
      "option": "Ação que o aluno pode tomar",
      "outcomeText": "O que aconteceu depois",
      "aiExplanation": "Explicação teórica apoiada no material",
      "impact": { "revenue": 0, "cashflow": 0, "risk": 0 }
    }
  ]
}

--- MATERIAL DE ESTUDO DO ALUNO ---
${fileContent}`;
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: systemPrompt }],
                temperature: 0.8,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[generate] Groq API error:', response.status, errText);
            return NextResponse.json(getOfflineMock(type));
        }

        const data = await response.json();
        const resultText = data.choices?.[0]?.message?.content || '';

        try {
            // Clean markdown fences
            let cleaned = resultText
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .trim();

            // For flashcard (object), find { ... }
            if (type === 'flashcard') {
                const firstBrace = cleaned.indexOf('{');
                const lastBrace = cleaned.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
                }
            } else {
                // For case study (object), find { ... }
                const firstBrace = cleaned.indexOf('{');
                const lastBrace = cleaned.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
                }
            }

            const parsed = JSON.parse(cleaned);
            return NextResponse.json(parsed);
        } catch (parseErr) {
            console.error('[generate] JSON parse error:', parseErr, 'Raw:', resultText.substring(0, 300));
            return NextResponse.json(getOfflineMock(type));
        }

    } catch (error) {
        console.error('[generate] Unexpected error:', error);
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
}

function getOfflineMock(type: string) {
    if (type === 'flashcard') {
        return {
            id: 'f_offline_' + Date.now(),
            question: 'O que é "Receita" no contexto de uma empresa?',
            options: [
                'É o dinheiro que a empresa gasta com funcionários.',
                'É todo dinheiro que entra quando a empresa vende produtos ou serviços.',
                'É o imposto cobrado pelo governo sobre vendas.',
                'É o valor das dívidas da empresa no final do mês.'
            ],
            answer: 'É todo dinheiro que entra quando a empresa vende produtos ou serviços.',
            teaching: 'Receita é simplesmente o dinheiro que os clientes pagam. Se vendeu algo por R$10, a receita foi R$10.',
            difficulty: 'iniciante'
        };
    } else {
        return {
            id: 'case_offline_' + Date.now(),
            title: 'O Dilema da Padaria',
            scenario: 'Você é dono de uma padaria. O preço da farinha subiu 30%. Seus clientes são sensíveis a preço. Você precisa decidir o que fazer.',
            industry: 'Alimentação',
            difficulty: 'iniciante',
            choices: [
                {
                    id: '1',
                    option: 'Repassar todo o aumento para o preço do pão.',
                    outcomeText: 'Muitos clientes pararam de comprar pão na sua padaria e foram para o concorrente mais barato.',
                    aiExplanation: 'Quando a demanda é elástica (sensível a preço), subir muito o preço afasta clientes.',
                    impact: { revenue: -30, cashflow: -20, risk: 40 }
                },
                {
                    id: '2',
                    option: 'Absorver parte do custo e repassar apenas metade do aumento.',
                    outcomeText: 'Você perdeu um pouco de margem, mas manteve a maioria dos clientes. As vendas continuaram estáveis.',
                    aiExplanation: 'Dividir o impacto entre margem e preço é uma estratégia equilibrada para manter clientes.',
                    impact: { revenue: 5, cashflow: -5, risk: -10 }
                }
            ]
        };
    }
}
