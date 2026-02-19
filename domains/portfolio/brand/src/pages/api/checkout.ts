import type { APIRoute } from 'astro';
import { stripe } from '../../lib/stripe';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { itemId, name, price, imageUrl } = body;

        if (!price) {
            return new Response(JSON.stringify({ error: 'This item is not for sale.' }), { status: 400 });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: name,
                            images: imageUrl ? [imageUrl] : [],
                            metadata: { itemId },
                        },
                        unit_amount: price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/catalog`,
        });

        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Stripe Session Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
