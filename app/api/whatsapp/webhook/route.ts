import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Inicializa a IA e Banco de Dados (Use suas variáveis do .env)
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Chave de serviço para bypass do RLS (gravação segura)

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Extrair a mensagem enviada pela Evolution API
        // A estrutura do JSON da Evolution API no evento "messages.upsert"

        // Evita processar mensagens que fomos nós mesmos que enviamos
        if (body.data?.key?.fromMe) {
            return NextResponse.json({ received: true, status: 'Ignorado (mensagem própria)' });
        }

        const messageText = body?.data?.message?.conversation || body?.data?.message?.extendedTextMessage?.text;
        const senderNumber = body?.data?.key?.remoteJid?.replace('@s.whatsapp.net', '');

        if (!messageText) {
            return NextResponse.json({ received: true, status: 'Sem conteúdo de mensagem de texto' });
        }

        console.log(`Mensagem recebida de ${senderNumber}: ${messageText}`);

        // 2. O PROMPT MÁGICO DA IA 🧠
        const completion = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [
                {
                    role: "system",
                    content: `Você é um assistente financeiro da Nexus Capital conversando pelo WhatsApp.
O usuário pode enviar uma transação (gasto/receita) OU pedir um relatório/gráfico.
Retorne APENAS um JSON válido seguindo EXATAMENTE este formato:
{
  "intencao": (obrigatorio: "transacao" ou "relatorio"),
  "tipo_relatorio": (se intencao=relatorio, ex: "grafico_despesas", "resumo_mensal", senao null),
  "valor": (número decimal. Ex: 150.00. Se intencao=relatorio, use 0),
  "categoria": (string, ex: "Anúncios", "Alimentação". Se relatorio, use null),
  "projeto_empresa": (string, se não citado, "Geral"),
  "tipo": (string, "Entrada" ou "Saída". Se relatorio, use null)
}
IMPORTANTE: Retorne APENAS o JSON, sem markdown ou texto extra.`
                },
                { role: "user", content: messageText }
            ],
            response_format: { type: "json_object" }
        });

        // 3. Transformar o texto da IA em um Objeto JSON
        const aiResponse = completion.choices[0]?.message?.content;

        if (!aiResponse) {
            throw new Error('A IA não retornou conteúdo');
        }

        // Garante que tentamos limpar o markdown caso a IA tente mandá-lo
        const cleanedJsonText = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(cleanedJsonText);
        console.log("Dados extraídos pela IA (Groq):", aiData);

        // 4. Processar de acordo com a intenção
        if (aiData.intencao === 'relatorio') {
            // Gerar Relatório e Enviar de Volta (Ex: QuickChart)
            const evoUrl = process.env.EVOLUTION_API_URL;
            const evoKey = process.env.EVOLUTION_API_KEY;
            const evoInstance = process.env.EVOLUTION_INSTANCE || 'NexusFinance';

            if (!evoUrl || !evoKey) {
                console.log("Evolution API não configurada no .env para responder com gráficos.");
                return NextResponse.json({ success: true, status: 'Relatório ignorado por falta de env vars' });
            }

            // Buscar dados básicos do Supabase para um gráfico rápido
            const { data: txs } = await supabase
                .from('whatsapp_transactions')
                .select('*')
                .eq('whatsapp_number', senderNumber)
                .order('created_at', { ascending: false })
                .limit(50);

            const despesas = txs?.filter(t => t.transaction_type === 'Saída') || [];
            const receitas = txs?.filter(t => t.transaction_type === 'Entrada') || [];

            const sumSaidas = despesas.reduce((a, b) => a + Number(b.amount), 0);
            const sumEntradas = receitas.reduce((a, b) => a + Number(b.amount), 0);

            const chartConfig = {
                type: 'bar',
                data: {
                    labels: ['Entradas', 'Saídas'],
                    datasets: [{
                        label: 'Resumo Financeiro (R$)',
                        data: [sumEntradas, sumSaidas],
                        backgroundColor: ['#10B981', '#EF4444']
                    }]
                },
                options: { plugins: { title: { display: true, text: 'Relatório Nexus Capital' } } }
            };

            const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=500&h=300&bkg=white`;

            // Enviar imagem pela Evolution API
            const response = await fetch(`${evoUrl}/message/sendMedia/${evoInstance}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': evoKey
                },
                body: JSON.stringify({
                    number: senderNumber,
                    options: {
                        delay: 1200,
                        presence: 'composing'
                    },
                    mediaMessage: {
                        mediatype: 'image',
                        caption: `📊 Aqui está o seu relatório financeiro solicitado!\n\n*Entradas:* R$ ${sumEntradas.toFixed(2)}\n*Saídas:* R$ ${sumSaidas.toFixed(2)}`,
                        media: chartUrl
                    }
                })
            });

            console.log("Gráfico enviado:", await response.json());

            return NextResponse.json({
                success: true,
                ai_extraction: aiData,
                action: 'relatorio_enviado',
                chartUrl
            });
        }

        // Caso seja apenas transação, salvar no banco
        const { data, error } = await supabase
            .from('whatsapp_transactions')
            .insert([{
                whatsapp_number: senderNumber,
                amount: aiData.valor || 0,
                category: aiData.categoria || 'Não Categorizado',
                project_company: aiData.projeto_empresa || 'Geral',
                transaction_type: aiData.tipo || 'Saída',
                original_message: messageText
            }])
            .select();

        if (error) {
            console.error("Erro ao salvar no Supabase:", error);
            throw error;
        }

        // Opcional: Avisar que a transação foi salva
        const evoUrl = process.env.EVOLUTION_API_URL;
        const evoKey = process.env.EVOLUTION_API_KEY;
        const evoInstance = process.env.EVOLUTION_INSTANCE || 'NexusFinance';

        if (evoUrl && evoKey) {
            await fetch(`${evoUrl}/message/sendText/${evoInstance}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': evoKey },
                body: JSON.stringify({
                    number: senderNumber,
                    options: { delay: 1200, presence: 'composing' },
                    textMessage: {
                        text: `✅ *Transação Registrada*\n\n*Tipo:* ${aiData.tipo}\n*Valor:* R$ ${Number(aiData.valor).toFixed(2)}\n*Categoria:* ${aiData.categoria}\n\nVisualização já disponível no Dashboard da Nexus Capital.`
                    }
                })
            }).catch(e => console.error("Erro ao enviar confirmação de texto:", e));
        }

        return NextResponse.json({
            success: true,
            ai_extraction: aiData,
            saved_transaction: data ? data[0] : null
        });

    } catch (error: any) {
        console.error('Erro no webhook do WhatsApp:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Erro interno no processamento do Webhook' },
            { status: 500 }
        );
    }
}
