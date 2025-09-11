const axios = require('axios');

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const MERCADO_PAGO_TOKEN = process.env.MERCADO_PAGO_TOKEN;

async function verificarCliente(nomeCompleto, cpf) {
  const response = await axios.post(N8N_WEBHOOK_URL, {
    nomeCompleto,
    cpf,
  });
  return response.data;
}

async function obterCoordenadasNominatim(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    endereco
  )}`;

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'PizzariaBot/1.0' },
    });
    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao consultar Nominatim:', error);
    return null;
  }
}

async function calcularDistanciaOSRM(origem, destino) {
  const url = `http://router.project-osrm.org/route/v1/driving/${origem.lng},${origem.lat};${destino.lng},${destino.lat}?overview=false`;

  try {
    const response = await axios.get(url);
    if (
      response.data &&
      response.data.routes &&
      response.data.routes.length > 0
    ) {
      const rota = response.data.routes[0];
      return {
        distancia: rota.distance, // em metros
        duracao: rota.duration, // em segundos
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao consultar OSRM:', error);
    return null;
  }
}

async function gerarPixMercadoPago(valor, descricao, emailCliente) {
  const url = 'https://api.mercadopago.com/v1/payments';

  const body = {
    transaction_amount: valor,
    description: descricao,
    payment_method_id: 'pix',
    payer: { email: emailCliente || 'comprador@email.com' },
  };

  const idempotencyKey = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  console.log('Enviando para Mercado Pago:', body);

  const response = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`,
      'X-Idempotency-Key': idempotencyKey,
    },
  });

  return {
    id: response.data.id,
    qr_code: response.data.point_of_interaction.transaction_data.qr_code,
    qr_code_base64:
      response.data.point_of_interaction.transaction_data.qr_code_base64,
  };
}

async function verificarStatusPagamento(idPagamento) {
  const response = await axios.get(
    `https://api.mercadopago.com/v1/payments/${idPagamento}`,
    {
      headers: { Authorization: `Bearer ${MERCADO_PAGO_TOKEN}` },
    }
  );
  return response.data.status;
}

module.exports = {
  verificarCliente,
  obterCoordenadasNominatim,
  calcularDistanciaOSRM,
  gerarPixMercadoPago,
  verificarStatusPagamento,
};
