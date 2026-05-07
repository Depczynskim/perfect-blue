import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Backwards compatibility - lazy getter
export const stripe = {
  get checkout() { return getStripeServer().checkout; },
  get webhooks() { return getStripeServer().webhooks; },
};

export const STRIPE_CONFIG = {
  priceId: process.env.STRIPE_PRICE_ID_SUBSCRIPTION,
  currency: 'eur',
  // Cena w centach (500 = 5.00 EUR)
  subscriptionAmount: 500,
  // Nazwa produktu
  productName: 'Perfect Blue Premium',
  productDescription: 'Dostęp do kontaktu ze wszystkimi właścicielami ogłoszeń',
} as const;
