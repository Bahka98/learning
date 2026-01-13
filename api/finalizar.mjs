// api/finalizar.mjs
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    // Configuração com o seu Token seguro da Vercel
    const client = new MercadoPagoConfig({ 
        accessToken: process.env.MP_ACCESS_TOKEN 
    });
    const payment = new Payment(client);

    try {
        const { nome, email, cpf } = req.body;

        const body = {
            transaction_amount: 10.00, // Valor do seu plano
            description: 'Plano Mensal Dezpila',
            payment_method_id: 'pix',
            payer: {
                email: email,
                first_name: nome,
                identification: { 
                    type: 'CPF', 
                    number: cpf.replace(/\D/g, '') // Limpa pontos e traços do CPF
                }
            }
        };

        const result = await payment.create({ body });

        // IMPORTANTE: Retornamos o ID para o frontend poder verificar o status depois
        return res.status(200).json({
            id: result.id, 
            qr_code: result.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64
        });

    } catch (error) {
        console.error("Erro ao criar pagamento:", error);
        return res.status(500).json({ 
            error: 'Erro ao processar pagamento',
            details: error.message 
        });
    }
}