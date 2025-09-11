module.exports = {
  apps: [
    {
      name: 'bot-pizza',
      script: 'index.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
    },
    {
      name: 'n8n',
      script: require.resolve('n8n'),
      args: '',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      env: {
        N8N_SECURE_COOKIE: false,
        N8N_PROTOCOL: 'http',
        N8N_HOST: '0.0.0.0',
        N8N_PORT: 5678,
        N8N_BASIC_AUTH_ACTIVE: true,
        N8N_BASIC_AUTH_USER: 'seu_usuario_secreto',
        N8N_BASIC_AUTH_PASSWORD: 'sua_senha_secreta',
      },
    },
  ],
};
