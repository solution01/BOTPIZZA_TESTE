const apiClient = require('../apiClient');
const { allPizzas, bebidas } = require('../menu');

async function verificarPagamentoAutomatico(idPagamento, sock, from) {
  let tentativas = 0;
  const intervalo = setInterval(async () => {
    tentativas++;

    try {
      const status = await apiClient.verificarStatusPagamento(idPagamento);

      if (status === 'approved') {
        clearInterval(intervalo);
        await sock.sendMessage(from, {
          text: '✅ *Pagamento aprovado!*\n🍕 Seu pedido foi enviado para a cozinha!',
        });
      } else if (status === 'rejected') {
        clearInterval(intervalo);
        await sock.sendMessage(from, {
          text: '❌ Pagamento rejeitado. Verifique no aplicativo do banco.',
        });
      } else if (tentativas >= 20) {
        // limite de tentativas (20x30s = 10 minutos)
        clearInterval(intervalo);
        await sock.sendMessage(from, {
          text: '⏳ Pagamento não confirmado em tempo hábil. Verifique e tente novamente.',
        });
      }
    } catch (error) {
      console.error(
        'Erro ao verificar pagamento:',
        error.response?.data || error.message
      );
    }
  }, 30000); // 30 segundos entre verificações
}

async function handleCheckout(sock, from, pedido, text) {
  if (pedido.etapa === 'finalizado') {
    await sock.sendMessage(from, {
      text: '📍 Por favor, digite seu endereço completo para calcularmos o tempo de entrega.',
    });
    pedido.etapa = 'aguardando_endereco';
    return { etapaAlterada: true, sucesso: true };
  }

  if (pedido.etapa === 'aguardando_endereco') {
    pedido.endereco = text;
    pedido.tentativasEndereco = (pedido.tentativasEndereco || 0) + 1;

    const coordenadas = await apiClient.obterCoordenadasNominatim(
      pedido.endereco
    );

    if (!coordenadas) {
      if (pedido.tentativasEndereco >= 3) {
        await sock.sendMessage(from, {
          text:
            'Não consegui localizar esse endereço após 3 tentativas.\n' +
            'Seu pedido será enviado com o endereço informado e será verificado manualmente pelo atendente.',
        });
        // ... (lógica de resumo sem frete)
        return { etapaAlterada: false, sucesso: true, finalizar: true };
      } else {
        await sock.sendMessage(from, {
          text: `Não consegui localizar esse endereço. Por favor, revise e envie novamente. (${pedido.tentativasEndereco}/3 tentativas)`,
        });
        return { etapaAlterada: false, sucesso: false };
      }
    }

    const pizzaria = { lat: -23.47051451502922, lng: -46.692908398115588 };
    await apiClient.calcularDistanciaOSRM(coordenadas, pizzaria);

    let precoPizza = 0;
    if (pedido.isMeioAMeio) {
      const sabor1Obj = allPizzas.find(p => p.rowId === `sabor ${pedido.sabor1}`);
      const sabor2Obj = allPizzas.find(p => p.rowId === `sabor ${pedido.sabor2}`);
      if (sabor1Obj && sabor2Obj) {
        precoPizza = (sabor1Obj.preco + sabor2Obj.preco) / 2;
      }
    } else {
      const saborSelecionado = allPizzas.find(
        p => p.rowId === `sabor ${pedido.sabor}`
      );
      if (saborSelecionado) precoPizza = saborSelecionado.preco;
    }

    const bebidaSelecionada = bebidas.find(
      b => b.rowId === `bebida ${pedido.bebida}`
    );
    const precoBebida = bebidaSelecionada ? bebidaSelecionada.preco : 0;
    const valorTotal = precoPizza + precoBebida;

    try {
      const pagamento = await apiClient.gerarPixMercadoPago(
        valorTotal,
        'Pedido Pizzaria do Zé',
        from.replace(/[^0-9]/g, '') + '@email.com'
      );

      if (!pagamento) throw new Error('Falha ao gerar dados de pagamento.');

      pedido.idPagamento = pagamento.id;

      let resumoPizzaDetalhes = '';
      if (pedido.isMeioAMeio) {
        const sabor1Obj = allPizzas.find(p => p.rowId === `sabor ${pedido.sabor1}`);
        const sabor2Obj = allPizzas.find(p => p.rowId === `sabor ${pedido.sabor2}`);
        resumoPizzaDetalhes = `🍕 Pizza Meio a Meio:\n   - Sabor 1: ${
          sabor1Obj ? sabor1Obj.title.replace(/ R\$ .*/, '') : 'Não encontrado'
        }\n   - Sabor 2: ${
          sabor2Obj ? sabor2Obj.title.replace(/ R\$ .*/, '') : 'Não encontrado'
        }`;
      } else {
        const saborSelecionado = allPizzas.find(p => p.rowId === `sabor ${pedido.sabor}`);
        resumoPizzaDetalhes = `🍕 Tipo: ${pedido.tipo}\n🍽️ Sabor: ${
          saborSelecionado
            ? saborSelecionado.title.replace(/ R\$ .*/, '')
            : 'Não encontrado'
        }`;
      }

      const resumo =
        `📝 *Resumo do seu pedido:*\n` +
        `${resumoPizzaDetalhes}\n` +
        `🥤 Bebida: ${
          pedido.bebida === 'nenhum'
            ? 'Nenhuma'
            : bebidaSelecionada.title.replace(/ R\$ .*/, '')
        }\n` +
        `📍 Endereço: ${pedido.endereco}\n\n` +
        `💰 Valor total: R$ ${valorTotal.toFixed(2)}`;

      await sock.sendMessage(from, { text: resumo });
      console.log(`🧾 Pedido recebido de ${from}:\n${resumo}`);

      await sock.sendMessage(from, {
        text: `💸 *Pagamento via Pix:*\n\nCopie o código abaixo para pagar:\n\n`,
      });
      await sock.sendMessage(from, { text: `${pagamento.qr_code}` });

      const base64Data = pagamento.qr_code_base64.replace(
        /^data:image\/png;base64,/,
        ''
      );
      const buffer = Buffer.from(base64Data, 'base64');
      await sock.sendMessage(from, {
        image: buffer,
        caption: '📸 *Escaneie o QR Code para pagar com Pix*',
      });

      verificarPagamentoAutomatico(pedido.idPagamento, sock, from);

      return { etapaAlterada: false, sucesso: true, finalizar: true };
    } catch (err) {
      console.error('Erro ao gerar pagamento:', err.response?.data || err.message);
      await sock.sendMessage(from, {
        text: '❌ Erro ao gerar o pagamento via Pix. Tente novamente ou fale com o atendente.',
      });
      return { etapaAlterada: false, sucesso: false };
    }
  }
}

module.exports = handleCheckout;