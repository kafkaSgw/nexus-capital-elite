import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { content } = await request.json();
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || !content) {
            console.log('[quiz-masterclass] No API key or no content, using fallback.');
            return NextResponse.json(generateFallbackQuiz(content || ''));
        }

        const systemPrompt = `Você é um tutor educacional da Nexus Academy.
O aluno acabou de ler o texto abaixo. Crie exatamente 3 perguntas de múltipla escolha BASEADAS EXCLUSIVAMENTE no conteúdo do texto.
As perguntas podem ser desafiadoras, mas DEVEM testar algo que foi explicado no texto lido.
Use linguagem clara e direta. Cada pergunta deve ter 4 alternativas, sendo apenas 1 correta.

REGRAS OBRIGATÓRIAS:
1. As perguntas DEVEM se referir a conceitos, definições ou exemplos presentes no texto.
2. A resposta correta no campo "answer" DEVE ser IDÊNTICA (caractere por caractere) a uma das opções do array "options".
3. Retorne APENAS um array JSON puro. Sem markdown. Sem crases. Sem texto antes ou depois.
4. O formato OBRIGATÓRIO é um array [] com 3 objetos.

Formato:
[
  {
    "id": "q1",
    "question": "Pergunta sobre algo do texto",
    "options": ["opção A incorreta", "opção B correta", "opção C incorreta", "opção D incorreta"],
    "answer": "opção B correta",
    "teaching": "Explicação de por que essa é a resposta, referenciando o texto.",
    "difficulty": "intermediario"
  }
]

TEXTO LIDO PELO ALUNO:
${content}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: systemPrompt }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[quiz-masterclass] Groq API error:', response.status, errText);
            return NextResponse.json(generateFallbackQuiz(content));
        }

        const data = await response.json();
        const resultText = data.choices?.[0]?.message?.content || '';

        // Try to extract JSON array from the response
        try {
            // Remove markdown code fences if present
            let cleaned = resultText
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .trim();

            // Find the array boundaries
            const firstBracket = cleaned.indexOf('[');
            const lastBracket = cleaned.lastIndexOf(']');

            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                cleaned = cleaned.substring(firstBracket, lastBracket + 1);
            }

            const parsed = JSON.parse(cleaned);

            // Validate it's an array with proper structure
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question && parsed[0].options) {
                return NextResponse.json(parsed);
            } else {
                console.error('[quiz-masterclass] Parsed but invalid structure:', JSON.stringify(parsed).substring(0, 200));
                return NextResponse.json(generateFallbackQuiz(content));
            }
        } catch (parseError) {
            console.error('[quiz-masterclass] JSON parse error:', parseError, 'Raw:', resultText.substring(0, 300));
            return NextResponse.json(generateFallbackQuiz(content));
        }

    } catch (error) {
        console.error('[quiz-masterclass] Unexpected error:', error);
        return NextResponse.json(generateFallbackQuiz(''));
    }
}

// Generate meaningful fallback quiz questions by extracting key terms from the content
function generateFallbackQuiz(content: string): any[] {
    // Extract bold terms from the content (terms wrapped in **)
    const boldTerms: string[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    while ((match = boldRegex.exec(content)) !== null) {
        if (match[1].length > 3 && match[1].length < 80) {
            boldTerms.push(match[1]);
        }
    }

    // Extract header terms (## headings)
    const headers: string[] = [];
    const headerRegex = /##\s+(.+)/g;
    while ((match = headerRegex.exec(content)) !== null) {
        headers.push(match[1].trim());
    }

    const allTerms = [...headers, ...boldTerms];

    if (allTerms.length >= 2) {
        return [
            {
                id: 'fallback_1',
                question: `Com base no que você leu, qual destes conceitos foi abordado no capítulo?`,
                options: [
                    allTerms[0] || 'Conceito A',
                    'Teoria do Caos Financeiro',
                    'Análise de Blockchain Descentralizada',
                    'Engenharia de Foguetes Espaciais'
                ],
                answer: allTerms[0] || 'Conceito A',
                teaching: `O conceito "${allTerms[0]}" foi explicado no texto que você acabou de ler. Releia se necessário!`,
                difficulty: 'iniciante'
            },
            {
                id: 'fallback_2',
                question: `Qual das alternativas NÃO foi mencionada no texto que você leu?`,
                options: [
                    allTerms.length > 1 ? allTerms[1] : 'Conceito do texto',
                    allTerms.length > 2 ? allTerms[2] : 'Outro conceito do texto',
                    'Criptomoeda de Marte',
                    allTerms[0] || 'Mais um conceito do texto'
                ],
                answer: 'Criptomoeda de Marte',
                teaching: 'Essa alternativa absurda não tem nada a ver com o conteúdo do capítulo. As demais foram todas abordadas no texto!',
                difficulty: 'iniciante'
            },
            {
                id: 'fallback_3',
                question: 'Por que é importante estudar o conteúdo deste capítulo?',
                options: [
                    'Porque é base para entender os próximos capítulos e aplicar na prática.',
                    'Porque não tem utilidade nenhuma, é só decorar.',
                    'Porque o professor pediu e pronto.',
                    'Porque é impossível de aprender mesmo.'
                ],
                answer: 'Porque é base para entender os próximos capítulos e aplicar na prática.',
                teaching: 'Cada capítulo constrói a base para o próximo. Entender os fundamentos é essencial antes de avançar!',
                difficulty: 'iniciante'
            }
        ];
    }

    // Ultimate fallback if content parsing fails completely
    return [
        {
            id: 'uf_1',
            question: 'O que você achou mais importante no texto que acabou de ler?',
            options: [
                'Os conceitos fundamentais apresentados no início.',
                'Não li o texto, pulei direto pro quiz.',
                'A parte sobre culinária japonesa (que não existe no texto).',
                'A tabela de horários do metrô (que também não existe).'
            ],
            answer: 'Os conceitos fundamentais apresentados no início.',
            teaching: 'Se a IA não conseguiu gerar as perguntas, tente novamente! Verifique sua conexão com a internet.',
            difficulty: 'iniciante'
        }
    ];
}
