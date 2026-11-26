import Stripe from 'stripe'
import { isPaid } from './_lib/server.js'

// made on first use, so a missing key answers with an error instead of crashing the function at load
let client = null
const stripeApi = () => (client ||= new Stripe(process.env.STRIPE_SECRET_KEY))

// what each checkout sells; every price is paid once
export const TIERS = {
  box: { cents: 999, name: "While You're Away: Letter Box", what: 'A personalized letter box' },
  keepsake: { cents: 1999, name: "While You're Away: Letter Box + Keepsake Book", what: 'A personalized letter box and its keepsake book' },
  upgrade: { cents: 1000, name: "While You're Away: Keepsake Book", what: 'The keepsake book for a letter box' },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { toName, fromName, email, anonId, baseSession } = req.body || {}
    const origin = req.headers.origin || process.env.SITE_URL || 'http://localhost:5173'
    const tier = Object.hasOwn(TIERS, req.body?.tier) ? req.body.tier : 'box'
    const t = TIERS[tier]
    // adding the keepsake later needs a letter box that was paid for
    if (tier === 'upgrade' && !(await isPaid(baseSession))) return res.status(400).json({ error: 'no_paid_box' })

    const session = await stripeApi().checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: t.name,
              description: `${t.what} from ${fromName || 'you'} to ${toName || 'them'}`,
            },
            unit_amount: t.cents, // paid once
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: tier === 'upgrade' ? `${origin}/keepsake?upgrade=success&session_id={CHECKOUT_SESSION_ID}` : `${origin}/auth/callback?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: tier === 'upgrade' ? `${origin}/keepsake` : `${origin}/paywall?payment=cancelled`,
      metadata: {
        fromName: fromName || '',
        toName: toName || '',
        email: email || '',
        tier,
        ...(tier === 'upgrade' ? { base: String(baseSession).slice(0, 200) } : {}),
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
