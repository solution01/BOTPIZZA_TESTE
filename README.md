# Chatbot de Pizzaria para WhatsApp

Este é um projeto de chatbot para WhatsApp desenvolvido em Node.js, projetado para automatizar o processo de pedidos de uma pizzaria. Ele utiliza a biblioteca `@whiskeysockets/baileys` para a conexão com o WhatsApp e o PM2 para gerenciamento de processos em segundo plano.

## Funcionalidades Principais

- **Conexão com WhatsApp**: Utiliza código de pareamento para uma conexão segura e moderna.
- **Fluxo de Conversa Inteligente**: Gerencia o diálogo com o cliente através de uma máquina de estados, guiando-o desde a saudação até a finalização do pedido.
- **Integração com n8n**: Comunica-se com um serviço n8n para cadastrar e verificar clientes.
- **Cardápio Interativo**: Apresenta o cardápio com imagens, descrições e botões de seleção.
- **Processamento de Pedidos**: Lida com pedidos complexos, como pizzas "meio a meio".
- **Pagamento via PIX**: Integra-se com a API do Mercado Pago para gerar cobranças PIX (QR Code e Copia e Cola).
- **Verificação de Pagamento**: Monitora o status do pagamento automaticamente.
- **Gerenciamento com PM2**: Roda o bot e o serviço n8n de forma contínua em segundo plano.

## Estrutura do Projeto

- `index.js`: Ponto de entrada da aplicação. Inicializa a conexão com o WhatsApp e gerencia os eventos principais.
- `dialogos.js`: O "cérebro" do bot. Atua como um roteador que direciona as mensagens para o handler correto com base na etapa da conversa.
- `handlers/`: Pasta contendo a lógica de cada etapa do diálogo (`registrationHandler.js`, `orderHandler.js`, `checkoutHandler.js`).
- `apiClient.js`: Centraliza todas as chamadas a APIs externas (n8n, Mercado Pago, Geolocalização).
- `menu.js`: Contém os dados estáticos do cardápio (pizzas, bebidas).
- `ecosystem.config.js`: Arquivo de configuração do PM2 para gerenciar os processos `bot-pizza` e `n8n`.
- `.env`: Arquivo para armazenar variáveis de ambiente e segredos (não deve ser enviado para o Git).

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (geralmente instalado com o Node.js)

## Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/ohguinascimento/BOTPIZZA_TESTE
    cd BOTPIZZA_TESTE
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Instale o PM2 globalmente:**
    ```bash
    npm install -g pm2
    ```

4.  **Crie o arquivo de ambiente:**
    Crie um arquivo chamado `.env` na raiz do projeto e adicione as seguintes variáveis:

    ```
    # Token de acesso do Mercado Pago (use o de TESTE para desenvolvimento)
    MERCADO_PAGO_TOKEN=SEU_TOKEN_DO_MERCADO_PAGO

    # URL do webhook do n8n que o bot irá chamar
    N8N_WEBHOOK_URL=http://localhost:5678/webhook/verificar-cliente

    # Credenciais para acessar a interface do n8n (definidas em ecosystem.config.js)
    N8N_BASIC_AUTH_USER=seu_usuario_secreto
    N8N_BASIC_AUTH_PASSWORD=sua_senha_secreta
    ```

## Executando o Sistema

O sistema funciona em duas etapas: o pareamento inicial (feito uma única vez) e a execução normal em segundo plano.

### 1. Pareamento Inicial (Apenas na primeira vez)

Se a pasta `./QR` não existir, você precisa conectar o bot ao seu número de WhatsApp.

a. Pare qualquer processo que esteja rodando no PM2:
   ```bash
   pm2 stop all
   ```
b. Execute o bot manualmente no modo interativo:
   ```bash
   node index.js
   ```
c. Siga as instruções no terminal: digite o número de telefone e use o código de pareamento gerado no seu aplicativo WhatsApp.

d. Após ver a mensagem `✅ Conectado com sucesso!`, pare o processo com `Ctrl+C`.

### 2. Execução Normal com PM2

Para rodar o bot e o n8n em segundo plano, use o PM2:

```bash
pm2 start ecosystem.config.js
```

## Comandos Úteis do PM2

- **Verificar o status dos processos:**
  ```bash
  pm2 status
  ```
- **Ver os logs do bot em tempo real:**
  ```bash
  pm2 logs bot-pizza
  ```
- **Ver os logs do n8n:**
  ```bash
  pm2 logs n8n
  ```
- **Reiniciar todos os processos:**
  ```bash
  pm2 restart all
  ```
- **Parar todos os processos:**
  ```bash
  pm2 stop all
  ```

## Acessando o n8n

Com o sistema rodando via PM2, você pode acessar a interface web do n8n no seu navegador:

- **URL:** `http://localhost:5678`
- **Usuário:** `seu_usuario_secreto` (o que você definiu em `ecosystem.config.js`)
- **Senha:** `sua_senha_secreta` (a que você definiu em `ecosystem.config.js`)
