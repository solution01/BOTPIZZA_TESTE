const apiClient = require('./apiClient');

async function handleRegistration(sock, from, pedido, text) {
  if (pedido.etapa === 'saudacao') {
    const hora = new Date().getHours();
    let saudacao = 'Olá';
    if (hora >= 6 && hora < 12) saudacao = 'Bom dia';
    else if (hora >= 12 && hora < 18) saudacao = 'Boa tarde';
    else saudacao = 'Boa noite';

    await sock.sendMessage(from, {
      text: `${saudacao}, para começarmos, por favor, me diga seu nome completo.`,
    });
    pedido.etapa = 'aguardando_nome';
    return { etapaAlterada: true, sucesso: true };
  }

  if (pedido.etapa === 'aguardando_nome') {
    pedido.nomeCompleto = text;
    await sock.sendMessage(from, {
      text: `Obrigado, ${pedido.nomeCompleto}! Agora, por favor, digite seu CPF (somente números).`,
    });
    pedido.etapa = 'aguardando_cpf';
    return { etapaAlterada: true, sucesso: true };
  }

  if (pedido.etapa === 'aguardando_cpf') {
    const cpfLimpo = text.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      await sock.sendMessage(from, {
        text: 'CPF inválido. Por favor, digite o CPF com 11 dígitos, apenas números.',
      });
      return { etapaAlterada: false, sucesso: false };
    }

    pedido.cpf = cpfLimpo;
    await sock.sendMessage(from, {
      text: 'Validando seus dados. Por favor, aguarde...',
    });

    try {
      const response = await apiClient.verificarCliente(
        pedido.nomeCompleto,
        pedido.cpf
      );

      if (response.clienteExiste) {
        await sock.sendMessage(from, {
          text: `Olá novamente, ${pedido.nomeCompleto}! Parece que você já esteve aqui.`,
        });
      } else {
        await sock.sendMessage(from, {
          text: `Olá, ${pedido.nomeCompleto}! Seja bem-vindo(a) pela primeira vez!`,
        });
      }

      pedido.etapa = 'menu';
      return { etapaAlterada: true, sucesso: true, processarProximaEtapa: true };
    } catch (error) {
      console.error('Erro ao verificar cliente:', error.message);
      await sock.sendMessage(from, {
        text: 'Desculpe, ocorreu um erro ao verificar seus dados. Por favor, tente novamente mais tarde.',
      });
      return { etapaAlterada: false, sucesso: false, resetar: true };
    }
  }
}

module.exports = handleRegistration;