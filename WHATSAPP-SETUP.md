# Bem-vindo ao Motor WhatsApp do Nexus Capital 🚀

Eu concluí toda a programação do seu motor integrado ao WhatsApp. A partir de agora, o projeto já tem as rotas, o banco de dados e a interface prontas (Você já pode ver no menu lateral "WhatsApp").

Mas para as peças conversarem com o mundo real, falta **conectar as suas chaves pessoais**. Como sou uma Inteligência Artificial do Google, eu não tenho acesso às contas da OpenAI ou ao painel do seu WhatsApp por motivos de segurança.

Abaixo está o **GUIA À PROVA DE BALAS** para você fazer isso com as próprias mãos em 5 minutos:

---

## Passo 1: O Cérebro (Chave Mestra do Groq)

Sem essa chave, a IA não consegue ler as suas mensagens do WhatsApp e extrair o Valor e Categoria. Nós usamos a Groq por ser 100% gratuita no momento e absurdamente rápida.

1. Acesse o site oficial: https://console.groq.com/
2. Se você não tem conta, crie a sua (pode usar o Google).
3. Vá em "API Keys" no menu esquerdo e clique em "Create API Key" (Dê o nome de "Nexus WhatsApp").
4. Copie o texto maravilhoso gerado (ela começa com `gsk_...`).
5. **Ação no seu código:**
   - Abra o arquivo `.env.local` que está na pasta principal do seu projeto no VS Code.
   - Pule para a linha 6 (onde deve estar Groq API Key) ou apenas confira se a linha `GROQ_API_KEY=` já está preenchida com ele no começo do arquivo!

## Passo 2: O Banco de Dados (Supabase Service Key)

O Supabase precisa garantir que quem está salvando a informação vinda do Webhook é de confiança.

1. Entre no seu [Painel do Supabase](https://supabase.com).
2. Vá até as engrenagens de "Project Settings" ⚙️ -> "API".
3. Lá no fundo da página, em *Project API keys*, você verá duas chaves: A `anon`, `public` e uma secreta chamada **`service_role`, `secret`**.
4. Copie a `service_role`.
5. **Ação no seu código:**
   - Volte no arquivo `.env.local`.
   - Adicione esta nova linha:
     ```env
     SUPABASE_SERVICE_ROLE_KEY="COLE_O_SEGREDO_AQUI"
     ```

**Seu arquivo `.env.local` deve ficar parecido com isto agora:**
```env
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh...."
# --- CHAVES DO GROQ (IA) E BANCO SECRETO ---
GROQ_API_KEY="gsk_..."
SUPABASE_SERVICE_ROLE_KEY="eyJh...."
```

---

## Passo 3: O Banco de Dados na Prática

Você já tem o arquivo pronto que te mandei lá no seu código (`whatsapp-transactions.sql`), só precisamos rodá-lo dentro do Supabase.

1. No Supabase, clique em **SQL Editor** (o ícone de linha de código `>_` no menu esquerdo).
2. Clique no botão de criar "New query".
3. Volte no seu VSCode, abra o arquivo principal **`whatsapp-transactions.sql`**.
4. Copie todo o texto de dentro dele e cole no SQL Editor do Supabase.
5. Clique no botão verde de "Run" (Rodar). 
6. Pronto! A tabela onde as notas fiscais vão morar acabou de nascer no seu banco.

---

## Passo 4: Conectando seu Whatsapp na Evolution API

A Evolution API é a ponte oficial entre o WhatsApp no seu bolso e o Código que fiz pra você no seu PC/Servidor. Como combinamos que vamos usar a nuvem pra não precisar alugar VPS/Linux, recomendo utilizar um servidor SaaS na nuvem da Evolution API.

> 🛠️ Plataforma recomendada: Use um serviço na nuvem baratinho que você encontra no Google procurando "Hospedagem Evolution API" (como SendAPI, Chatwoot Cloud ou similares). Eu preparei os passos gerais:

1. **Crie a Instância:**
   No painel deste serviço de hospedagem Evolution, clique em "Create Instance" e chame ela de "NexusFinance".
2. **Leia o QR Code:**
   Aperte para ler o QR Code e escaneie com seu WhatsApp (o mesmo caminho que você usa pra ler o WhatsApp Web tradicional).
3. **Configure a Mágica (O Webhook):**
   No menu da sua "Instância", procure pelo botão Webhooks. Aqui vamos conectar seu NexusCapital com o Whatsapp!
   - **URL de Destino:** Coloque o endereço do seu site (Se estiver publicando o Nexus na Vercel, pegue a URL de lá, tipo: `https://nexus-capital.vercel.app/api/whatsapp/webhook`). *Atenção: A Evolution precisa conversar com uma URL pública na internet, não local (`localhost`)*.
   - **Eventos:** Você DEVE marcar a caixa de seleção escrita "**messages upsert**" (isso avisa seu site sempre que seu celular receber/enviar algo).
   - **Salvar/Ligar:** Deixe ativo!

---

## Passo 5: TESTE TOTAL! 🔥

Assim que o `.env.local` estiver preenchido com suas duas chaves, a tabela SQL estiver viva e a sua url /api/whatsapp/webhook da Evolution estiver plugada publicamente no ar:

1. Abra o WhatsApp e mande mensagem pro seu próprio número ou peça pra alguém te mandar:
   > *"Gastei 300 reais em software de gestão da Microsoft pro projeto novo."*
   > ou
   > *"Fechei uma consultoria e caiu 2500 de Pix Geral."*

2. Vá até o seu próprio computador, acesse seu Dashboard Nexus Capital e clique no Menu > **WhatsApp**.
3. O dinheiro estará rodando e processado no seu Dashboard maravilhosamente bem.

> Para recriar um painel ainda melhor futuramente eu posso ir aprimorando, e podemos adicionar edição dessas mesmas compras com modals e abas. É só chamar!
