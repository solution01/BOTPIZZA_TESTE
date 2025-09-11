const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestWaWebVersion,
  Browsers,
} = require('@whiskeysockets/baileys');
const { handleMensagem } = require('./dialogos');
const P = require('pino');
const readline = require('readline');

// Caminho da sessão
const authFile = './QR';

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve =>
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

async function startBot() {
  console.log(
    '⚠️ Lembre-se: Caso tenha problemas de conexão, apague a pasta "./QR"\n'
  );

  const { state, saveCreds } = await useMultiFileAuthState('./QR');
  const version = [2, 3000, 1025200398]; // versão forçada
  console.log('🧩 Usando versão forçada do WhatsApp Web:', version);

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false, // Desativa QR code no terminal
    browser: Browsers.macOS('Safari'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
    },
  });

  // Se não estiver registrado e rodando com PM2, não podemos parear.
  // Avisamos o usuário e saímos de forma limpa para evitar o loop de reinicialização.
  if (!sock.authState.creds.registered && process.env.PM2_INSTANCE_ID !== undefined) {
    console.error('❌ Bot não está registrado. Por favor, execute "node index.js" uma vez para fazer o pareamento do WhatsApp antes de usar o PM2.');
    process.exit(0); // Saída limpa para o PM2 não reiniciar
  }

  // 📲 Pairing Code - só executa em modo interativo (não via PM2)
  // A variável de ambiente `PM2_INSTANCE_ID` só existe quando rodando via PM2
  if (!sock.authState.creds.registered && process.env.PM2_INSTANCE_ID === undefined) {
    try {
      const numero = await askQuestion(
        '📞 Digite seu número no formato DDI + DDD + número (ex: 5511999999999): '
      );
      if (!/^\d{12,13}$/.test(numero)) {
        console.log('❌ Número inválido. Certifique-se de usar apenas números.');
        process.exit(1);
      }
      const codigoPareamento = await sock.requestPairingCode(numero);
      console.log(`📲 Código de pareamento gerado: ${codigoPareamento}`);
      console.log(
        '✅ Vá até o WhatsApp > Aparelhos Conectados > Conectar com código e insira esse código.'
      );
    } catch (e) {
      console.error('❌ Falha ao iniciar o pareamento interativo.', e);
      process.exit(1);
    }
  }

  // Eventos de conexão
  sock.ev.on('connection.update', async update => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log('✅ Conectado com sucesso!');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log('❌ Conexão fechada, status code:', statusCode);
      console.log('⚠️ Se precisar, apague a pasta "./QR" e reconecte.');

      // Se o erro for de autenticação (401) ou pareamento expirado (515),
      // a sessão é inválida. O bot deve parar para ser pareado novamente.
      if (statusCode === 401 || statusCode === 515) {
        console.error('❌ Erro de autenticação. A sessão é inválida. Apague a pasta "./QR" e reinicie o bot manualmente com "node index.js" para parear novamente.');
        process.exit(1); // Sai com erro para que o PM2 possa registrar a falha.
      } else {
        console.log('🔁 Tentando reconectar...');
        // A biblioteca Baileys tentará reconectar automaticamente na maioria dos outros casos.
      }
    }
  });

  // Mensagens recebidas
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;

    if (from.endsWith('@g.us')) {
      await sock.groupLeave(from);
      console.log('👋 Saí do grupo automaticamente ao receber mensagem!');
      return;
    }

    const text = (
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''
    ).trim();

    console.log(`📩 Mensagem recebida de ${from}: ${text}`);
    await handleMensagem(sock, msg);
  });

  // Atualizar credenciais
  sock.ev.on('creds.update', saveCreds);
}

startBot();

// Tratamento de erros
process.on('uncaughtException', err => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  console.error('❌ Promessa rejeitada não tratada:', err);
  process.exit(1);
});
