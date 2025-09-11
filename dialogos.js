const pedidosPorUser = {}; // Guarda pedidos por usuário (jid)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('baileys-pro');

const handleRegistration = require('./handlers/registrationHandler');
const handleOrder = require('./handlers/orderHandler');
const handleCheckout = require('./handlers/checkoutHandler');

const registrationEtapas = ['saudacao', 'aguardando_nome', 'aguardando_cpf'];
const orderEtapas = [
  'menu', 'tipo_aguardando', 'meio_a_meio_tipo', 'meio_a_meio_aguardando_tipo',
  'meio_a_meio_sabor1', 'meio_a_meio_aguardando_sabor1', 'meio_a_meio_sabor2',
  'meio_a_meio_aguardando_sabor2', 'sabor', 'sabor_aguardando', 'bebida',
  'bebida_aguardando'
];
const checkoutEtapas = ['finalizado', 'aguardando_endereco'];

async function handleMensagem(sock, msg) {
  const from = msg.key.remoteJid;
  let text = '';

  if (msg.message?.audioMessage || msg.message?.voiceMessage) {
    try {
      // Tenta baixar o áudio usando o contexto do socket
      const buffer = await downloadMediaMessage(
        msg,
        'buffer',
        {}, // opções
        { logger: console, reuploadRequest: sock.updateMediaMessage }
      );
      if (!fs.existsSync('Audio')) fs.mkdirSync('Audio');
      const nomeArquivo = `Audio_${Date.now()}_${Math.floor(
        Math.random() * 10000
      )}.ogg`;
      const caminho = path.join('Audio', nomeArquivo);
      fs.writeFileSync(caminho, buffer);
      await sock.sendMessage(from, {
        text: '🎤 Áudio recebido e salvo com sucesso!',
      });
      console.log('Áudio salvo em:', caminho);
    } catch (e) {
      await sock.sendMessage(from, { text: '❌ Erro ao salvar o áudio.' });
      console.error('Erro ao salvar áudio:', e);
    }
    return;
  }

  // Extrair texto digitado ou botão/lista selecionado
  if (msg.message?.conversation) {
    text = msg.message.conversation.trim();
  } else if (msg.message?.extendedTextMessage) {
    text = msg.message.extendedTextMessage.text.trim();
  } else if (msg.message?.buttonsResponseMessage) {
    text = msg.message.buttonsResponseMessage.selectedButtonId;
  } else if (msg.message?.listResponseMessage) {
    text =
      msg.message.listResponseMessage.singleSelectReply?.selectedRowId ||
      msg.message.listResponseMessage.title;
  }

  if (!text) return;

  // Inicializar estrutura do pedido se necessário
  if (!pedidosPorUser[from]) {
    pedidosPorUser[from] = {
      etapa: 'saudacao',
      nomeCompleto: null,
      cpf: null,
      tipo: null,
      isMeioAMeio: false,
      meioAMeioTipo: null,
      sabor1: null,
      sabor2: null,
      bebida: null,
      tentativasEndereco: 0,
      jaOrientouMenu: false,
      atendimentoHumano: false,
    };
  }

  const pedido = pedidosPorUser[from];

  if (pedido.atendimentoHumano) {
    return;
  }

  let resultado;
  let processarNovamente = false;

  do {
    processarNovamente = false;
    const etapaAtual = pedido.etapa;

    if (registrationEtapas.includes(etapaAtual)) {
      resultado = await handleRegistration(sock, from, pedido, text);
    } else if (orderEtapas.includes(etapaAtual)) {
      resultado = await handleOrder(sock, from, pedido, text);
    } else if (checkoutEtapas.includes(etapaAtual)) {
      resultado = await handleCheckout(sock, from, pedido, text);
    }

    if (resultado) {
      if (resultado.resetar) {
        delete pedidosPorUser[from];
        break;
      }
      if (resultado.finalizar) {
        delete pedidosPorUser[from];
        break;
      }
      if (resultado.processarProximaEtapa) {
        processarNovamente = true;
      }
    }
  } while (processarNovamente);
}

module.exports = {
  handleMensagem,
};
