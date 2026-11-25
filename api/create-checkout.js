import Stripe from 'stripe'

// made on first use, so a missing key answers with an error instead of crashing the function at load
let client = null
const stripeApi = () => (client ||= new Stripe(process.env.STRIPE_SECRET_KEY))

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { toName, fromName, email, anonId } = req.body
    const origin = req.headers.origin || process.env.SITE_URL || 'http://localhost:5173'

    const session = await stripeApi().checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: "While You're Away — Letter Box",
              description: `A personalized letter box from ${fromName} to ${toName}`,
            },
            unit_amount: 999, // $9.99, paid once at handover
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${origin}/auth/callback?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paywall?payment=cancelled`,
      metadata: {
        fromName: fromName || '',
        toName: toName || '',
        email: email || '',
        // random visitor id (no personal data), so the payment can be tied back to the funnel
        anon_id: /^[a-f0-9-]{16,40}$/.test(anonId || '') ? anonId : '',
      },
    })

    res.status(200).json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: error.message })
  }
}
