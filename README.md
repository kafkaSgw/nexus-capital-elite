# 💎 NEXUS CAPITAL ELITE

Sistema completo de gestão financeira pessoal e controle de investimentos com design premium e atualização automática de cotações.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

---

## 🚀 Funcionalidades

### 💰 Gestão Financeira
- ✅ Controle completo de receitas e despesas
- ✅ Categorização automática
- ✅ Dashboard com visão consolidada do patrimônio
- ✅ Histórico completo de transações
- ✅ Cálculo automático de saldo
- ✅ **Análise detalhada por categoria/fonte de renda**
- ✅ **Visualização de quanto cada empresa contribui**
- ✅ **Gráficos de distribuição com barras de progresso**
- ✅ **Evolução mensal (últimos 6 meses)**
- ✅ **Top 5 maiores receitas e despesas**

### 📈 Controle de Investimentos
- ✅ Gerenciamento de ações (B3)
- ✅ Gerenciamento de criptomoedas
- ✅ **Atualização automática de preços a cada 60 segundos**
- ✅ Integração com Yahoo Finance API
- ✅ Cálculo de lucro/prejuízo em tempo real
- ✅ Rentabilidade percentual por ativo
- ✅ Conversão automática de cripto (USD → BRL)
- ✅ **NOVO: Gráfico de Pizza da carteira de investimentos**
- ✅ **NOVO: Distribuição visual por ativo**
- ✅ **NOVO: Análise por classe (Stocks vs Crypto)**

### 🤖 Assistente IA (NOVIDADE!)
- ✅ **Chat inteligente com Groq + Llama 3.1 70B**
- ✅ **100% GRATUITO - Sem cartão de crédito!**
- ✅ **SUPER RÁPIDO - Respostas em <1 segundo**
- ✅ **Assistente financeiro 24/7**
- ✅ **Respostas sobre investimentos, ações, cripto**
- ✅ **Orientações de finanças pessoais**
- ✅ **Interface premium com histórico de conversa**
- ✅ **Botão flutuante sempre acessível**

### 🎯 Metas e Planejamento (NOVIDADE!)
- ✅ **Defina metas financeiras** (reserva, viagem, compras)
- ✅ **Acompanhe progresso visual** com barras animadas
- ✅ **Sugestão de aporte mensal** para atingir metas
- ✅ **Contador de dias** até o prazo
- ✅ **Categorias personalizadas** (poupança, investimento, compra)

### 📈 Gráficos e Análises (NOVIDADE!)
- ✅ **Gráfico de evolução patrimonial** (timeline de 7 meses)
- ✅ **Linha do tempo interativa** com pontos clicáveis
- ✅ **Cálculo automático de crescimento** percentual
- ✅ **Visualização de valorização** absoluta

### 🎨 Design Premium
- ✅ Dark mode elegante
- ✅ Efeitos glass morphism
- ✅ Animações suaves
- ✅ Tipografia profissional (Orbitron + Space Grotesk)
- ✅ Interface responsiva
- ✅ Visual de fintech de alto padrão
- ✅ **NOVO: Logo personalizada da Nexus Capital**
- ✅ **NOVO: Gráficos interativos SVG**

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)
- Uma conta no [Supabase](https://supabase.com) (gratuita)

---

## ⚙️ Instalação Passo a Passo

### 1️⃣ Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta (se não tiver)
3. Clique em "New Project"
4. Preencha:
   - **Name**: Nexus Capital Elite
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: Escolha a mais próxima (ex: South America)
5. Aguarde o projeto ser criado (~2 minutos)

### 2️⃣ Criar as Tabelas no Banco de Dados

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `supabase-setup.sql` deste projeto
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no editor SQL do Supabase
6. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
7. Você verá uma mensagem: "Tabelas criadas com sucesso!"

### 3️⃣ Obter as Credenciais do Supabase

1. No Supabase, vá em **Settings** → **API**
2. Você verá duas informações importantes:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon/public key** (uma chave longa que começa com "eyJ...")
3. **Copie essas informações** - você vai precisar delas!

### 3.5️⃣ Obter a Chave do Groq (para o Chat IA - 100% GRATUITO!)

1. Acesse: **https://console.groq.com/**
2. Crie uma conta (pode usar Google)
3. Vá em **"API Keys"** → **"Create API Key"**
4. **Copie a chave** gerada (começa com `gsk_...`)
5. ✅ **SEM CARTÃO DE CRÉDITO NECESSÁRIO!**

**Nota:** 
- O Chat IA é opcional mas **totalmente gratuito**
- Groq é super rápido (respostas em <1s)
- Veja `CHAT-IA-GRATUITO.md` para mais detalhes

### 4️⃣ Configurar o Projeto Localmente

1. Abra o **Visual Studio Code**
2. Crie uma nova pasta para o projeto (ex: `nexus-capital-elite`)
3. **Copie TODOS os arquivos** deste projeto para dentro da pasta
4. No VS Code, abra a pasta do projeto: **File → Open Folder**

### 5️⃣ Configurar as Variáveis de Ambiente

1. Na raiz do projeto, você verá um arquivo `.env.local.example`
2. **Renomeie** este arquivo para `.env.local` (remova o `.example`)
3. Abra o arquivo `.env.local` e cole suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui
GROQ_API_KEY=gsk_sua-chave-groq-aqui
```

⚠️ **IMPORTANTE**: 
- Substitua pelos valores reais que você copiou!
- A chave do Groq é **opcional** mas **100% gratuita**
- Veja o arquivo `CHAT-IA-GRATUITO.md` para passo a passo completo

### 6️⃣ Instalar as Dependências

1. Abra o **Terminal** no VS Code (Terminal → New Terminal)
2. Execute o comando:

```bash
npm install
```

3. Aguarde a instalação (~1-2 minutos)

### 7️⃣ Executar o Projeto

No terminal, execute:

```bash
npm run dev
```

Você verá uma mensagem como:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

### 8️⃣ Acessar o Sistema

1. Abra seu navegador
2. Acesse: **http://localhost:3000**
3. 🎉 **Pronto! O sistema está rodando!**

---

## 📱 Como Usar

### Adicionar uma Transação

1. No Dashboard, clique em **"Nova Transação"**
2. Escolha o tipo (Receita ou Despesa)
3. Preencha:
   - Descrição (ex: "Pagamento Cliente X")
   - Valor (ex: 5000.00)
   - Categoria (ex: "Interpira")
4. Clique em **"Salvar"**

### Adicionar um Investimento

1. Vá em **"Investimentos"** no menu
2. Clique em **"Adicionar Ativo"**
3. Escolha o tipo (Ações ou Crypto)
4. Preencha:
   - **Ticker**: 
     - Para ações: `PETR4`, `VALE3`, `ITUB4`
     - Para cripto: `BTC`, `ETH`, `SOL`
   - **Quantidade**: Ex: `100` (para ações) ou `0.5` (para cripto)
   - **Preço Médio**: Clique em "Buscar Preço" ou digite manualmente
5. Clique em **"Adicionar"**

### Atualizar Preços

- Os preços são atualizados **automaticamente a cada 60 segundos**
- Ou clique no botão **"Atualizar Preços"** para forçar atualização

---

## 🏗️ Estrutura do Projeto

```
nexus-capital-elite/
├── app/
│   ├── api/
│   │   └── cotacoes/         # API de cotações Yahoo Finance
│   ├── investimentos/        # Página de investimentos
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Dashboard principal
│   └── globals.css          # Estilos globais
├── components/
│   ├── Header.tsx           # Cabeçalho
│   ├── StatCard.tsx         # Card de estatísticas
│   ├── TransactionModal.tsx # Modal de transações
│   └── AssetModal.tsx       # Modal de ativos
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   └── utils.ts             # Funções utilitárias
├── .env.local               # Variáveis de ambiente (criar)
├── package.json             # Dependências
└── tailwind.config.js       # Configuração Tailwind
```

---

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Criar build de produção
npm run build

# Iniciar em produção
npm start
```

---

## 🎨 Personalizações

### Alterar Cores

Edite `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#00D9FF',  // Altere aqui
  },
  accent: {
    green: '#00FF94',    // Verde
    red: '#FF4757',      // Vermelho
  },
}
```

### Adicionar Categorias

Edite `components/TransactionModal.tsx`:

```javascript
const CATEGORIES = [
  'Interpira',
  'TikTok',
  'Afiliados',
  'SUA_CATEGORIA_AQUI',  // Adicione aqui
]
```

---

## 🔐 Segurança

⚠️ **IMPORTANTE - Leia com atenção:**

### Estado Atual
O sistema está configurado com **políticas de acesso público** no Supabase. Isso significa que **qualquer pessoa com as credenciais pode acessar os dados**.

### Para Uso Pessoal
Está OK! Apenas você terá acesso às credenciais.

### Para Uso Profissional/Multiusuário
Você DEVE implementar autenticação:

1. **Adicionar Supabase Auth**:
```bash
npm install @supabase/auth-helpers-nextjs
```

2. **Modificar as políticas RLS** no SQL Editor:
```sql
-- Substituir as políticas atuais por:
CREATE POLICY "Users can only see their own data" ON transactions
    FOR ALL USING (auth.uid() = user_id);
```

3. Consulte a [documentação oficial](https://supabase.com/docs/guides/auth)

---

## 📊 API de Cotações

### Como Funciona

1. Sistema busca preços na **Yahoo Finance**
2. Para ações brasileiras, adiciona `.SA` automaticamente
3. Para criptomoedas:
   - Busca preço em USD
   - Busca cotação do dólar
   - Converte para BRL

### Exemplos de Tickers

**Ações (B3)**:
- `PETR4` - Petrobras
- `VALE3` - Vale
- `ITUB4` - Itaú
- `BBDC4` - Bradesco
- `MGLU3` - Magazine Luiza

**Criptomoedas**:
- `BTC` - Bitcoin
- `ETH` - Ethereum
- `SOL` - Solana
- `ADA` - Cardano

---

## 🚀 Deploy em Produção

### Opção 1: Vercel (Recomendado)

1. Crie uma conta em [vercel.com](https://vercel.com)
2. Instale o Vercel CLI:
```bash
npm install -g vercel
```
3. Faça deploy:
```bash
vercel
```
4. Configure as variáveis de ambiente no painel da Vercel

### Opção 2: Netlify

1. Conecte seu repositório Git
2. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Adicione as variáveis de ambiente

---

## 🐛 Resolução de Problemas

### "Cannot find module..."
```bash
npm install
```

### "Unauthorized" ou erros do Supabase
- Verifique se as credenciais em `.env.local` estão corretas
- Verifique se o arquivo `.env.local` existe (sem `.example`)
- Reinicie o servidor: `Ctrl+C` e depois `npm run dev`

### Cotações não atualizam
- Verifique sua conexão com internet
- Alguns tickers podem não existir na Yahoo Finance
- Aguarde 60 segundos para atualização automática

### Preços estão errados
- A Yahoo Finance pode ter delay de ~15 minutos
- Para preços em tempo real, considere APIs pagas

---

## 📈 Roadmap Futuro

- [ ] Autenticação de usuários
- [ ] Gráficos de evolução patrimonial
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Metas financeiras
- [ ] Notificações de variação de preços
- [ ] App mobile (React Native)
- [ ] Integração com Open Banking
- [ ] Controle de impostos (IR)

---

## 📄 Licença

Este projeto é de código aberto para uso pessoal e educacional.

---

## 💬 Suporte

Precisa de ajuda? 

1. Leia este README completamente
2. Verifique a seção de Resolução de Problemas
3. Consulte a documentação:
   - [Next.js](https://nextjs.org/docs)
   - [Supabase](https://supabase.com/docs)
   - [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 Conclusão

Você agora tem um sistema financeiro profissional e moderno! 

**Próximos passos sugeridos:**
1. Adicione suas primeiras transações
2. Configure seus investimentos
3. Personalize as cores para seu gosto
4. Adicione autenticação se for compartilhar com outras pessoas

**Bons investimentos! 💎📈**
