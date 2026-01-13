// api/finalizar.js
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    // Configuração com a variável de ambiente segura
    const client = new MercadoPagoConfig({ 
        accessToken: process.env.MP_ACCESS_TOKEN 
    });
    const payment = new Payment(client);

    try {
        const { nome, email, cpf } = req.body;

        const body = {
            transaction_amount: 10.00,
            description: 'Plano Mensal Dezpila',
            payment_method_id: 'pix',
            payer: {
                email: email,
                first_name: nome,
                identification: { 
                    type: 'CPF', 
                    number: cpf.replace(/\D/g, '') 
                }
            }
        };

        const result = await payment.create({ body });

        return res.status(200).json({
            qr_code: result.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
}