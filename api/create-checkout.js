import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { toName, fromName } = req.body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: "While You're Away — Letter Box",
              description: `A personalized letter box from ${fromName} to ${toName}`,
            },
            unit_amount: 3900,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/editor?payment=success`,
      cancel_url: `${req.headers.origin}/paywall?payment=cancelled`,
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: error.message })
  }
}
