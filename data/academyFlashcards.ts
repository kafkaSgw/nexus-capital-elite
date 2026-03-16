export type FlashcardDifficulty = 'iniciante' | 'intermediario' | 'avancado';

export type Flashcard = {
    id: string;
    subject: string;
    question: string;
    options: string[];
    answer: string;
    teaching: string;
    difficulty: FlashcardDifficulty;
};

export const realFlashcards: Flashcard[] = [
    // ─── COMUNICAÇÃO EMPRESARIAL I ───
    {
        id: 'f_com1', subject: 'Comunicação Empresarial I', question: 'Quais são os 5 elementos fundamentais do modelo geral de comunicação?',
        options: ['Emissor, Receptor, Mensagem, Canal e Feedback.', 'Remetente, Destinatário, Texto, Telefone e Resposta.', 'Locutor, Ouvinte, E-mail, Internet e Curtida.', 'Fonte, Destino, Código, Rádio e Retorno.'],
        answer: 'Emissor, Receptor, Mensagem, Canal e Feedback.', teaching: 'Unidade I: O modelo clássico envolve quem fala (emissor), quem ouve (receptor), o conteúdo transmitido (mensagem), o meio físico ou virtual (canal) e a resposta para validar o entendimento (feedback).', difficulty: 'iniciante'
    },
    {
        id: 'f_com2', subject: 'Comunicação Empresarial I', question: 'O que caracteriza um "ruído semântico" na comunicação empresarial?',
        options: ['Barulho de máquinas na fábrica atrapalhando a fala.', 'Uso excessivo de vocabulário ou jargões técnicos que o receptor não compreende.', 'Falha no servidor de e-mail corporativo ou lentidão na internet.', 'Falar alto demais ou gesticular intensamente durante uma reunião.'],
        answer: 'Uso excessivo de vocabulário ou jargões técnicos que o receptor não compreende.', teaching: 'Unidade I: Ruídos semânticos são barreiras atreladas à linguagem. Ocorrem quando o emissor usa termos rebuscados, siglas ou jargões técnicos que fogem do conhecimento do receptor, quebrando o entendimento.', difficulty: 'iniciante'
    },
    {
        id: 'f_com3', subject: 'Comunicação Empresarial I', question: 'Como se define a "Comunicação Formal" dentro de uma organização?',
        options: ['Conversas informais no corredor e nos intervalos (cafezinho).', 'Comunicação espontânea entre colegas do mesmo setor, sem registros.', 'Comandos verbais dados exclusivamente em momentos de lazer.', 'Comunicação que segue níveis hierárquicos e protocolos rígidos (e-mails oficiais, atas, memorandos).'],
        answer: 'Comunicação que segue níveis hierárquicos e protocolos rígidos (e-mails oficiais, atas, memorandos).', teaching: 'Unidade I: A comunicação formal é oficial e estruturada. Segue os canais aprovados pela diretoria e gera históricos verificáveis da empresa. Já a informal (ex: bate-papo no café) é rápida, mas não tem peso documental.', difficulty: 'intermediario'
    },
    {
        id: 'f_com4', subject: 'Comunicação Empresarial I', question: 'Diferencie os conceitos de "Coesão" e "Coerência" em um texto argumentativo.',
        options: ['Coesão é a lógica do texto; Coerência é a "costura" usando conectivos.', 'Coesão é a formatação visual; Coerência é a pontuação final.', 'Coesão é o uso de conectivos ("porém", "portanto") ligando frases; Coerência é o sentido lógico global sem contradições.', 'Ambas significam a mesma coisa: ausência total de erros gramaticais.'],
        answer: 'Coesão é o uso de conectivos ("porém", "portanto") ligando frases; Coerência é o sentido lógico global sem contradições.', teaching: 'Unidade II: Coesão é a "costura" sintática das frases (usando conjunções corretamente). Coerência é o sentido e a não-contradição das ideias ao longo da leitura do texto todo.', difficulty: 'intermediario'
    },
    {
        id: 'f_com5', subject: 'Comunicação Empresarial I', question: 'Qual é o propósito principal de uma "Ata" no ambiente corporativo?',
        options: ['Comunicar decisões e notícias da empresa ao público externo e imprensa.', 'Registrar formalmente, por escrito, tudo o que foi discutido e decidido em uma reunião.', 'Enviar mensagens curtas operacionais entre departamentos (como um Memorando).', 'Apresentar dados, tabelas e gráficos detalhados como um Relatório Técnico.'],
        answer: 'Registrar formalmente, por escrito, tudo o que foi discutido e decidido em uma reunião.', teaching: 'Unidade III: A Ata serve como a "memória oficial" e jurídica de um encontro. Define os acordos, prazos e os participantes envolvidos para posterior cobrança.', difficulty: 'intermediario'
    },
    {
        id: 'f_com6', subject: 'Comunicação Empresarial I', question: 'Sobre regras de Regência Verbal, qual a forma correta ao aplicar o verbo "Assistir" no sentido de "Ver/Presenciar"?',
        options: ['Nós assistimos o filme de treinamento hoje.', 'Nós assistimos no filme de treinamento hoje.', 'Nós assistimos com o filme de treinamento hoje.', 'Nós assistimos ao filme de treinamento hoje.'],
        answer: 'Nós assistimos ao filme de treinamento hoje.', teaching: 'Unidade IV: O verbo assistir no sentido de presenciar ou ver exige a preposição "a" (Assistir a + o = ao). Já assistir no sentido de ajudar não pede preposição ("O médico assistiu o paciente").', difficulty: 'avancado'
    },
    {
        id: 'f_com7', subject: 'Comunicação Empresarial I', question: 'Qual alternativa descreve com precisão a diferença estrutural entre Tese e Defesa num texto dissertativo-argumentativo?',
        options: ['A Tese é o resumo final, a Defesa é o título do texto.', 'A Tese é a sua opinião principal; a Defesa são os dados, pesquisas e justificativas que provam sua tese.', 'A Tese são apenas os dados puros; a Defesa é a sua opinião abstrata sobre o mundo.', 'O texto empresarial exige Tese mas condena a Defesa por tornar o texto longo.'],
        answer: 'A Tese é a sua opinião principal; a Defesa são os dados, pesquisas e justificativas que provam sua tese.', teaching: 'Unidade II: Tese é o "o quê" você defende (Ex: Home Office aumenta lucros). A defesa argumentativa é o "porquê" (citando dados de HR comprovando redução de infraestrutura).', difficulty: 'avancado'
    },

    // ─── FUNDAMENTOS DA ADMINISTRAÇÃO ───
    {
        id: 'f_adm1', subject: 'Fundamentos da Administração', question: 'Quais são as 4 funções básicas (PODC) do processo administrativo?',
        options: ['Produzir, Operar, Distribuir e Controlar.', 'Patrocinar, Otimizar, Debater e Calcular.', 'Planejar, Organizar, Dirigir e Controlar.', 'Planejar, Ordenar, Delegar e Checar.'],
        answer: 'Planejar, Organizar, Dirigir e Controlar.', teaching: 'Unidade I: Essência da Administração: Planejar (definir metas), Organizar (estruturar recursos), Dirigir (liderar pessoas) e Controlar (verificar se a meta foi atingida e corrigir).', difficulty: 'iniciante'
    },
    {
        id: 'f_adm2', subject: 'Fundamentos da Administração', question: 'Qual a principal diferença entre os conceitos de Eficiência e Eficácia?',
        options: ['Eficiência mede o resultado final; Eficácia mede os recursos poupados.', 'Eficiência foca no método e nos recursos minimizados (fazer as coisas direito); Eficácia foca em alcançar o resultado planejado (fazer a coisa certa).', 'Eficiência e Eficácia significam a mesma coisa na Administração Clássica.', 'A eficiência só importa para a alta diretoria, e a eficácia para a base industrial.'],
        answer: 'Eficiência foca no método e nos recursos minimizados (fazer as coisas direito); Eficácia foca em alcançar o resultado planejado (fazer a coisa certa).', teaching: 'Unidade II: Você pode ser muito Eficiente (gastar pouco papel num relatório inútil) mas zero Eficaz (o relatório não serviu pra nada). O administrador busca o equilíbrio de ambos!', difficulty: 'intermediario'
    },
    {
        id: 'f_adm3', subject: 'Fundamentos da Administração', question: 'Na Teoria Bifatorial de Herzberg sobre Motivação, o que o "Salário" representa?',
        options: ['Fator Motivacional, responsável por aumentar a criatividade a longo prazo.', 'Fator Físico, sem qualquer impacto psicológico no trabalhador.', 'Fator Higiênico, que evita insatisfação mas NÃO motiva permanentemente por si só.', 'A teoria ignora o salário e foca apenas em relações humanas na liderança.'],
        answer: 'Fator Higiênico, que evita insatisfação mas NÃO motiva permanentemente por si só.', teaching: 'Unidade III: Salário, ambiente físico e segurança (Fatores Higiênicos) garantem que a pessoa não fique revoltada. Mas o verdadeiro brilho nos olhos (Fator Motivacional) vem de reconhecimento, desafio e crescimento na carreira.', difficulty: 'avancado'
    },
    {
        id: 'f_adm4', subject: 'Fundamentos da Administração', question: 'Qual a ênfase da "Administração Científica", escola liderada por Frederick Taylor?',
        options: ['Ênfase total na hierarquia e em regras impessoais e escritas.', 'Ênfase na estrutura e nos 14 princípios universais (divisão do trabalho).', 'Atenção exclusiva à psicologia e às necessidades sociais das pessoas na fábrica.', 'Ênfase na TAFERA (tempos e movimentos) para aplicar métodos matemáticos buscando hiper-produtividade do operário.'],
        answer: 'Ênfase na TAFERA (tempos e movimentos) para aplicar métodos matemáticos buscando hiper-produtividade do operário.', teaching: 'Unidade IV: Taylor, em 1900, usou cronômetros para achar o "The One Best Way". Focou estritamente na eficiência operacional (tarefa), revolucionando a indústria, mas sendo criticado pela mecanização humana.', difficulty: 'intermediario'
    },
    {
        id: 'f_adm5', subject: 'Fundamentos da Administração', question: 'Na divisão dos Níveis Organizacionais (Estratégico, Tático e Operacional), qual o foco do Nível Estratégico?',
        options: ['Traduzir as grandes metas em planejamentos táticos por departamento.', 'Programar a contagem do estoque físico do dia a dia no galpão logístico.', 'Acompanhar linha a linha a produtividade dos operários.', 'Lidar com o ambiente macro e focar no longo prazo e nos objetivos finais da empresa como um todo.'],
        answer: 'Lidar com o ambiente macro e focar no longo prazo e nos objetivos finais da empresa como um todo.', teaching: 'Unidade I: Nível Estratégico = Alta Gestão/Presidentes (Longo Prazo, toda a corporação). Nível Tático = Gerentes (Médio prazo, departamentos). Operacional = Supervisores (Curto prazo, chão de fábrica).', difficulty: 'intermediario'
    },

    // ─── MATEMÁTICA APLICADA ───
    {
        id: 'f_mat1', subject: 'Matemática Aplicada', question: 'O que representa rigorosamente o Domínio de uma Função em Matemática e em Economia?',
        options: ['O conjunto de todas as saídas possíveis (y) da equação.', 'O ponto zero em um gráfico onde as abcissas tocam a origem.', 'O valor de lucro absoluto de uma função econômica.', 'Apenas o conjunto de valores de entrada válidos (x) para os quais a função produz um resultado real.'],
        answer: 'Apenas o conjunto de valores de entrada válidos (x) para os quais a função produz um resultado real.', teaching: 'Unidade 1: Domínio define quem pode "entrar na máquina" f(x). Numa função econômica como raízes, entradas negativas podem quebrar o domínio real.', difficulty: 'iniciante'
    },
    {
        id: 'f_mat2', subject: 'Matemática Aplicada', question: 'Em que cenário aplicamos uma Translação Vertical de um gráfico da forma g(x) = f(x) + C?',
        options: ['Quando a quantidade ofertada altera sua inclinação bruscamente.', 'Quando um novo imposto ad-valorem altera a elasticidade de lucro da curva inteira.', 'Quando espelhamos o eixo X como num gráfico negativo de receitas.', 'Quando, por exemplo, o CUSTO FIXO total aumenta, deslocando rigidamente o gráfico de Custo Total para cima (se C > 0).'],
        answer: 'Quando, por exemplo, o CUSTO FIXO total aumenta, deslocando rigidamente o gráfico de Custo Total para cima (se C > 0).', teaching: 'Unidade 4: Translações Verticais [f(x)+k] movem paralela e rigidamente o gráfico todo para Cima/Baixo. Matematicamente, adicionamos ou subtraímos de todos os resultados (y) o mesmo fator.', difficulty: 'intermediario'
    },
    {
        id: 'f_mat3', subject: 'Matemática Aplicada', question: 'Qual a principal estrutura técnica da função de Juros Compostos comparada a Juros Simples?',
        options: ['Juros compostos são baseados em funções logarítmicas negativas, enquanto os simples são equações retilíneas decrescentes.', 'Juros simples crescem Exponencialmente; os compostos avançam sob progressão aritmética infinita.', 'Juros simples progridem linearmente (função Afim). Juros compostos crescem Exponencialmente (juro sobre juro gerando curva em parábola).', 'Ambos formam gráficos idênticos se a taxa e o tempo forem mantidos inalterados.'],
        answer: 'Juros simples progridem linearmente (função Afim). Juros compostos crescem Exponencialmente (juro sobre juro gerando curva em parábola).', teaching: 'Unidade 5: M = C(1 + i)^n. O "n" (tempo) no expoente indica comportamento Exponencial, o que causa a tão conhecida "bola de neve" brutal nos investimentos/dívidas a longo prazo.', difficulty: 'intermediario'
    },
    {
        id: 'f_mat4', subject: 'Matemática Aplicada', question: 'Para haver Continuidade (Função Contínua) em um ponto x=a, qual a condição fundamental dos Limites?',
        options: ['Que a primeira derivada de f(x) nunca se iguale a zero.', 'Que o limite lateral esquerdo seja positivo e o direito negativo, como um seno.', 'Que lim(x→a) f(x) exista, seja infinito, e f(a) não precise existir no domínio.', 'Que lim(x→a) f(x) exista (com os limites laterais iguais) e seja exatamente IGUAL a f(a).'],
        answer: 'Que lim(x→a) f(x) exista (com os limites laterais iguais) e seja exatamente IGUAL a f(a).', teaching: 'Unidade 6: Uma função é contínua se não há "furos" nem "saltos" no gráfico. O limite esquerdo deve encostar no limite direito, e ambos devem encostar no valor real da função naquele ponto.', difficulty: 'avancado'
    },
    {
        id: 'f_mat5', subject: 'Matemática Aplicada', question: 'Como utilizamos Derivadas para encontrar o Máximo (Ex: Maximização de Lucro) de uma função contínua?',
        options: ['Apenas calculamos f(x) = 0 nas bordas.', 'Nós aplicamos a regra de L\'Hôpital em (0/0) para encontrar a matriz invertida.', 'Integramos f(x) do ponto a ao b e derivamos o logaritmo.', 'Buscamos os pontos críticos (onde a primeira derivada é ZERO). Se a segunda derivada for negativa, trata-se de um ponto Máximo!'],
        answer: 'Buscamos os pontos críticos (onde a primeira derivada é ZERO). Se a segunda derivada for negativa, trata-se de um ponto Máximo!', teaching: 'Unidade 7: A 1ª Derivada em zero: f´(x) = 0 significa inclinação neutra (topo do morro ou fundo do vale). A 2ª Derivada f\'\'(x) < 0 significa concavidade para baixo, atestando que você está num Máximo Global/Local.', difficulty: 'avancado'
    },

    // ─── TEORIA ECONÔMICA ───
    {
        id: 'f_econ1', subject: 'Teoria Econômica', question: 'Quais grupos representam classicamente os "Agentes Econômicos" fundamentais de um Sistema Econômico?',
        options: ['Apenas os Produtores (fábricas) e os Consumidores (varejo).', 'Famílias (oferecem mão de obra e consomem), Empresas (produzem), o Governo (regula) e o Setor Externo (comércio exterior).', 'Bancos, Bolsa de Valores, Criptomoedas e Moedas Fiduciárias Internacionais.', 'A inflação, o PIB, a Taxa Selic e a Carga Tributária Regional.'],
        answer: 'Famílias (oferecem mão de obra e consomem), Empresas (produzem), o Governo (regula) e o Setor Externo (comércio exterior).', teaching: 'Unidade 1: A economia inteira transaciona entre Famílias, Empresas, Governo (impostos/subsídios) e o Resto do Mundo (exportações/importações). São esses atores agindo nas Leis da Oferta/Demanda.', difficulty: 'iniciante'
    },
    {
        id: 'f_econ2', subject: 'Teoria Econômica', question: 'Em Macroeconomia, o que o "PIB" (Produto Interno Bruto) busca exatamente medir?',
        options: ['A quantidade total de exportações menos as importações anuais.', 'A inflação do país (IPC e IPCA agregados na curva macroeconômica).', 'As reservas de Ouro e Dólar acumuladas nos cofres do Banco Central local.', 'A soma monetária de TODOS os bens e serviços FINAIS produzidos no país num dado período.'],
        answer: 'A soma monetária de TODOS os bens e serviços FINAIS produzidos no país num dado período.', teaching: 'Unidade 2: O PIB soma tudo o que chega ao consumidor final. Se um parafuso vira carro, contamos só o valor do carro. Mede a "temperatura global" da riqueza produzida pela nação num ano.', difficulty: 'iniciante'
    },
    {
        id: 'f_econ3', subject: 'Teoria Econômica', question: 'O que a Lei da Procura/Demanda (Microeconomia) afirma como regra geral em um gráfico Preço x Quantidade?',
        options: ['Quanto MENOR o Preço, MENOR a Quantidade procurada pelos consumidores do mercado no curto prazo.', 'A demanda é rígida, as pessoas compram infinitamente porque as necessidades são infinitas independente da alta curva da oferta.', 'Coeteris paribus, quanto MAIOR for o Preço de um bem/serviço, MENOR será a Quantidade demandada pelos consumidores, e vice-versa. A curva descende.', 'Preço e procura andam sempre paralelos na estrutura de concorrência monopolística perfeita e imaculada.'],
        answer: 'Coeteris paribus, quanto MAIOR for o Preço de um bem/serviço, MENOR será a Quantidade demandada pelos consumidores, e vice-versa. A curva descende.', teaching: 'Unidade 3: Simples e básico: se está barato os agentes querem comprar mais. Se o preço estoura lá pra cima, o povo foge pro substituto e as vendas caem vertiginosamente. Daí a famosa curva descendente.', difficulty: 'intermediario'
    },
    {
        id: 'f_econ4', subject: 'Teoria Econômica', question: 'Na Política Monetária Restritiva do Governo para domar a Inflação severa, qual o uso da Taxa Selic básica?',
        options: ['A Selic é radicalmente REDUZIDA, inflando o crédito para facilitar compras generalizadas pelo povão impulsionando a indústria agrícola.', 'O Banco Central AUMENTA violentamente a Selic. O crédito fica carro, inibe a vontade de empresas investirem e empurra consumo pra baixo forçando preços a caírem.', 'O Governo congela todos os preços dos supermercados fixando limites de repasse sob pena dura pelo Ministério Público.', 'Emite-se muito dinheiro novo (impressão), abaixando a taxa de juros real temporária de longo período do título nacional.'],
        answer: 'O Banco Central AUMENTA violentamente a Selic. O crédito fica carro, inibe a vontade de empresas investirem e empurra consumo pra baixo forçando preços a caírem.', teaching: 'Unidade 2: AUMENTAR Juros (Selic alta) = "Frear a Carreta" Nacional. Comprar carro fica caro, empréstimo de galpão fica inviável. Sem gente comprando/construindo as coisas "encalham" no vendedor, e o preço é esmagado pra baixo matando a inflação desgovernada.', difficulty: 'avancado'
    },
    {
        id: 'f_econ5', subject: 'Teoria Econômica', question: 'No modelo Microeconômico fundamental, o que caracteriza perfeitamente o “Ponto de Equilíbrio”?',
        options: ['Onde a taxa tributária do Governo iguala a curva marginal nula.', 'O ponto matemático estático onde a Curva da Oferta das indústrias e a Curva de Demanda dos consumidores se CRUZAM. Todo mundo que oferta vende; todos compradores compram o que queriam.', 'Quando o produtor detêm lucros infinitos na concorrência marginal da indústria.', 'Momento inflacionário caindo abaixo da inflação acumulada predatória bancária e juro caindo exponencial.'],
        answer: 'O ponto matemático estático onde a Curva da Oferta das indústrias e a Curva de Demanda dos consumidores se CRUZAM. Todo mundo que oferta vende; todos compradores compram o que queriam.', teaching: 'Unidade 3: É a mágica de alocação de Pareto ótima simplificada. A Empresa quer cobrar 50 pra entregar x, o cliente aceita comprar 50 para os exatos X quantidades. Ambos assinam no ponto X/Y unívoco, esvaziando a praça e gerando riqueza pura.', difficulty: 'intermediario'
    }
];
