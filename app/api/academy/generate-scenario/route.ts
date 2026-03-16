import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { topic } = await request.json();
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            console.log('[generate-scenario] No API key, using fallback.');
            return NextResponse.json(getFallbackScenario(topic));
        }

        const systemPrompt = `Você é um professor universitário e tutor de elite da Nexus Academy.
Seu objetivo é gerar UM (1) cenário prático, acadêmico e altamente envolvente para testar o conhecimento do aluno no tópico fornecido.
O cenário DEVE exigir pensamento analítico voltado para uma destas quatro áreas: Comunicação Empresarial, Fundamentos da Administração, Matemática Aplicada ou Teoria Econômica.
O nível de dificuldade deve ser ALTO (nível universitário/profissional).

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS um objeto JSON puro. NENHUM texto Markdown adicional (remova \`\`\`json).
2. O formato JSON deve seguir EXATAMENTE esta estrutura:
{
  "scenario": "Texto rico e detalhado descrevendo a situação acadêmica ou dilema corporativo, incluindo números se for matemática/economia.",
  "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
  "correctAnswer": "Texto exato da alternativa correta",
  "explanation": "Explicação detalhada e teórica do motivo lógico que torna esta a resposta correta, citando conceitos."
}
3. A "correctAnswer" DEVE ser uma cópia exata de uma das strings contidas no array "options".
4. O problema gerado deve pertencer estritamente ao contexto de: ${topic || 'Comunicação Empresarial, Administração, Matemática ou Economia'}.
`;

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
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            console.error('[generate-scenario] Groq API error:', response.status);
            return NextResponse.json(getFallbackScenario(topic));
        }

        const data = await response.json();
        const resultText = data.choices?.[0]?.message?.content || '';

        try {
            let cleaned = resultText
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .trim();

            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleaned = cleaned.substring(firstBrace, lastBrace + 1);
            }

            const parsed = JSON.parse(cleaned);

            if (parsed.scenario && parsed.options && parsed.correctAnswer) {
                return NextResponse.json(parsed);
            } else {
                return NextResponse.json(getFallbackScenario(topic));
            }
        } catch (parseError) {
            console.error('[generate-scenario] JSON parse error:', parseError);
            return NextResponse.json(getFallbackScenario(topic));
        }

    } catch (error) {
        console.error('[generate-scenario] Unexpected error:', error);
        return NextResponse.json(getFallbackScenario('Geral'));
    }
}

function getFallbackScenario(topic: string) {
    return {
        scenario: `A MegaCorp está enfrentando severos problemas de produtividade. O gerente do setor afirma que a equipe não entende suas ordens e há muitos "ruídos semânticos". Concomitantemente, a direção exige maior "Eficácia" na linha de montagem, mas sem aumentar os custos operacionais (mantendo a Eficiência). Qual a ação teórica mais alinhada com os princípios intersecionais de Administração e Comunicação Empresarial? Contexto: ${topic || 'Administração e Comunicação'}`,
        options: [
            "Contratar mais funcionários imediatamente para aumentar a Eficácia, ignorando o ruído semântico por ser um problema menor.",
            "Substituir toda a comunicação informal por memorandos rígidos, aumentando a Eficiência bruta e ignorando o impacto motivacional.",
            "Mapear e corrigir a linguagem técnica (ruído semântico) para que a mensagem seja compreendida, liderando a equipe para atingir a meta (Eficácia) otimizando o tempo gasto (Eficiência).",
            "Aumentar os salários de toda a equipe, assumindo que fatores higiênicos resolvem falhas de comunicação e garantem Eficácia automática."
        ],
        correctAnswer: "Mapear e corrigir a linguagem técnica (ruído semântico) para que a mensagem seja compreendida, liderando a equipe para atingir a meta (Eficácia) otimizando o tempo gasto (Eficiência).",
        explanation: "Na teoria da Administração e Comunicação, ruídos semânticos (falhas no vocabulário) destroem a eficiência. Corrigir a clareza da mensagem permite que o time alcance a meta (Eficácia) gastando menos tempo e recursos com retrabalho (Eficiência)."
    };
}
