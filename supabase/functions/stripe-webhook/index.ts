// supabase/functions/stripe-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Stripe webhook handler
Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const stripeKey = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!stripeKey) {
      throw new Error('Missing Stripe webhook secret')
    }

    // Verify webhook signature (simplified - use proper Stripe library in production)
    // const event = stripe.webhooks.constructEvent(body, signature, stripeKey)
    
    // For demo, we'll parse the JSON directly
    const event = JSON.parse(body)
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabaseClient, event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(supabaseClient, event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(supabaseClient, event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailure(supabaseClient, event.data.object)
        break
    }

    return new Response('OK', { status: 200 })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error', { status: 400 })
  }
})

async function handleSubscriptionUpdate(supabaseClient: any, subscription: any) {
  const planType = getPlanTypeFromPriceId(subscription.items.data[0].price.id)
  
  const { error } = await supabaseClient
    .from('user_subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'stripe_subscription_id'
    })
    
  if (error) {
    console.error('Failed to update subscription:', error)
  }
}

async function handleSubscriptionCancellation(supabaseClient: any, subscription: any) {
  const { error } = await supabaseClient
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
    
  if (error) {
    console.error('Failed to cancel subscription:', error)
  }
}

async function handlePaymentSuccess(supabaseClient: any, invoice: any) {
  // Record successful payment
  const { error } = await supabaseClient
    .from('payment_history')
    .insert({
      stripe_invoice_id: invoice.id,
      stripe_customer_id: invoice.customer,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      payment_method: invoice.charge?.payment_method_details?.type || 'card'
    })
    
  if (error) {
    console.error('Failed to record payment:', error)
  }
}

async function handlePaymentFailure(supabaseClient: any, invoice: any) {
  // Record failed payment and potentially downgrade subscription
  const { error } = await supabaseClient
    .from('payment_history')
    .insert({
      stripe_invoice_id: invoice.id,
      stripe_customer_id: invoice.customer,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed'
    })
    
  if (error) {
    console.error('Failed to record payment failure:', error)
  }
}

function getPlanTypeFromPriceId(priceId: string): string {
  // Map Stripe price IDs to plan types
  const priceMap: { [key: string]: string } = {
    'price_basic_monthly': 'basic',
    'price_pro_monthly': 'pro',
    // Add your actual Stripe price IDs here
  }
  
  return priceMap[priceId] || 'free'
}

// supabase/functions/create-checkout-session/index.ts
// Separate function for creating Stripe checkout sessions
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, customerId } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Create Stripe checkout session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'success_url': `${req.headers.get('origin')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${req.headers.get('origin')}/subscription/cancel`,
        'payment_method_types[]': 'card',
        'mode': 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'customer_email': user.email!,
        'metadata[user_id]': user.id,
        'subscription_data[metadata][user_id]': user.id,
      }),
    })

    const session = await stripeResponse.json()

    if (!stripeResponse.ok) {
      throw new Error(session.error?.message || 'Failed to create checkout session')
    }

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Checkout session creation error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Ücretsiz',
    price: 0,
    currency: 'TRY',
    interval: 'month',
    features: [
      'Günlük 5 tahmin',
      'Temel istatistikler',
      '5 lig erişimi',
      'Reklam gösterimi'
    ],
    dailyLimit: 5,
    leagueAccess: ['premier-league', 'super-lig', 'bundesliga', 'serie-a', 'la-liga'],
    aiAnalysis: false,
    priority: 'normal'
  },
  basic: {
    name: 'Temel',
    price: 29,
    priceId: 'price_basic_monthly', // Your Stripe price ID
    currency: 'TRY',
    interval: 'month',
    features: [
      'Günlük 25 tahmin',
      'Detaylı istatistikler',
      'Tüm liglere erişim',
      'Temel AI analizler',
      'Email bildirimleri'
    ],
    dailyLimit: 25,
    leagueAccess: 'all',
    aiAnalysis: true,
    priority: 'normal'
  },
  pro: {
    name: 'Profesyonel',
    price: 79,
    priceId: 'price_pro_monthly', // Your Stripe price ID
    currency: 'TRY',
    interval: 'month',
    features: [
      'Günlük 100 tahmin',
      'Gelişmiş AI analizler',
      'Tüm liglere erişim',
      'Gerçek zamanlı bildirimler',
      'Özel istatistikler',
      'Öncelikli destek',
      'Risk analizi'
    ],
    dailyLimit: 100,
    leagueAccess: 'all',
    aiAnalysis: true,
    priority: 'high'
  }
}