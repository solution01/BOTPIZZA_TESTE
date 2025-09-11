const {
  pizzasSalgadas,
  pizzasDoces,
  bebidas,
  allPizzas,
} = require('./menu');

async function handleOrder(sock, from, pedido, text, pedidosPorUser) {
  if (pedido.etapa === 'menu' || text.toLowerCase() === 'menu') {
    await sock.sendMessage(from, {
      image: { url: 'https://i.ibb.co/cSTdn85L/Copilot-20250805-124207.png' },
      caption: `Bem-vindo(a) à Pizzaria do Zé!\nQual seu pedido hoje?`,
    });

    await sock.sendMessage(from, {
      text: 'Escolha o tipo de pizza:',
      sections: [
        {
          title: 'Tipos de Pizza',
          rows: [
            { title: 'Salgada', rowId: 'tipo salgada' },
            { title: 'Doce', rowId: 'tipo doce' },
            { title: 'Meio a Meio', rowId: 'tipo meio a meio' },
          ],
        },
      ],
      buttonText: 'Selecionar tipo',
      headerType: 1,
    });
    pedido.etapa = 'tipo_aguardando';
    return;
  }

  if (pedido.etapa === 'tipo_aguardando') {
    if (text === 'tipo salgada') {
      pedido.tipo = 'salgada';
      pedido.isMeioAMeio = false;
      pedido.etapa = 'sabor';
    } else if (text === 'tipo doce') {
      pedido.tipo = 'doce';
      pedido.isMeioAMeio = false;
      pedido.etapa = 'sabor';
    } else if (text === 'tipo meio a meio') {
      pedido.tipo = 'meio_a_meio';
      pedido.isMeioAMeio = true;
      pedido.etapa = 'meio_a_meio_tipo';
    } else if (text.toLowerCase() === 'falar com um atendente') {
      await sock.sendMessage(from, {
        text: 'Você será transferido para um atendimento humanizado. Aguarde o contato de um atendente.',
      });
      pedido.atendimentoHumano = true;
      setTimeout(() => {
        if (pedidosPorUser[from]) {
          pedidosPorUser[from].atendimentoHumano = false;
          pedidosPorUser[from].jaOrientouMenu = false;
        }
      }, 60 * 60 * 1000); // 1 hora em ms
      return;
    } else {
      await sock.sendMessage(from, {
        text: 'Opção inválida. Para atendimento humano, digite: *falar com um atendente*',
      });
      return;
    }
  }

  if (pedido.etapa === 'meio_a_meio_tipo') {
    await sock.sendMessage(from, {
      text: 'Para sua pizza meio a meio, qual será a combinação?',
      sections: [
        {
          title: 'Combinações Meio a Meio',
          rows: [
            {
              title: 'Meia Salgada + Meia Salgada',
              rowId: 'meio_salgada_salgada',
            },
            { title: 'Meia Doce + Meia Doce', rowId: 'meio_doce_doce' },
            { title: 'Meia Salgada + Meia Doce', rowId: 'meio_salgada_doce' },
          ],
        },
      ],
      buttonText: 'Selecionar combinação',
      headerType: 1,
    });
    pedido.etapa = 'meio_a_meio_aguardando_tipo';
    return;
  }

  if (pedido.etapa === 'meio_a_meio_aguardando_tipo') {
    if (
      ['meio_salgada_salgada', 'meio_doce_doce', 'meio_salgada_doce'].includes(
        text
      )
    ) {
      pedido.meioAMeioTipo = text;
      pedido.etapa = 'meio_a_meio_sabor1';
    } else {
      await sock.sendMessage(from, {
        text: 'Opção inválida para combinação meio a meio. Por favor, selecione uma das opções fornecidas.',
      });
      return;
    }
  }

  if (pedido.etapa === 'meio_a_meio_sabor1') {
    let saboresDisponiveis = [];
    let tituloMensagem = '';

    if (pedido.meioAMeioTipo === 'meio_salgada_salgada') {
      saboresDisponiveis = pizzasSalgadas;
      tituloMensagem = 'Escolha o primeiro sabor de pizza salgada:';
    } else if (pedido.meioAMeioTipo === 'meio_doce_doce') {
      saboresDisponiveis = pizzasDoces;
      tituloMensagem = 'Escolha o primeiro sabor de pizza doce:';
    } else if (pedido.meioAMeioTipo === 'meio_salgada_doce') {
      saboresDisponiveis = allPizzas;
      tituloMensagem = 'Escolha o primeiro sabor (Salgada ou Doce):';
    }

    const cards = saboresDisponiveis.map(pizza => ({
      title: pizza.title,
      image: { url: pizza.img },
      caption: `${pizza.description}\n\n${pizza.frase}`,
    }));

    await sock.sendMessage(from, {
      text: tituloMensagem,
      footer: 'Veja as opções abaixo.',
      viewOnce: true,
      cards,
    });

    await sock.sendMessage(from, {
      text: `Selecione o primeiro sabor da pizza:`,
      sections: [
        {
          title: 'Sabores',
          rows: saboresDisponiveis.map(pizza => ({
            title: pizza.title,
            description: pizza.description,
            rowId: pizza.rowId,
          })),
        },
      ],
      buttonText: 'Selecionar sabor',
      headerType: 1,
    });
    pedido.etapa = 'meio_a_meio_aguardando_sabor1';
    return;
  }

  if (pedido.etapa === 'meio_a_meio_aguardando_sabor1') {
    const saborEscolhido = allPizzas.find(p => p.rowId === text);
    if (saborEscolhido) {
      let isValidFlavor = false;
      if (
        pedido.meioAMeioTipo === 'meio_salgada_salgada' &&
        saborEscolhido.tipoPizza === 'salgada'
      ) {
        isValidFlavor = true;
      } else if (
        pedido.meioAMeioTipo === 'meio_doce_doce' &&
        saborEscolhido.tipoPizza === 'doce'
      ) {
        isValidFlavor = true;
      } else if (pedido.meioAMeioTipo === 'meio_salgada_doce') {
        isValidFlavor = true;
      }

      if (isValidFlavor) {
        pedido.sabor1 = saborEscolhido.rowId.replace('sabor ', '');
        pedido.etapa = 'meio_a_meio_sabor2';
      } else {
        await sock.sendMessage(from, {
          text: `Sabor inválido para a combinação *${pedido.meioAMeioTipo
            .replace('meio_', '')
            .replace('_', ' + ')}*. Por favor, escolha um sabor apropriado.`,
        });
        return;
      }
    } else {
      await sock.sendMessage(from, {
        text: 'Escolha um sabor válido. Responda conforme instrução do card.',
      });
      return;
    }
  }

  if (pedido.etapa === 'meio_a_meio_sabor2') {
    let saboresDisponiveis = [];
    let tituloMensagem = '';

    if (pedido.meioAMeioTipo === 'meio_salgada_salgada') {
      saboresDisponiveis = pizzasSalgadas;
      tituloMensagem = 'Escolha o segundo sabor de pizza salgada:';
    } else if (pedido.meioAMeioTipo === 'meio_doce_doce') {
      saboresDisponiveis = pizzasDoces;
      tituloMensagem = 'Escolha o segundo sabor de pizza doce:';
    } else if (pedido.meioAMeioTipo === 'meio_salgada_doce') {
      saboresDisponiveis = allPizzas.filter(
        pizza => pizza.rowId !== `sabor ${pedido.sabor1}`
      );
      tituloMensagem = 'Escolha o segundo sabor (Salgada ou Doce):';
    }

    const cards = saboresDisponiveis.map(pizza => ({
      title: pizza.title,
      image: { url: pizza.img },
      caption: `${pizza.description}\n\n${pizza.frase}`,
    }));

    await sock.sendMessage(from, {
      text: tituloMensagem,
      footer: 'Veja as opções abaixo.',
      viewOnce: true,
      cards,
    });

    await sock.sendMessage(from, {
      text: `Selecione o segundo sabor da pizza:`,
      sections: [
        {
          title: 'Sabores',
          rows: saboresDisponiveis.map(pizza => ({
            title: pizza.title,
            description: pizza.description,
            rowId: pizza.rowId,
          })),
        },
      ],
      buttonText: 'Selecionar sabor',
      headerType: 1,
    });
    pedido.etapa = 'meio_a_meio_aguardando_sabor2';
    return;
  }

  if (pedido.etapa === 'meio_a_meio_aguardando_sabor2') {
    const saborEscolhido = allPizzas.find(p => p.rowId === text);
    if (saborEscolhido) {
      if (saborEscolhido.rowId.replace('sabor ', '') === pedido.sabor1) {
        await sock.sendMessage(from, {
          text: 'Você não pode escolher o mesmo sabor para as duas metades. Por favor, escolha um sabor diferente.',
        });
        return;
      }

      let isValidFlavor = false;
      if (
        pedido.meioAMeioTipo === 'meio_salgada_salgada' &&
        saborEscolhido.tipoPizza === 'salgada'
      ) {
        isValidFlavor = true;
      } else if (
        pedido.meioAMeioTipo === 'meio_doce_doce' &&
        saborEscolhido.tipoPizza === 'doce'
      ) {
        isValidFlavor = true;
      } else if (pedido.meioAMeioTipo === 'meio_salgada_doce') {
        const sabor1Obj = allPizzas.find(
          p => p.rowId === `sabor ${pedido.sabor1}`
        );
        if (sabor1Obj && sabor1Obj.tipoPizza !== saborEscolhido.tipoPizza) {
          isValidFlavor = true;
        } else if (!sabor1Obj) {
          isValidFlavor = true;
        }
      }

      if (isValidFlavor) {
        pedido.sabor2 = saborEscolhido.rowId.replace('sabor ', '');
        pedido.etapa = 'bebida';
      } else {
        await sock.sendMessage(from, {
          text: `Sabor inválido para a segunda metade da combinação *${pedido.meioAMeioTipo
            .replace('meio_', '')
            .replace('_', ' + ')}*. Por favor, escolha um sabor apropriado.`,
        });
        return;
      }
    } else {
      await sock.sendMessage(from, {
        text: 'Escolha um sabor válido. Responda conforme instrução do card.',
      });
      return;
    }
  }

  if (pedido.etapa === 'sabor') {
    if (pedido.tipo === 'salgada') {
      const cards = pizzasSalgadas.map(pizza => ({
        title: pizza.title,
        image: { url: pizza.img },
        caption: `${pizza.description}\n\n${pizza.frase}`,
      }));

      await sock.sendMessage(from, {
        text: 'Escolha o sabor da pizza salgada:',
        footer: 'Veja as opções abaixo.',
        viewOnce: true,
        cards,
      });

      await sock.sendMessage(from, {
        text: 'Selecione o sabor da pizza salgada:',
        sections: [
          {
            title: 'Sabores Salgados',
            rows: pizzasSalgadas.map(pizza => ({
              title: pizza.title,
              description: pizza.description,
              rowId: pizza.rowId,
            })),
          },
        ],
        buttonText: 'Selecionar sabor',
        headerType: 1,
      });

      pedido.etapa = 'sabor_aguardando';
      return;
    } else if (pedido.tipo === 'doce') {
      const cardsDoces = pizzasDoces.map(pizza => ({
        title: pizza.title,
        image: { url: pizza.img },
        caption: `${pizza.description}\n\n${pizza.frase}`,
      }));

      await sock.sendMessage(from, {
        text: 'Escolha o sabor da pizza doce:',
        footer: 'Veja as opções abaixo.',
        viewOnce: true,
        cards: cardsDoces,
      });

      await sock.sendMessage(from, {
        text: 'Selecione o sabor da pizza doce:',
        sections: [
          {
            title: 'Sabores Doces',
            rows: pizzasDoces.map(pizza => ({
              title: pizza.title,
              description: pizza.description,
              rowId: pizza.rowId,
            })),
          },
        ],
        buttonText: 'Selecionar sabor',
        headerType: 1,
      });

      pedido.etapa = 'sabor_aguardando';
      return;
    }
  }

  if (pedido.etapa === 'sabor_aguardando') {
    if (text.startsWith('sabor ')) {
      pedido.sabor = text.replace('sabor ', '');
      pedido.etapa = 'bebida';
    } else {
      await sock.sendMessage(from, {
        text: 'Escolha um sabor válido. Responda conforme instrução do card.',
      });
      return;
    }
  }

  if (pedido.etapa === 'bebida') {
    const cardsBebidas = bebidas.map(bebida => ({
      title: bebida.title,
      image: { url: bebida.img },
      caption: `${bebida.description}\n\n${bebida.frase}`,
    }));

    await sock.sendMessage(from, {
      text: 'Deseja adicionar uma bebida?',
      footer: 'Veja as opções abaixo.',
      viewOnce: true,
      cards: cardsBebidas,
    });

    await sock.sendMessage(from, {
      text: 'Selecione a bebida desejada:',
      sections: [
        {
          title: 'Bebidas',
          rows: bebidas.map(bebida => ({
            title: bebida.title,
            description: bebida.description,
            rowId: bebida.rowId,
          })),
        },
      ],
      buttonText: 'Selecionar bebida',
      headerType: 1,
    });

    pedido.etapa = 'bebida_aguardando';
    return;
  }

  if (pedido.etapa === 'bebida_aguardando') {
    if (text.startsWith('bebida ')) {
      pedido.bebida = text.replace('bebida ', '');
      pedido.etapa = 'finalizado';
    } else {
      await sock.sendMessage(from, {
        text: 'Escolha uma opção de bebida. Responda conforme instrução do card.',
      });
      return;
    }
  }
}

module.exports = handleOrder;