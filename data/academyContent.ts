import { realFlashcards } from './academyFlashcards';
export type Flashcard = {
    id: string;
    question: string;
    options: string[];
    answer: string;
    teaching: string;
    difficulty: 'iniciante' | 'intermediario' | 'avancado';
    subject?: string;
};

export type LessonModule = {
    id: string;
    subjectId: string;
    title: string;
    description: string;
    content: string;
    quiz: Flashcard[];
    xpReward: number;
};

export type Subject = {
    id: string;
    name: string;
    icon: string;
    color: string;
    borderColor: string;
    bgColor: string;
};

export type CaseStudyChoice = {
    id: string;
    option: string;
    outcomeText: string;
    aiExplanation: string;
    impact: {
        revenue: number;
        cashflow: number;
        risk: number;
    };
};

export type CaseStudy = {
    id: string;
    title: string;
    scenario: string;
    industry: string;
    difficulty: 'iniciante' | 'intermediario' | 'avancado';
    choices: CaseStudyChoice[];
};

// ═══════════════════════════════════════════════════
// MATÉRIAS (Subjects)
// ═══════════════════════════════════════════════════
export const subjects: Subject[] = [
    {
        id: 'com_empresarial',
        name: 'Comunicação Empresarial I',
        icon: 'MessageSquareText',
        color: 'text-sky-400',
        borderColor: 'border-sky-500/50',
        bgColor: 'bg-sky-500/10',
    },
    {
        id: 'fund_admin',
        name: 'Fundamentos da Administração',
        icon: 'Building2',
        color: 'text-violet-400',
        borderColor: 'border-violet-500/50',
        bgColor: 'bg-violet-500/10',
    },
    {
        id: 'mat_aplicada',
        name: 'Matemática Aplicada',
        icon: 'Calculator',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/50',
        bgColor: 'bg-amber-500/10',
    },
    {
        id: 'teoria_econ',
        name: 'Teoria Econômica',
        icon: 'TrendingUp',
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/50',
        bgColor: 'bg-emerald-500/10',
    },
];

// ═══════════════════════════════════════════════════
// CAPÍTULOS / MÓDULOS (organizados por matéria)
// ═══════════════════════════════════════════════════
export const mockModules: LessonModule[] = [

    // ─── COMUNICAÇÃO EMPRESARIAL I ───────────────────
    {
        id: 'com_u1',
        subjectId: 'com_empresarial',
        title: 'Fundamentos da Comunicação Organizacional',
        description: 'Entenda como a comunicação funciona dentro das empresas.',
        xpReward: 300,
        quiz: [],
        content: `
## O que é Comunicação?

Comunicação é o processo de **transmitir uma mensagem** de uma pessoa (emissor) para outra (receptor) usando algum meio (canal). Parece simples, mas dentro de uma empresa, isso tem um peso enorme.

**Os elementos da comunicação são:**
- **Emissor:** quem envia a mensagem (ex: seu chefe te mandando um e-mail).
- **Receptor:** quem recebe (ex: você lendo o e-mail).
- **Mensagem:** o conteúdo (ex: "Preciso do relatório até sexta").
- **Canal:** o meio usado (ex: e-mail, reunião, WhatsApp corporativo).
- **Feedback:** a resposta do receptor (ex: você respondendo "Ok, chefe!").

## Comunicação Formal vs. Informal

- **Formal:** segue regras e hierarquia. Exemplo: um e-mail oficial do RH sobre férias.
- **Informal:** é espontânea, sem protocolo. Exemplo: conversa de corredor sobre o almoço.

Ambas são importantes! A informal cria laços de equipe, e a formal garante que informações críticas cheguem corretamente.

## Ruídos e Barreiras

**Ruído** é tudo que atrapalha a mensagem de chegar claramente. Exemplos:
- **Ruído físico:** barulho na sala de reunião.
- **Ruído semântico:** usar palavras que o outro não entende (gírias, jargões).
- **Ruído psicológico:** preconceitos ou desatenção de quem ouve.

Na empresa, eliminar ruídos é essencial para evitar mal-entendidos, retrabalho e até prejuízo financeiro!

## Comunicação Empresarial e Imagem

A forma como uma empresa se comunica define a **imagem** dela perante clientes, parceiros e funcionários. Comunicação ruim = imagem ruim = perda de negócios.
        `
    },
    {
        id: 'com_u2',
        subjectId: 'com_empresarial',
        title: 'Leitura, Argumentação e Textos',
        description: 'Aprenda a ler criticamente e construir argumentos sólidos.',
        xpReward: 300,
        quiz: [],
        content: `
## Estratégias de Leitura Crítica

Ler criticamente não é só "passar o olho". Significa:
- **Identificar a tese:** Qual é a ideia principal que o autor defende?
- **Avaliar os argumentos:** As provas que ele dá são convincentes?
- **Questionar:** "Será que isso faz sentido?"

## O Parágrafo Argumentativo

O parágrafo argumentativo tem uma estrutura simples:
1. **Tópico Frasal:** A ideia principal do parágrafo (ex: "A comunicação clara reduz custos").
2. **Desenvolvimento:** Explicação, dados, exemplos que provam a ideia.
3. **Conclusão do parágrafo:** Arremata e conecta ao próximo ponto.

## Tese e Defesa

- **Tese** é sua opinião ou posição sobre um tema.
- **Defesa** são os argumentos e evidências que sustentam sua tese.

Exemplo:
- Tese: "Empresas que investem em comunicação interna têm menos rotatividade."
- Defesa: dados de pesquisa, exemplos de empresas reais, lógica.

## Coesão e Coerência

- **Coesão:** as frases estão "costuradas" entre si com conectivos (porém, além disso, portanto).
- **Coerência:** o texto inteiro faz sentido lógico, sem contradições.

Um texto sem coesão parece "picotado". Um texto sem coerência parece "maluco".

## Linguagem Técnica e Formalidade

No mundo profissional, saber ajustar a linguagem é crucial. Você não escreve um relatório para diretores da mesma forma que manda uma mensagem para um colega. Formalidade não é ser chato, é ser **preciso e respeitoso**.
        `
    },
    {
        id: 'com_u3',
        subjectId: 'com_empresarial',
        title: 'Gêneros Empresariais (Documentos)',
        description: 'Conheça os principais documentos usados nas empresas.',
        xpReward: 300,
        quiz: [],
        content: `
## Os Documentos que Movem uma Empresa

No dia a dia corporativo, você vai lidar com vários tipos de documentos. Cada um tem um objetivo específico:

## E-mail Formal

É a ferramenta mais usada na comunicação profissional. Um bom e-mail formal tem:
- **Assunto claro** (ex: "Solicitação de aprovação do orçamento Q2").
- **Saudação** (Prezado Sr. Costa / Prezada Equipe).
- **Corpo objetivo** e direto ao ponto.
- **Encerramento cortês** (Atenciosamente / Cordialmente).

## Memorando (Memo)

É uma comunicação **interna** rápida entre setores ou departamentos. Serve para passar informações operacionais do dia a dia dentro da empresa. É curto e direto.

## Ata

É o registro escrito do que foi discutido e decidido em uma **reunião**. Funciona como a "memória oficial" do encontro. Quem faltou pode ler a ata e saber tudo que rolou.

## Relatório Técnico

Documento mais longo e detalhado. Apresenta dados, análises e conclusões sobre um projeto ou situação. Diretores usam relatórios para tomar decisões.

## Comunicado Oficial

Diferente do memo, o comunicado tem **caráter normativo amplo**. Pode ser direcionado a toda a empresa ou até à imprensa. Exemplo: "A empresa anuncia a fusão com a XYZ Corp."

## Proposta de Solução

É um documento onde você apresenta um problema e oferece uma solução estruturada. Muito usado em consultorias e projetos internos.
        `
    },
    {
        id: 'com_u4',
        subjectId: 'com_empresarial',
        title: 'Correção Linguística Aplicada',
        description: 'Domine as regras que fazem seus textos profissionais brilharem.',
        xpReward: 300,
        quiz: [],
        content: `
## Por que Escrever Correto Importa?

Erros de português em documentos profissionais passam uma imagem de **descuido e falta de preparo**. Um e-mail com erros pode custar um contrato!

## Concordância Verbal e Nominal

- **Verbal:** O verbo concorda com o sujeito. "Os diretores **aprovaram** o projeto." (e não "Os diretores aprovou").
- **Nominal:** Adjetivos concordam com o substantivo. "As propostas **apresentadas** foram **excelentes**."

## Regência Verbal e Nominal

Alguns verbos e nomes pedem preposições específicas:
- "Assistir **ao** filme" (assistir = ver → pede "a").
- "Obedecer **ao** regulamento" (obedecer → pede "a").
- "Preferir isso **a** aquilo" (preferir → pede "a", nunca "do que").

## Pontuação Estratégica

- **Vírgula:** separa ideias, enumera itens, isola explicações.
- **Ponto e vírgula:** separa itens em uma lista longa ou liga frases relacionadas.
- **Dois pontos:** introduz uma explicação, citação ou lista.

Dica: Se o texto ficou confuso, leia em voz alta. Onde você naturalmente pausa, provavelmente vai uma vírgula.

## Clareza e Objetividade

Regra de ouro do mundo corporativo: **seja direto**. Frases curtas, palavras simples, sem enrolação. O leitor (geralmente um executivo ocupado) agradece.

## Revisão e Reescrita

Todo texto profissional DEVE ser revisado antes de enviar. Releia pelo menos uma vez. Se possível, peça para outra pessoa ler também. Erros bobos acontecem, mas são evitáveis!
        `
    },

    // ─── FUNDAMENTOS DA ADMINISTRAÇÃO ────────────────
    {
        id: 'adm_u1',
        subjectId: 'fund_admin',
        title: 'O que é Administração?',
        description: 'Conceitos básicos, funções e o papel do administrador.',
        xpReward: 400,
        quiz: [],
        content: `
## Conceito de Administração

**Administrar** é o processo de **planejar, organizar, dirigir e controlar** os recursos de uma organização (pessoas, dinheiro, materiais, informações) para atingir objetivos de forma eficiente.

Em palavras simples: é fazer as coisas darem certo usando os recursos que você tem da melhor forma possível.

## As 4 Funções da Administração (PODC)

1. **Planejar:** Definir metas e como alcançá-las. "Para onde queremos ir e qual o caminho?"
2. **Organizar:** Distribuir tarefas, definir quem faz o quê. "Quem cuida de cada parte?"
3. **Dirigir:** Liderar e motivar as pessoas. "Vamos lá, time!"
4. **Controlar:** Acompanhar resultados e corrigir desvios. "Estamos no caminho certo?"

## Níveis Organizacionais

Uma empresa tem 3 níveis de gestão:
- **Estratégico (Topo):** Diretores e presidentes. Pensam a longo prazo (3-5 anos).
- **Tático (Meio):** Gerentes. Transformam a estratégia em planos de ação (meses).
- **Operacional (Base):** Supervisores e equipes. Executam as tarefas do dia a dia.

## O Papel do Administrador

O administrador é o profissional que toma **decisões** para que a empresa funcione bem. Ele precisa ter:
- **Habilidades Técnicas:** saber fazer (ex: usar planilhas, entender finanças).
- **Habilidades Humanas:** saber lidar com pessoas (ex: motivar equipe).
- **Habilidades Conceituais:** visão do todo (ex: entender como cada departamento se conecta).

## Tomada de Decisão

Toda decisão na empresa envolve **escolher entre alternativas**. O administrador precisa:
1. Identificar o problema.
2. Levantar opções.
3. Avaliar prós e contras.
4. Escolher a melhor opção.
5. Implementar e acompanhar.
        `
    },
    {
        id: 'adm_u2',
        subjectId: 'fund_admin',
        title: 'Desempenho Organizacional',
        description: 'Eficiência, eficácia, produtividade e qualidade.',
        xpReward: 400,
        quiz: [],
        content: `
## Eficiência vs. Eficácia

Esses são dois conceitos que SEMPRE caem em provas e são essenciais para qualquer administrador:

- **Eficiência:** Fazer as coisas da **maneira certa**. Foco nos **recursos** (gastar pouco, usar bem o tempo).
- **Eficácia:** Fazer a **coisa certa**. Foco nos **resultados** (atingir a meta).

**Exemplo Prático:**
- Um funcionário que entrega o relatório no prazo e com qualidade = **Eficiente E Eficaz** ✅
- Um funcionário que entrega o relatório certo, mas gastou 3x o orçamento = **Eficaz, mas INEFICIENTE** ⚠️
- Um funcionário que fez tudo rápido e barato, mas o relatório era do tema errado = **Eficiente, mas INEFICAZ** ❌

O ideal é sempre buscar **ser os dois ao mesmo tempo**.

## Produtividade

Produtividade = Resultado Obtido ÷ Recursos Utilizados.

Se você produz 100 peças usando R$ 500, sua produtividade é **0.2 peças/real**.
Se outro funcionário produz 100 peças usando R$ 300, a produtividade dele é **0.33 peças/real** (melhor!).

## Qualidade

Qualidade não é "ser perfeito". É **atender (ou superar) as expectativas do cliente**. Um produto barato pode ter alta qualidade se faz exatamente o que promete.

## Competitividade

É a capacidade de uma empresa ser **melhor que seus concorrentes** em algo (preço, qualidade, inovação, atendimento). Empresas que não são competitivas… fecham.

## Indicadores de Desempenho

São números que medem como a empresa está indo. Exemplos:
- **Taxa de defeitos:** % de produtos com problema.
- **Satisfação do cliente:** nota média que os clientes dão.
- **Margem de lucro:** quanto sobra de cada real vendido.
        `
    },
    {
        id: 'adm_u3',
        subjectId: 'fund_admin',
        title: 'Liderança e Motivação',
        description: 'Como liderar equipes e manter as pessoas motivadas.',
        xpReward: 400,
        quiz: [],
        content: `
## O que é Liderança?

Liderança é a capacidade de **influenciar pessoas** a trabalharem em direção a um objetivo. Não é só "mandar" — é inspirar, orientar e dar o exemplo.

## Estilos de Liderança

- **Autocrático:** O líder decide tudo sozinho. Rápido, mas pode desmotivar a equipe.
- **Democrático:** O líder ouve a equipe antes de decidir. Mais lento, mas gera comprometimento.
- **Liberal (Laissez-faire):** O líder dá liberdade total. Funciona com equipes maduras, mas pode virar bagunça com equipes novas.

Não existe estilo "certo" — o melhor líder sabe adaptar o estilo à situação.

## O que é Motivação?

Motivação é o que faz uma pessoa **querer** trabalhar e se esforçar. Sem motivação, mesmo os talentos mais brilhantes entregam pouco.

## Teoria de Herzberg (Dois Fatores)

Frederick Herzberg dividiu a motivação em dois grupos:

**Fatores Higiênicos (evitam insatisfação):**
- Salário justo
- Condições de trabalho adequadas
- Relação boa com colegas e chefe

**Fatores Motivacionais (geram satisfação):**
- Reconhecimento pelo trabalho
- Desafios e crescimento profissional
- Sentir que seu trabalho tem impacto

**Ponto crucial:** Pagar um salário alto não motiva por si só. Mas pagar mal CERTAMENTE desmotiva!

## Competências do Líder Moderno

- **Comunicação clara** (saber se fazer entender).
- **Empatia** (entender o lado da equipe).
- **Visão** (saber para onde estão indo).
- **Resiliência** (não desmoronar nas crises).
        `
    },
    {
        id: 'adm_u4',
        subjectId: 'fund_admin',
        title: 'Escolas da Administração',
        description: 'A evolução histórica do pensamento administrativo.',
        xpReward: 400,
        quiz: [],
        content: `
## Por que Estudar as Escolas?

A Administração como ciência evoluiu ao longo do tempo. Cada "escola" trouxe uma nova forma de enxergar as empresas.

## Administração Científica (Frederick Taylor, ~1900)

**Ideia central:** "Existe uma melhor forma de fazer cada tarefa, e devemos descobri-la cientificamente."

Taylor cronometrava trabalhadores em fábricas para descobrir o jeito mais rápido e eficiente de fazer cada etapa. Ele acreditava que pagar mais para quem produzisse mais motivaria todos.

**Contribuição:** Eficiência na produção.
**Crítica:** Tratava o trabalhador como uma "máquina" — só pensava em produtividade, não em bem-estar.

## Teoria Clássica (Henri Fayol, ~1916)

**Ideia central:** A administração precisa de **princípios universais** e de uma **estrutura hierárquica clara**.

Fayol criou as 4 funções que já vimos (Planejar, Organizar, Dirigir, Controlar) e definiu 14 princípios de administração (divisão do trabalho, autoridade, disciplina, etc.).

**Contribuição:** Deu estrutura à gestão.
**Crítica:** Muito rígida e formal — não considerava o fator humano.

## Teoria da Burocracia (Max Weber, ~1920)

**Ideia central:** Regras escritas, hierarquia rígida e impessoalidade tornam a organização mais justa e previsível.

Weber achava que as decisões deveriam ser baseadas em regras e não em favoritismo.

**Contribuição:** Formalização, regras claras, meritocracia.
**Crítica:** Excesso de burocracia torna tudo lento e engessado (a famosa "burocracia" que todo mundo reclama!).

## Resumo Rápido

| Escola | Foco | Pai Fundador |
|---|---|---|
| Científica | Eficiência da tarefa | Taylor |
| Clássica | Estrutura da empresa | Fayol |
| Burocrática | Regras e formalidade | Weber |
        `
    },

    // ─── MATEMÁTICA APLICADA ─────────────────────────
    {
        id: 'mat_u1',
        subjectId: 'mat_aplicada',
        title: 'Funções: Conceitos Básicos',
        description: 'O que é uma função, domínio e contradomínio.',
        xpReward: 350,
        quiz: [],
        content: `
## O que é uma Função?

Uma **função** é uma regra que associa cada valor de entrada (x) a **exatamente um** valor de saída (y).

Pense assim: uma máquina de suco. Você coloca laranja (entrada), ela produz suco de laranja (saída). Para cada fruta, sai um tipo de suco. Isso é uma função!

**Notação:** f(x) = 2x + 3
- Se x = 1 → f(1) = 2(1) + 3 = **5**
- Se x = 4 → f(4) = 2(4) + 3 = **11**

## Domínio e Contradomínio

- **Domínio:** todos os valores possíveis de **entrada** (x).
- **Contradomínio:** todos os valores possíveis de **saída** (y).
- **Imagem:** os valores de saída que **realmente acontecem**.

Exemplo: f(x) = x². Se x pode ser qualquer número real:
- Domínio = todos os números reais.
- Imagem = apenas números ≥ 0 (porque x² nunca é negativo).

## Crescimento e Decrescimento

- Uma função é **crescente** quando: se x aumenta, y também aumenta.
- Uma função é **decrescente** quando: se x aumenta, y diminui.

Exemplo real: "Quanto mais horas você estuda (x), maior sua nota (y)" → função crescente!

## Função Inversa

Se f(x) transforma x em y, a **função inversa** f⁻¹ faz o caminho contrário: transforma y de volta em x.

Exemplo: Se f(x) = 2x, então f⁻¹(y) = y/2.
        `
    },
    {
        id: 'mat_u2',
        subjectId: 'mat_aplicada',
        title: 'Funções e Modelos Econômicos',
        description: 'Demanda, oferta, custo e lucro como funções matemáticas.',
        xpReward: 350,
        quiz: [],
        content: `
## Matemática a Serviço da Economia

Na economia, quase tudo pode ser representado como uma **função matemática**. Isso permite prever comportamentos e tomar decisões melhores.

## Função de Demanda

A **demanda** é a quantidade que os consumidores querem comprar a um determinado preço.

Fórmula geral: Qd = a - bP (onde P é o preço)
- Se o preço **sobe**, a demanda geralmente **cai** (lei da demanda).
- Se o preço **desce**, as pessoas querem comprar **mais**.

## Função de Oferta

A **oferta** é a quantidade que os produtores querem vender a um determinado preço.

Fórmula geral: Qo = c + dP
- Se o preço **sobe**, os produtores querem vender **mais** (lucram mais).
- Se o preço **desce**, os produtores vendem **menos**.

## Função de Custo

Custo Total = Custo Fixo + Custo Variável

**Custo Fixo:** não muda com a produção (aluguel, salários fixos).
**Custo Variável:** muda conforme a produção (matéria-prima, energia).

Exemplo: CT(q) = 5000 + 15q
- 5000 = custo fixo (aluguel mensal)
- 15q = custa R$15 para produzir cada unidade

## Função de Lucro

Lucro = Receita Total - Custo Total
L(q) = RT(q) - CT(q)

Se a Receita é R(q) = 50q e o Custo é CT(q) = 5000 + 15q:
L(q) = 50q - 5000 - 15q = **35q - 5000**

Para ter lucro: 35q - 5000 > 0 → q > 142,8 → precisa vender pelo menos **143 unidades** para não ter prejuízo!
        `
    },
    {
        id: 'mat_u3',
        subjectId: 'mat_aplicada',
        title: 'Gráficos e Transformações',
        description: 'Representação visual de funções no plano cartesiano.',
        xpReward: 350,
        quiz: [],
        content: `
## Gráficos no Plano Cartesiano

O **plano cartesiano** é feito de dois eixos:
- **Eixo horizontal (x):** valores de entrada.
- **Eixo vertical (y):** valores de saída.

Cada ponto do gráfico é um par (x, y). Por exemplo, o ponto (3, 7) significa: quando x = 3, y = 7.

## Por que Gráficos Importam?

Gráficos permitem **visualizar** o comportamento de funções. Na economia e na administração, isso é poderoso:
- Ver onde a empresa começa a dar lucro.
- Entender como o preço afeta a demanda.
- Identificar tendências de crescimento.

## Rebatimento (Reflexão)

É como se você "espelhasse" o gráfico:
- **Rebatimento no eixo x:** Inverte para cima/baixo. f(x) vira -f(x).
- **Rebatimento no eixo y:** Inverte para esquerda/direita. f(x) vira f(-x).

## Translação (Deslocamento)

É "mover" o gráfico inteiro sem mudar sua forma:
- **Translação vertical:** f(x) + k move o gráfico **k unidades para cima** (ou para baixo se k for negativo).
- **Translação horizontal:** f(x - h) move o gráfico **h unidades para a direita** (ou esquerda se h for negativo).

Exemplo prático: Se o custo fixo de uma empresa sobe de R$5.000 para R$8.000, o gráfico de custos se desloca **3.000 unidades para cima** (translação vertical).
        `
    },
    {
        id: 'mat_u4',
        subjectId: 'mat_aplicada',
        title: 'Funções Fundamentais',
        description: 'Funções afim, quadrática, exponencial e logarítmica.',
        xpReward: 350,
        quiz: [],
        content: `
## Função Afim (1º Grau)

f(x) = ax + b → forma uma **reta** no gráfico.
- a = inclinação (se a > 0, cresce; se a < 0, decresce).
- b = onde a reta cruza o eixo y.

**Na economia:** Modelos de custo fixo + variável. CT(q) = 5000 + 15q é uma função afim!

## Função Quadrática (2º Grau)

f(x) = ax² + bx + c → forma uma **parábola** (formato de "U" ou "∩").
- Se a > 0: parábola abre para cima (ponto mínimo).
- Se a < 0: parábola abre para baixo (ponto máximo).

**Na economia:** Modelar o lucro máximo. O vértice da parábola indica a quantidade ideal de produção!

## Função Exponencial

f(x) = aˣ → cresce (ou decresce) muito rápido.
- Se a > 1: crescimento explosivo.
- Se 0 < a < 1: decaimento (perde valor rápido).

**Na economia:** Juros compostos! M = C × (1 + i)ⁿ
- Seu dinheiro cresce exponencialmente com o tempo.

## Função Logarítmica

f(x) = log(x) → é a "inversa" da exponencial.

**Na economia:** Usada para medir crescimento relativo e analisar taxas de retorno ao longo do tempo.

## Juros Simples vs. Compostos

- **Simples:** M = C × (1 + i × n) → cresce em linha reta (função afim).
- **Compostos:** M = C × (1 + i)ⁿ → cresce em curva (função exponencial).

Juros compostos são o "8º milagre do mundo" segundo Einstein. Dinheiro gerando dinheiro que gera mais dinheiro!
        `
    },
    {
        id: 'mat_u5',
        subjectId: 'mat_aplicada',
        title: 'Introdução aos Limites',
        description: 'O conceito intuitivo de limite e continuidade.',
        xpReward: 350,
        quiz: [],
        content: `
## O que é um Limite?

Imagine que você está andando em uma estrada e quer saber **para onde ela está indo** sem necessariamente chegar lá.

O **limite** de uma função f(x) quando x se aproxima de um valor "a" é o valor para o qual f(x) está caminhando.

**Notação:** lim (x→a) f(x) = L

Exemplo: Se f(x) = 2x, quando x se aproxima de 3:
lim (x→3) 2x = 6

## Limites Laterais

Você pode se aproximar de um ponto por **dois lados**:
- **Pela esquerda:** lim (x→a⁻) → vindo de valores menores.
- **Pela direita:** lim (x→a⁺) → vindo de valores maiores.

O limite "existe" se os dois lados dão o **mesmo resultado**.

## Continuidade

Uma função é **contínua** em x = a se:
1. f(a) existe (o ponto existe!).
2. O limite em x = a existe.
3. O limite é igual a f(a).

Se alguma dessas falha, a função tem um "buraco" ou "salto" naquele ponto.

## Por que Limites Importam na Economia?

- **Análise de tendência:** "Se continuarmos crescendo nesse ritmo, para onde vamos?"
- **Comportamento extremo:** "O que acontece com o custo médio quando a produção tende ao infinito?"
- São a **base** para entender Derivadas (próximo capítulo!).
        `
    },
    {
        id: 'mat_u6',
        subjectId: 'mat_aplicada',
        title: 'Derivadas e suas Aplicações',
        description: 'Taxa de variação, regras de derivação e otimização.',
        xpReward: 400,
        quiz: [],
        content: `
## O que é uma Derivada?

A derivada mede a **taxa de variação** de uma função. Em outras palavras: **"o quanto y muda quando x muda um pouquinho"**.

**Notação:** f'(x) ou df/dx

**Exemplo real:** Se sua receita é R(q) = 50q e você quer saber "quanto a receita muda se eu vender 1 unidade a mais?", a resposta é a derivada: R'(q) = 50. A cada unidade a mais, ganho R$50.

## Regras Básicas de Derivação

- **Constante:** A derivada de um número é 0. (5)' = 0
- **Potência:** (xⁿ)' = n × xⁿ⁻¹. Ex: (x³)' = 3x²
- **Constante vezes função:** (k × f)' = k × f'. Ex: (5x²)' = 10x
- **Soma:** (f + g)' = f' + g'

## Aplicação: Encontrando o Lucro Máximo

Se seu Lucro é L(q) = -2q² + 100q - 200:
1. Derive: L'(q) = -4q + 100
2. Iguale a zero: -4q + 100 = 0 → q = 25
3. Verifique: L''(q) = -4 (negativo → é um máximo!)

**Resposta:** Vendendo 25 unidades, você atinge o **lucro máximo**!

## Por que isso é Poderoso?

Na administração, a derivada responde perguntas como:
- "Qual a quantidade ideal para produzir?"
- "Quando devo parar de contratar funcionários?"
- "Qual preço maximiza meu faturamento?"

É literalmente a ferramenta para **otimizar decisões**!
        `
    },

    // ─── TEORIA ECONÔMICA ────────────────────────────
    {
        id: 'econ_u1',
        subjectId: 'teoria_econ',
        title: 'Introdução à Economia',
        description: 'Conceitos fundamentais, sistemas e agentes econômicos.',
        xpReward: 400,
        quiz: [],
        content: `
## O que é Economia?

Economia é a ciência que estuda como a **sociedade utiliza recursos escassos** (limitados) para produzir bens e serviços e distribuí-los entre as pessoas.

**O problema central:** Recursos são LIMITADOS, mas as necessidades humanas são ILIMITADAS. A Economia tenta resolver esse conflito.

## Os Agentes Econômicos

São os "jogadores" da economia:

1. **Famílias (Consumidores):** Compram produtos e serviços. Oferecem trabalho às empresas.
2. **Empresas (Produtores):** Produzem bens e serviços. Contratam trabalhadores.
3. **Governo:** Regula a economia, cobra impostos, oferece serviços públicos (saúde, educação).
4. **Setor Externo:** Outros países com quem fazemos comércio (importação e exportação).

## Sistemas Econômicos

- **Capitalismo (Economia de Mercado):** Os preços são definidos pela oferta e demanda. As empresas buscam lucro e os consumidores, satisfação.
- **Socialismo (Economia Planificada):** O governo decide o que produzir, quanto e para quem. Menor desigualdade, mas menos eficiência.
- **Economia Mista:** Combina mercado livre com intervenção do governo. É o modelo do Brasil!

## Evolução do Pensamento Econômico

- **Adam Smith (1776):** "Pai da Economia". Defendeu o livre mercado e a "mão invisível" (a ideia de que o mercado se auto-regula).
- **Karl Marx (1867):** Criticou o capitalismo e propôs uma sociedade sem propriedade privada.
- **John Maynard Keynes (1936):** Defendeu que o governo deve intervir na economia em momentos de crise.
        `
    },
    {
        id: 'econ_u2',
        subjectId: 'teoria_econ',
        title: 'Macroeconomia',
        description: 'PIB, inflação, políticas econômicas e o cenário nacional.',
        xpReward: 400,
        quiz: [],
        content: `
## O que é Macroeconomia?

Macroeconomia estuda a economia como um **todo**: o país inteiro, não apenas uma empresa ou pessoa.

## Conceitos Essenciais

**PIB (Produto Interno Bruto):** É a soma de **tudo** que o país produz em um ano.
- PIB alto = país produtivo.
- PIB caindo = recessão (economia encolhendo).

**Renda Nacional:** O total que as famílias ganham (salários + lucros + aluguéis).

**Inflação:** Aumento generalizado dos preços ao longo do tempo.
- Inflação alta = tudo fica mais caro, e o dinheiro perde valor.
- O Banco Central usa a taxa de juros (Selic) para controlar a inflação.

## Políticas Econômicas do Governo

**Política Fiscal:** Governo controla seus gastos e impostos.
- Gasta mais? Aquece a economia.
- Aumenta impostos? Freia o consumo.

**Política Monetária:** Banco Central controla a quantidade de dinheiro e os juros.
- Juros altos → menos empréstimos → economia esfria → inflação cai.
- Juros baixos → mais crédito → economia aquece → pode gerar inflação.

**Política Cambial:** Controla o valor do real frente ao dólar.
- Real fraco = exportações baratas (bom para exportadores), importações caras.
- Real forte = importações baratas, exportações caras.

**Balança Comercial:** Exportações - Importações.
- Positiva (superávit) = exportamos mais que importamos.
- Negativa (déficit) = importamos mais.

## Sistema Financeiro Nacional

Composto pelo Banco Central, bancos comerciais, bolsa de valores e outras instituições que fazem o dinheiro circular na economia.
        `
    },
    {
        id: 'econ_u3',
        subjectId: 'teoria_econ',
        title: 'Microeconomia e Mercado',
        description: 'Demanda, oferta, equilíbrio de mercado e estruturas.',
        xpReward: 400,
        quiz: [],
        content: `
## O que é Microeconomia?

Enquanto a Macroeconomia olha o país, a Microeconomia olha **de perto**: uma empresa, um consumidor, um produto específico.

## O que é Mercado?

Mercado é o **local** (físico ou virtual) onde compradores e vendedores se encontram. Pode ser:
- A feira do bairro.
- O site da Amazon.
- A Bolsa de Valores.

## Lei da Demanda (Procura)

Quanto **mais alto** o preço de um produto, **menos** as pessoas querem comprar. Quanto **mais baixo** o preço, **mais** as pessoas querem comprar.

**A Curva de Demanda** é uma linha descendente no gráfico (de cima pra baixo, da esquerda pra direita).

Fatores que afetam a demanda:
- Renda das famílias.
- Gosto/preferências.
- Preço de outros produtos (concorrentes ou complementares).

## Lei da Oferta

Quanto **mais alto** o preço, **mais** os produtores querem oferecer (porque lucram mais). Quanto **mais baixo** o preço, **menos** eles oferecem.

**A Curva de Oferta** é uma linha ascendente no gráfico (de baixo pra cima).

## Ponto de Equilíbrio

É o preço e a quantidade onde **oferta = demanda**. Nesse ponto:
- Não falta produto (sem escassez).
- Não sobra produto (sem excesso).
- O mercado está "equilibrado".

Se o preço estiver **acima** do equilíbrio → sobra produto (excedente).
Se o preço estiver **abaixo** do equilíbrio → falta produto (escassez).

## Estruturas de Mercado (Visão Geral)

- **Concorrência Perfeita:** Muitos vendedores, produto idêntico (difícil na vida real).
- **Monopólio:** Um único vendedor domina (ex: única empresa de água na cidade).
- **Oligopólio:** Poucos vendedores dominam (ex: operadoras de telefone).
- **Concorrência Monopolística:** Muitos vendedores, produtos semelhantes, mas diferenciados (ex: restaurantes).
        `
    },
];

// PÍLULAS
export const mockFlashcards: Flashcard[] = realFlashcards;

// ═══════════════════════════════════════════════════
// SIMULADOR DE CASO (Nível Iniciante)
// ═══════════════════════════════════════════════════
export const mockCaseStudies: CaseStudy[] = [
    {
        id: 'case_com', title: 'Crise de Comunicação na TechBrasil', industry: 'Comunicação Empresarial', difficulty: 'intermediario',
        scenario: 'A TechBrasil enviou um comunicado oficial ao mercado com graves erros de concordância verbal, linguagem informal e sem revisão. A imprensa repercutiu negativamente. O diretor de comunicação precisa tomar uma atitude imediata conforme as boas práticas de gêneros empresariais e correção linguística.',
        choices: [
            { id: 'cc_a', option: 'Publicar uma errata informal no Instagram da empresa, usando gírias para "humanizar" a marca.', outcomeText: 'A situação piorou. A informalidade em canal inadequado reforçou a imagem de amadorismo.', aiExplanation: 'Comunicados oficiais exigem formalidade, clareza e revisão (Unidade III e IV). Redes sociais informais não substituem canais formais para retratação corporativa.', impact: { revenue: -15, cashflow: -5, risk: +40 } },
            { id: 'cc_b', option: 'Emitir um novo Comunicado Oficial revisado, com concordância correta, linguagem formal e objetiva, distribuído pelos canais corporativos adequados.', outcomeText: 'A empresa recuperou credibilidade. A imprensa elogiou a transparência e o profissionalismo da retificação.', aiExplanation: 'Excelente! Usou gênero empresarial correto (Comunicado) com revisão linguística (concordância, regência, pontuação da Unidade IV).', impact: { revenue: +10, cashflow: +5, risk: -30 } }
        ]
    },
    {
        id: 'case_adm', title: 'A Reestruturação da AlphaCorp', industry: 'Administração', difficulty: 'intermediario',
        scenario: 'A AlphaCorp tem produtividade caindo, liderança autocrática e equipe desmotivada. Os indicadores mostram alta eficiência (custos controlados) mas baixa eficácia (metas não são atingidas). O conselho pede uma reestruturação baseada nos fundamentos da Administração.',
        choices: [
            { id: 'ca_a', option: 'Cortar salários (fator higiênico) e impor regras burocráticas rígidas (Weber) para forçar disciplina.', outcomeText: 'Desastre. Cortar fatores higiênicos gerou insatisfação massiva (Herzberg). A burocracia engessou decisões.', aiExplanation: 'Unidade III: Fatores higiênicos evitam insatisfação. Cortá-los gera revolta. A burocracia extrema (Weber) trava processos sem resolver a eficácia.', impact: { revenue: -20, cashflow: -10, risk: +50 } },
            { id: 'ca_b', option: 'Transitar para liderança democrática, implementar fatores motivacionais (reconhecimento, desafios) e usar indicadores de desempenho para equilibrar eficiência e eficácia.', outcomeText: 'A equipe se engajou. Os indicadores melhoraram em ambas as frentes. A empresa atingiu as metas trimestrais.', aiExplanation: 'Combinou Unidade II (eficiência + eficácia), Unidade III (Herzberg + liderança democrática) e indicadores de desempenho organizacional.', impact: { revenue: +15, cashflow: +20, risk: -20 } }
        ]
    },
    {
        id: 'case_mat', title: 'Otimização da Fábrica NovaTech', industry: 'Matemática Aplicada', difficulty: 'avancado',
        scenario: 'A NovaTech tem Lucro dado por L(q) = -3q² + 150q - 1200. O custo fixo é R$1.200/mês. O gerente quer saber: qual quantidade de produção maximiza o lucro? E qual o lucro máximo? Use derivadas para resolver.',
        choices: [
            { id: 'cm_a', option: 'Derivar: L\'(q) = -6q + 150 = 0 → q = 25 unidades. L(25) = -3(625) + 150(25) - 1200 = R$ 675. Lucro máximo com 25 unidades.', outcomeText: 'Correto! A derivada encontrou o ponto crítico e L\'\'(q) = -6 < 0 confirma máximo.', aiExplanation: 'Unidade 7: Aplicação direta de derivadas em otimização. Derivar, igualar a zero, verificar sinal da segunda derivada.', impact: { revenue: +25, cashflow: +30, risk: -15 } },
            { id: 'cm_b', option: 'Produzir o máximo possível (q = 1000) para maximizar receita bruta, ignorando custos.', outcomeText: 'L(1000) seria absurdamente negativo. Produzir sem análise matemática resultou em prejuízo gigantesco.', aiExplanation: 'Sem usar derivada, não há como saber o ponto ótimo. Mais produção ≠ mais lucro quando há custo quadrático crescente.', impact: { revenue: -40, cashflow: -60, risk: +70 } }
        ]
    },
    {
        id: 'case_econ', title: 'O Choque de Política Monetária', industry: 'Teoria Econômica', difficulty: 'intermediario',
        scenario: 'O Banco Central elevou a Selic em 1,5% para combater inflação de serviços. Você é assessor econômico. Os setores de consumo discricionário estão preocupados. Use conceitos de Macroeconomia (Política Monetária, Fiscal e Cambial) para orientar a estratégia.',
        choices: [
            { id: 'ce_a', option: 'Recomendar expansão agressiva do crédito ao consumidor, pois juros altos significam mais dinheiro circulando.', outcomeText: 'Errado. Juros altos ENCARECEM o crédito e FREIAM o consumo. A recomendação piorou a situação do setor.', aiExplanation: 'Unidade 2: Política Monetária restritiva (Selic alta) = crédito caro = menos consumo. É o contrário do que foi recomendado.', impact: { revenue: -20, cashflow: -30, risk: +60 } },
            { id: 'ce_b', option: 'Orientar cautela: reduzir dependência de crédito, focar em produtos essenciais, observar a balança comercial e aguardar sinalização da Política Fiscal do governo.', outcomeText: 'Abordagem prudente. A empresa atravessou o ciclo de aperto sem alavancagem perigosa e se recuperou quando os juros caíram.', aiExplanation: 'Combinou Política Monetária (Selic), Fiscal (gastos do governo) e conceitos de renda e PIB (Unidade 2) para uma leitura macro completa.', impact: { revenue: +5, cashflow: +15, risk: -25 } }
        ]
    }
];

// ═══════════════════════════════════════════════════
// BADGES, TRILHAS E BRIEFING DIÁRIO
// ═══════════════════════════════════════════════════
export type Badge = { id: string; name: string; description: string; icon: string; color: string; requirement: string; };
export type LearningPath = { id: string; title: string; description: string; modules: string[]; rewardBadgeId?: string; };
export type DailyBriefing = { date: string; headline: string; summary: string; impact: string; relatedSubjectId?: string; };

export const badges: Badge[] = [
    { id: 'b_iniciante', name: 'Calouro Promissor', description: 'Alcançou o Nível 2 na Academia.', icon: 'Star', color: 'text-amber-400', requirement: 'level:2' },
    { id: 'b_comunicador', name: 'Comunicador Elite', description: 'Concluiu todas as unidades de Comunicação Empresarial.', icon: 'MessageSquareText', color: 'text-sky-400', requirement: 'path:comunicacao' },
    { id: 'b_admin', name: 'Administrador Nato', description: 'Concluiu todas as unidades de Administração.', icon: 'Building2', color: 'text-violet-400', requirement: 'path:administracao' },
    { id: 'b_matematico', name: 'Mestre dos Números', description: 'Concluiu todas as unidades de Matemática Aplicada.', icon: 'Calculator', color: 'text-amber-400', requirement: 'path:matematica' },
    { id: 'b_economista', name: 'Economista Visionário', description: 'Concluiu todas as unidades de Teoria Econômica.', icon: 'TrendingUp', color: 'text-emerald-400', requirement: 'path:economia' },
    { id: 'b_estrategista', name: 'Estrategista', description: 'Acertou 3 casos no Simulador.', icon: 'BrainCircuit', color: 'text-violet-400', requirement: 'cases:3' },
];

export const learningPaths: LearningPath[] = [
    {
        id: 'path_fundamentos', title: 'Jornada do Calouro', description: 'A base de tudo: entre nas 4 matérias pela porta da frente, estudando a Unidade I de cada disciplina.',
        modules: ['com_u1', 'adm_u1', 'mat_u1', 'econ_u1'], rewardBadgeId: 'b_iniciante'
    },
    {
        id: 'path_comunicacao', title: 'Dominando a Comunicação', description: 'Das barreiras comunicacionais à revisão textual: cubra 100% do conteúdo de Comunicação Empresarial I.',
        modules: ['com_u1', 'com_u2', 'com_u3', 'com_u4'], rewardBadgeId: 'b_comunicador'
    },
    {
        id: 'path_admin', title: 'Formação em Administração', description: 'De Taylor a Herzberg: domine todos os conceitos de Fundamentos da Administração.',
        modules: ['adm_u1', 'adm_u2', 'adm_u3', 'adm_u4'], rewardBadgeId: 'b_admin'
    },
    {
        id: 'path_matematica', title: 'Trilha da Matemática Pura', description: 'De funções a derivadas: percorra o caminho completo da Matemática Aplicada, incluindo limites e L\'Hôpital.',
        modules: ['mat_u1', 'mat_u2', 'mat_u3', 'mat_u4', 'mat_u5', 'mat_u6'], rewardBadgeId: 'b_matematico'
    },
    {
        id: 'path_economia', title: 'Entendendo a Economia', description: 'Macro e Micro: dos agentes econômicos ao ponto de equilíbrio de mercado.',
        modules: ['econ_u1', 'econ_u2', 'econ_u3'], rewardBadgeId: 'b_economista'
    },
    {
        id: 'path_avancado', title: 'Integração Interdisciplinar', description: 'Conecte Economia + Matemática: use funções para modelar demanda, otimize lucro com derivadas e analise políticas macro.',
        modules: ['mat_u2', 'mat_u6', 'econ_u2', 'econ_u3'],
    }
];

export const dailyBriefingMock: DailyBriefing = {
    date: new Date().toISOString(),
    headline: 'Banco Central Mantém Taxa Selic em 13,25%',
    summary: 'O Copom decidiu manter a taxa básica de juros inalterada. Na Unidade 2 de Teoria Econômica, você aprendeu que a Selic é a principal ferramenta de Política Monetária.',
    impact: 'Juros altos encarecem crédito (Macro), freiam consumo e impactam funções de demanda (Mat Aplicada + Micro). Conecte os conceitos!',
    relatedSubjectId: 'teoria_econ'
};

// ═══════════════════════════════════════════════════
// GLOSSÁRIO ACADÊMICO (DICIONÁRIO NEXUS)
// ═══════════════════════════════════════════════════
export type DictionaryTerm = {
    id: string;
    term: string;
    definition: string;
    category: 'Comunicação Empresarial' | 'Administração' | 'Matemática Aplicada' | 'Teoria Econômica' | 'Geral';
    example?: string;
    relatedTerms?: string[];
};

export const dictionaryTerms: DictionaryTerm[] = [
    // ─── COMUNICAÇÃO EMPRESARIAL I (Unidades I-IV) ───
    { id: 't1', term: 'Emissor', definition: 'Quem envia a mensagem no processo de comunicação.', category: 'Comunicação Empresarial', example: 'Seu chefe enviando um e-mail com instruções.', relatedTerms: ['Receptor', 'Canal', 'Feedback'] },
    { id: 't2', term: 'Receptor', definition: 'Quem recebe e interpreta a mensagem enviada pelo emissor.', category: 'Comunicação Empresarial', example: 'Você lendo o e-mail do chefe.', relatedTerms: ['Emissor', 'Ruído'] },
    { id: 't3', term: 'Canal de Comunicação', definition: 'O meio utilizado para transmitir a mensagem (e-mail, reunião, WhatsApp corporativo, etc).', category: 'Comunicação Empresarial', relatedTerms: ['Emissor', 'Receptor'] },
    { id: 't4', term: 'Feedback', definition: 'A resposta do receptor ao emissor, completando o ciclo de comunicação.', category: 'Comunicação Empresarial', example: 'Responder "OK, entendido" ao e-mail recebido.' },
    { id: 't5', term: 'Ruído na Comunicação', definition: 'Qualquer interferência que distorce a mensagem. Pode ser físico (barulho), semântico (vocabulário) ou psicológico (preconceito).', category: 'Comunicação Empresarial', example: 'Ruído semântico: usar jargões técnicos com leigos.', relatedTerms: ['Barreira Comunicacional'] },
    { id: 't6', term: 'Comunicação Formal', definition: 'Segue regras, hierarquia e protocolos da empresa. Ex: e-mails oficiais, memorandos, atas.', category: 'Comunicação Empresarial', relatedTerms: ['Comunicação Informal'] },
    { id: 't7', term: 'Comunicação Informal', definition: 'Espontânea, sem protocolo rígido. Ex: conversas de corredor, cafezinho.', category: 'Comunicação Empresarial', relatedTerms: ['Comunicação Formal'] },
    { id: 't8', term: 'Tópico Frasal', definition: 'A frase principal de um parágrafo argumentativo, que apresenta a ideia central a ser desenvolvida.', category: 'Comunicação Empresarial', example: '"A comunicação clara reduz custos operacionais."', relatedTerms: ['Coesão', 'Coerência'] },
    { id: 't9', term: 'Coesão Textual', definition: 'A "costura" entre frases usando conectivos (porém, além disso, portanto), criando fluidez no texto.', category: 'Comunicação Empresarial', relatedTerms: ['Coerência Textual'] },
    { id: 't10', term: 'Coerência Textual', definition: 'A lógica geral do texto, sem contradições. O texto todo faz sentido do início ao fim.', category: 'Comunicação Empresarial', relatedTerms: ['Coesão Textual'] },
    { id: 't11', term: 'Ata', definition: 'Registro escrito e oficial de tudo que foi discutido e decidido em uma reunião corporativa.', category: 'Comunicação Empresarial', relatedTerms: ['Memorando', 'Relatório Técnico'] },
    { id: 't12', term: 'Memorando', definition: 'Comunicação interna rápida entre setores de uma empresa para informações operacionais.', category: 'Comunicação Empresarial', relatedTerms: ['Ata', 'Comunicado Oficial'] },
    { id: 't13', term: 'Relatório Técnico', definition: 'Documento longo e detalhado com dados, análises e conclusões sobre projetos ou situações empresariais.', category: 'Comunicação Empresarial' },
    { id: 't14', term: 'Concordância Verbal', definition: 'Regra gramatical: o verbo deve concordar com o sujeito em número e pessoa. "Os diretores APROVARAM" (não "aprovou").', category: 'Comunicação Empresarial', relatedTerms: ['Concordância Nominal', 'Regência'] },
    { id: 't15', term: 'Regência Verbal', definition: 'Certos verbos exigem preposições específicas. "Assistir AO filme", "Obedecer AO regulamento".', category: 'Comunicação Empresarial', relatedTerms: ['Concordância Verbal'] },
    // ─── FUNDAMENTOS DA ADMINISTRAÇÃO (Unidades I-IV) ───
    { id: 't16', term: 'PODC (Funções Administrativas)', definition: 'As 4 funções da Administração: Planejar (definir metas), Organizar (distribuir tarefas), Dirigir (liderar) e Controlar (acompanhar resultados).', category: 'Administração', relatedTerms: ['Teoria Clássica', 'Fayol'] },
    { id: 't17', term: 'Eficiência', definition: 'Fazer as coisas da maneira certa, focando na otimização dos recursos (gastar menos, usar bem o tempo).', category: 'Administração', example: 'Entregar o relatório gastando metade do orçamento.', relatedTerms: ['Eficácia', 'Produtividade'] },
    { id: 't18', term: 'Eficácia', definition: 'Fazer a coisa certa, focando no resultado (atingir a meta independente do recurso gasto).', category: 'Administração', example: 'O relatório foi entregue sobre o tema correto, mas custou 3x mais.', relatedTerms: ['Eficiência'] },
    { id: 't19', term: 'Produtividade', definition: 'Resultado obtido dividido pelos recursos utilizados. Quanto mais resultado com menos recursos, maior a produtividade.', category: 'Administração', example: '100 peças ÷ R$300 = 0.33 peças/real.', relatedTerms: ['Eficiência', 'Competitividade'] },
    { id: 't20', term: 'Competitividade', definition: 'Capacidade de uma empresa ser melhor que concorrentes em algum aspecto (preço, qualidade, inovação).', category: 'Administração' },
    { id: 't21', term: 'Níveis Organizacionais', definition: 'Estratégico (diretores, longo prazo), Tático (gerentes, médio prazo) e Operacional (equipes, dia a dia).', category: 'Administração', relatedTerms: ['PODC'] },
    { id: 't22', term: 'Liderança Autocrática', definition: 'O líder decide tudo sozinho. Rápido, mas pode desmotivar a equipe.', category: 'Administração', relatedTerms: ['Liderança Democrática', 'Liderança Liberal'] },
    { id: 't23', term: 'Liderança Democrática', definition: 'O líder ouve a equipe antes de decidir. Mais lento, mas gera comprometimento.', category: 'Administração', relatedTerms: ['Liderança Autocrática'] },
    { id: 't24', term: 'Teoria de Herzberg (Dois Fatores)', definition: 'Divide motivação em: Fatores Higiênicos (salário, condições — evitam insatisfação) e Fatores Motivacionais (reconhecimento, desafio — geram satisfação).', category: 'Administração', example: 'Pagar bem não motiva, mas pagar mal CERTAMENTE desmotiva.', relatedTerms: ['Motivação'] },
    { id: 't25', term: 'Administração Científica (Taylor)', definition: 'Escola de ~1900 focada na eficiência da tarefa. Taylor cronometrava trabalhadores para descobrir o método mais rápido e produtivo.', category: 'Administração', relatedTerms: ['Teoria Clássica', 'Burocracia'] },
    { id: 't26', term: 'Teoria Clássica (Fayol)', definition: 'Escola de ~1916 focada na estrutura organizacional e nos princípios universais de gestão. Criou o PODC e 14 princípios.', category: 'Administração', relatedTerms: ['PODC', 'Taylor'] },
    { id: 't27', term: 'Teoria Burocrática (Weber)', definition: 'Escola focada em regras escritas, hierarquia rígida e impessoalidade para tornar a organização mais justa e previsível.', category: 'Administração', example: 'Regras claras evitam favoritismo, mas excesso vira "burocracia engessada".', relatedTerms: ['Fayol', 'Taylor'] },
    // ─── MATEMÁTICA APLICADA (Unidades 1-7) ───
    { id: 't28', term: 'Função Matemática', definition: 'Regra que associa cada valor de entrada (x) a exatamente um valor de saída (y). Notação: f(x).', category: 'Matemática Aplicada', example: 'f(x) = 2x + 3 → se x=1, f(1)=5.', relatedTerms: ['Domínio', 'Contradomínio'] },
    { id: 't29', term: 'Domínio e Contradomínio', definition: 'Domínio = valores possíveis de entrada (x). Contradomínio = valores possíveis de saída (y). Imagem = saídas que realmente ocorrem.', category: 'Matemática Aplicada', relatedTerms: ['Função'] },
    { id: 't30', term: 'Função de Demanda', definition: 'Modela quanto os consumidores querem comprar a cada preço. Qd = a - bP (preço sobe → demanda cai).', category: 'Matemática Aplicada', relatedTerms: ['Função de Oferta', 'Elasticidade'] },
    { id: 't31', term: 'Função Afim (1º Grau)', definition: 'f(x) = ax + b. Forma uma reta no gráfico. Na economia, modela custo fixo + variável.', category: 'Matemática Aplicada', example: 'CT(q) = 5000 + 15q é uma função afim.', relatedTerms: ['Função Quadrática'] },
    { id: 't32', term: 'Função Exponencial', definition: 'f(x) = aˣ. Cresce ou decresce rapidamente. Modela juros compostos: M = C(1+i)ⁿ.', category: 'Matemática Aplicada', relatedTerms: ['Função Logarítmica', 'Juros Compostos'] },
    { id: 't33', term: 'Rebatimento (Reflexão)', definition: 'Espelhar o gráfico: -f(x) rebate no eixo x; f(-x) rebate no eixo y.', category: 'Matemática Aplicada', relatedTerms: ['Translação'] },
    { id: 't34', term: 'Translação', definition: 'Deslocar o gráfico sem mudar a forma: f(x)+k move verticalmente; f(x-h) move horizontalmente.', category: 'Matemática Aplicada', relatedTerms: ['Rebatimento'] },
    { id: 't35', term: 'Limite de uma Função', definition: 'O valor para o qual f(x) caminha quando x se aproxima de um ponto "a". Notação: lim(x→a) f(x) = L.', category: 'Matemática Aplicada', relatedTerms: ['Limites Laterais', 'Continuidade'] },
    { id: 't36', term: 'Continuidade', definition: 'f é contínua em a se: f(a) existe, o limite existe, e o limite é igual a f(a). Senão, há um "buraco" ou "salto".', category: 'Matemática Aplicada', relatedTerms: ['Limite'] },
    { id: 't37', term: 'Teorema do Confronto', definition: 'Se g(x) ≤ f(x) ≤ h(x) e lim g(x) = lim h(x) = L, então lim f(x) = L. Usado para "prender" um limite entre dois conhecidos.', category: 'Matemática Aplicada', relatedTerms: ['Limite'] },
    { id: 't38', term: 'Derivada', definition: 'Taxa de variação instantânea: f\'(x) = lim(h→0) [f(x+h) - f(x)] / h. Mede "quanto y muda quando x muda um pouquinho".', category: 'Matemática Aplicada', example: 'R\'(q) = 50 significa que cada unidade extra gera R$50 de receita.', relatedTerms: ['Regra do Produto', 'Regra do Quociente'] },
    { id: 't39', term: 'Regras de Derivação', definition: 'Constante: (c)\' = 0. Potência: (xⁿ)\' = nxⁿ⁻¹. Produto: (fg)\' = f\'g + fg\'. Quociente: (f/g)\' = (f\'g - fg\') / g².', category: 'Matemática Aplicada', relatedTerms: ['Derivada', 'Regra da Cadeia'] },
    { id: 't40', term: 'Teorema do Valor Médio', definition: 'Se f é contínua em [a,b] e derivável em (a,b), existe c onde f\'(c) = [f(b)-f(a)]/(b-a). A taxa média é atingida em algum ponto.', category: 'Matemática Aplicada', relatedTerms: ['Regra de L\'Hôpital'] },
    { id: 't41', term: 'Regra de L\'Hôpital', definition: 'Para limites indeterminados (0/0 ou ∞/∞): lim f(x)/g(x) = lim f\'(x)/g\'(x). Derive numerador e denominador.', category: 'Matemática Aplicada', relatedTerms: ['Teorema do Valor Médio', 'Limite'] },
    // ─── TEORIA ECONÔMICA (Unidades 1-3) ───
    { id: 't42', term: 'Economia', definition: 'Ciência que estuda como a sociedade utiliza recursos escassos (limitados) para produzir bens e satisfazer necessidades ilimitadas.', category: 'Teoria Econômica', relatedTerms: ['Agentes Econômicos'] },
    { id: 't43', term: 'Agentes Econômicos', definition: 'Os 4 "jogadores" da economia: Famílias (consomem), Empresas (produzem), Governo (regula) e Setor Externo (comércio internacional).', category: 'Teoria Econômica' },
    { id: 't44', term: 'Sistemas Econômicos', definition: 'Capitalismo (livre mercado), Socialismo (planejado pelo governo) e Economia Mista (combina ambos — modelo do Brasil).', category: 'Teoria Econômica', relatedTerms: ['Adam Smith', 'Karl Marx'] },
    { id: 't45', term: 'PIB (Produto Interno Bruto)', definition: 'Soma de TUDO que o país produz em um ano. PIB alto = país produtivo. PIB caindo = recessão.', category: 'Teoria Econômica', relatedTerms: ['Renda Nacional', 'Inflação'] },
    { id: 't46', term: 'Inflação', definition: 'Aumento generalizado dos preços ao longo do tempo. O dinheiro "perde valor". O BC usa a Selic para controlá-la.', category: 'Teoria Econômica', relatedTerms: ['Selic', 'Política Monetária'] },
    { id: 't47', term: 'Política Monetária', definition: 'Banco Central controla dinheiro e juros. Selic alta → menos crédito → economia esfria → inflação cai.', category: 'Teoria Econômica', relatedTerms: ['Política Fiscal', 'Selic'] },
    { id: 't48', term: 'Política Fiscal', definition: 'Governo controla seus gastos e impostos. Gastar mais aquece a economia; aumentar impostos freia o consumo.', category: 'Teoria Econômica', relatedTerms: ['Política Monetária'] },
    { id: 't49', term: 'Política Cambial', definition: 'Controla o valor do real frente ao dólar. Real fraco = exportações baratas; Real forte = importações baratas.', category: 'Teoria Econômica', relatedTerms: ['Balança Comercial'] },
    { id: 't50', term: 'Balança Comercial', definition: 'Exportações menos Importações. Positiva (superávit) = exportamos mais. Negativa (déficit) = importamos mais.', category: 'Teoria Econômica', relatedTerms: ['Política Cambial'] },
    { id: 't51', term: 'Lei da Demanda', definition: 'Quanto MAIOR o preço, MENOR a quantidade demandada. A curva de demanda é descendente.', category: 'Teoria Econômica', example: 'Preço sobe → pessoas compram menos.', relatedTerms: ['Lei da Oferta', 'Ponto de Equilíbrio'] },
    { id: 't52', term: 'Lei da Oferta', definition: 'Quanto MAIOR o preço, MAIOR a quantidade ofertada (produtores lucram mais). Curva ascendente.', category: 'Teoria Econômica', relatedTerms: ['Lei da Demanda'] },
    { id: 't53', term: 'Ponto de Equilíbrio', definition: 'Preço e quantidade onde oferta = demanda. Não falta nem sobra produto.', category: 'Teoria Econômica', relatedTerms: ['Excedente', 'Escassez'] },
    { id: 't54', term: 'Estruturas de Mercado', definition: 'Concorrência Perfeita (muitos vendedores, produto idêntico), Monopólio (1 vendedor), Oligopólio (poucos vendedores), Conc. Monopolística (muitos, produtos diferenciados).', category: 'Teoria Econômica' },
    { id: 't55', term: 'Adam Smith', definition: '"Pai da Economia" (1776). Defendeu o livre mercado e a "mão invisível" (mercado se auto-regula).', category: 'Teoria Econômica', relatedTerms: ['Karl Marx', 'Keynes'] },
];

// ═══════════════════════════════════════════════════
// FÓRMULAS RÁPIDAS (CHEAT SHEET)
// ═══════════════════════════════════════════════════
export type FormulaEntry = {
    id: string;
    title: string;
    formula: string;
    description: string;
    category: 'Funções' | 'Limites' | 'Derivadas' | 'Otimização';
    example?: string;
};

export const formulaSheet: FormulaEntry[] = [
    { id: 'f1', title: 'Função Afim (1° grau)', formula: 'f(x) = ax + b', description: 'Reta. "a" é a inclinação, "b" é onde corta o eixo Y.', category: 'Funções', example: 'Receita = preço × quantidade → R(q) = 50q' },
    { id: 'f2', title: 'Função Quadrática (2° grau)', formula: 'f(x) = ax² + bx + c', description: 'Parábola. a>0 abre pra cima, a<0 abre pra baixo. Vértice: x = -b/2a', category: 'Funções', example: 'Lucro máximo: L(q) = -2q² + 100q - 200' },
    { id: 'f3', title: 'Função Exponencial', formula: 'f(x) = a · bˣ', description: 'Crescimento/decrescimento exponencial. b>1 cresce, 0<b<1 decresce.', category: 'Funções', example: 'Juros compostos: M = C(1+i)ⁿ' },
    { id: 'f4', title: 'Função Logarítmica', formula: 'f(x) = logₐ(x)', description: 'Inversa da exponencial. Cresce lentamente.', category: 'Funções' },
    { id: 'f5', title: 'Domínio e Imagem', formula: 'D(f) → x válidos | Im(f) → y válidos', description: 'Domínio: valores que x pode assumir. Imagem: valores que f(x) produz.', category: 'Funções' },
    { id: 'f6', title: 'Definição de Limite', formula: 'lim(x→a) f(x) = L', description: 'O valor que f(x) se aproxima quando x tende a "a".', category: 'Limites' },
    { id: 'f7', title: 'Limite no Infinito', formula: 'lim(x→∞) k/xⁿ = 0', description: 'Qualquer constante dividida por x que cresce infinitamente tende a zero.', category: 'Limites', example: 'Custo Fixo Médio: CF/q → 0 quando q → ∞' },
    { id: 'f8', title: 'Teorema do Confronto', formula: 'g(x) ≤ f(x) ≤ h(x)', description: 'Se g e h tendem ao mesmo L, então f também tende a L.', category: 'Limites' },
    { id: 'f9', title: 'Regra de L\'Hôpital', formula: 'lim f/g = lim f\'/g\'', description: 'Quando limite dá 0/0 ou ∞/∞, derive numerador e denominador separadamente.', category: 'Limites' },
    { id: 'f10', title: 'Derivada — Definição', formula: 'f\'(x) = lim(h→0) [f(x+h) - f(x)] / h', description: 'Taxa de variação instantânea. Inclinação da reta tangente.', category: 'Derivadas' },
    { id: 'f11', title: 'Regra da Potência', formula: 'd/dx [xⁿ] = n · xⁿ⁻¹', description: 'Derivar potência: arrasta o expoente e diminui 1.', category: 'Derivadas', example: 'd/dx [x³] = 3x²' },
    { id: 'f12', title: 'Regra do Produto', formula: '(f·g)\' = f\'·g + f·g\'', description: 'Derivada do primeiro × segundo + primeiro × derivada do segundo.', category: 'Derivadas' },
    { id: 'f13', title: 'Regra do Quociente', formula: '(f/g)\' = (f\'·g - f·g\') / g²', description: 'Derivada de cima × baixo - cima × derivada de baixo, tudo sobre o quadrado de baixo.', category: 'Derivadas' },
    { id: 'f14', title: 'Receita Marginal', formula: 'RMg = dR/dq', description: 'Derivada da Receita mostra a receita extra gerada por uma unidade adicional.', category: 'Otimização', example: 'R(q) = 100q - q² → RMg = 100 - 2q' },
    { id: 'f15', title: 'Lucro Máximo', formula: 'L\'(q) = 0 e L\'\'(q) < 0', description: 'Lucro é máximo quando derivada=0 e segunda derivada negativa (concavidade pra baixo).', category: 'Otimização' },
];

// ═══════════════════════════════════════════════════
// COMPARADOR DE CONCEITOS
// ═══════════════════════════════════════════════════
export type ConceptComparison = {
    id: string;
    subject: string;
    conceptA: { name: string; description: string; keyPoints: string[] };
    conceptB: { name: string; description: string; keyPoints: string[] };
    verdict: string;
};

export const conceptComparisons: ConceptComparison[] = [
    {
        id: 'cmp1', subject: 'Administração',
        conceptA: { name: 'Eficiência', description: 'Fazer da maneira certa. Foco nos MEIOS e RECURSOS.', keyPoints: ['Minimizar desperdício', 'Usar menos recursos', 'Processo otimizado', 'Taylor (tempos e movimentos)'] },
        conceptB: { name: 'Eficácia', description: 'Fazer a coisa certa. Foco nos RESULTADOS e METAS.', keyPoints: ['Atingir o objetivo', 'Não importa o custo', 'Meta cumprida', 'Fayol (resultados globais)'] },
        verdict: 'O ideal é ser EFETIVO: eficiente + eficaz ao mesmo tempo.'
    },
    {
        id: 'cmp2', subject: 'Administração',
        conceptA: { name: 'Taylor (Científica)', description: 'Foco no CHÃO DE FÁBRICA. De baixo para cima.', keyPoints: ['Tempos e movimentos', 'Especialização do operário', 'Incentivo salarial', 'Homo Economicus'] },
        conceptB: { name: 'Fayol (Clássica)', description: 'Foco na ESTRUTURA. De cima para baixo.', keyPoints: ['14 princípios gerais', 'PODC (Planejar, Organizar, Dirigir, Controlar)', 'Organograma', 'Visão do gerente'] },
        verdict: 'Complementares: Taylor olha a operação, Fayol olha a gestão.'
    },
    {
        id: 'cmp3', subject: 'Administração',
        conceptA: { name: 'Liderança Autocrática', description: 'O líder decide tudo. Subordinados apenas obedecem.', keyPoints: ['Decisão centralizada', 'Rápida em crises', 'Pode desmotivar', 'Sem participação'] },
        conceptB: { name: 'Liderança Democrática', description: 'O líder consulta a equipe antes de decidir.', keyPoints: ['Decisão participativa', 'Mais criatividade', 'Mais lenta', 'Engajamento alto'] },
        verdict: 'Não existe melhor: depende do contexto. Crise → Autocrática. Inovação → Democrática.'
    },
    {
        id: 'cmp4', subject: 'Teoria Econômica',
        conceptA: { name: 'Microeconomia', description: 'Estudo das partes: empresas, consumidores, mercados específicos.', keyPoints: ['Oferta e Demanda', 'Preço de equilíbrio', 'Estruturas de mercado', 'Empresa individual'] },
        conceptB: { name: 'Macroeconomia', description: 'Estudo do TODO: país inteiro, indicadores agregados.', keyPoints: ['PIB, Inflação, Selic', 'Política Monetária/Fiscal', 'Desemprego nacional', 'Balança Comercial'] },
        verdict: 'Micro = lupa no detalhe. Macro = visão panorâmica da economia.'
    },
    {
        id: 'cmp5', subject: 'Teoria Econômica',
        conceptA: { name: 'Monopólio', description: 'UM ÚNICO vendedor domina o mercado.', keyPoints: ['Sem concorrência', 'Preço definido pelo monopolista', 'Barreiras enormes', 'Ex: empresa de água local'] },
        conceptB: { name: 'Oligopólio', description: 'POUCOS vendedores grandes dominam.', keyPoints: ['Poucos concorrentes', 'Interdependência mútua', 'Pode haver acordos', 'Ex: companhias aéreas'] },
        verdict: 'Ambos são imperfeitos. Monopólio = 1 gigante. Oligopólio = seleto clube de gigantes.'
    },
    {
        id: 'cmp6', subject: 'Comunicação Empresarial',
        conceptA: { name: 'Comunicação Formal', description: 'Segue a hierarquia e os canais oficiais da empresa.', keyPoints: ['Documentada', 'Previsível', 'Memorandos, atas, relatórios', 'Mais lenta'] },
        conceptB: { name: 'Comunicação Informal', description: 'Flui fora da estrutura oficial, entre colegas.', keyPoints: ['Espontânea', 'Rádio-corredor', 'Rápida mas imprecisa', 'Pode gerar boatos'] },
        verdict: 'Ambas coexistem. Formal para registros oficiais, Informal para velocidade.'
    },
    {
        id: 'cmp7', subject: 'Comunicação Empresarial',
        conceptA: { name: 'Coesão', description: 'CONEXÃO entre as frases. Uso de conectivos.', keyPoints: ['Conjunções (mas, porém)', 'Pronomes de referência', 'Repetição controlada', 'Fluidez textual'] },
        conceptB: { name: 'Coerência', description: 'O texto FAZ SENTIDO como um todo.', keyPoints: ['Lógica interna', 'Sem contradições', 'Ideias organizadas', 'Progressão do tema'] },
        verdict: 'Coesão = cola entre frases. Coerência = o prédio inteiro faz sentido.'
    },
    {
        id: 'cmp8', subject: 'Matemática Aplicada',
        conceptA: { name: 'Limite', description: 'Para onde a função TENDE quando x se aproxima de um valor.', keyPoints: ['Aproximação, não chegada', 'Pode não existir', 'Testes laterais', 'Base para derivada'] },
        conceptB: { name: 'Derivada', description: 'A TAXA de variação instantânea. Quanto y muda por micro-mudança em x.', keyPoints: ['Inclinação da tangente', 'Velocidade de mudança', 'Usa o limite na definição', 'Aplicação: otimização'] },
        verdict: 'A derivada É UM LIMITE. Limite é o conceito, derivada é a aplicação direta.'
    },
];
