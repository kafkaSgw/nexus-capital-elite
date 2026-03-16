import { fetchWikiConcept } from '@/lib/wikipedia';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get('topic');

    if (!topic) {
        return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // A API agora retorna um objeto JSON simples. Como as expansões de aprendizagem são feitas via "click do usuário",
    // não precisamos manter conexões infinitas assíncronas (SSE) rodando. Basta uma fetch simples do nó da vez.
    try {
        const data = await fetchWikiConcept(topic);
        return NextResponse.json({
            id: topic,
            extract: data.extract || 'Resumo não encontrado. Este pode ser um termo obscuro, página de desambiguação ou puramente um indexador.',
            links: data.links
        });
    } catch (error) {
        return NextResponse.json({ error: 'Falha ao conectar com o banco de conhecimento.' }, { status: 500 });
    }
}
