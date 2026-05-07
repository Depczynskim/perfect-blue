import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getStripeServer, STRIPE_CONFIG } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Sprawdź autoryzację
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Sprawdź czy użytkownik już ma aktywną subskrypcję
    const { data: userProfile } = await supabase
      .from('users')
      .select('is_paid, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userProfile?.is_paid) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    const stripe = getStripeServer();
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Utwórz lub pobierz Stripe Customer
    let customerId = userProfile?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Zapisz customer_id w bazie
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Utwórz sesję Stripe Checkout dla subskrypcji
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: STRIPE_CONFIG.productName,
              description: STRIPE_CONFIG.productDescription,
            },
            unit_amount: STRIPE_CONFIG.subscriptionAmount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
      },
      success_url: `${origin}/profile?subscription=success`,
      cancel_url: `${origin}/profile?subscription=cancelled`,
    });

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
