import Stripe from 'stripe';

const apiKey = import.meta.env?.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

export const stripe = new Stripe(apiKey || '', {
    apiVersion: '2024-12-18.acacia' as any,
});
