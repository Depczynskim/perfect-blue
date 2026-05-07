import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Używamy service role key dla webhooków (omija RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeServer();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`Webhook received: ${event.type}`);

  // Obsługa zdarzeń subskrypcji
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') {
        await handleSubscriptionCheckout(session);
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCanceled(subscription);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!userId) {
    console.error('Missing user_id in session metadata');
    return;
  }

  console.log(`Subscription checkout completed for user ${userId}`);

  // Zaktualizuj użytkownika
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      is_paid: true,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription:', error);
  } else {
    console.log(`User ${userId} subscription activated`);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;

  console.log(`Subscription ${subscription.id} updated: ${status}`);

  // Znajdź użytkownika po customer_id
  const { data: user, error: findError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (findError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Mapuj status Stripe na nasz status
  const isPaid = ['active', 'trialing'].includes(status);
  const subscriptionStatus = status === 'active' ? 'active' : 
                             status === 'past_due' ? 'past_due' :
                             status === 'canceled' ? 'canceled' : 'inactive';

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      is_paid: isPaid,
      stripe_subscription_id: subscription.id,
      subscription_status: subscriptionStatus,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating subscription status:', error);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log(`Subscription ${subscription.id} canceled`);

  // Znajdź użytkownika po customer_id
  const { data: user, error: findError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (findError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      is_paid: false,
      subscription_status: 'canceled',
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error canceling subscription:', error);
  } else {
    console.log(`User ${user.id} subscription canceled`);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log(`Payment failed for customer ${customerId}`);

  // Znajdź użytkownika po customer_id
  const { data: user, error: findError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (findError || !user) {
    return;
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating payment status:', error);
  }
}
