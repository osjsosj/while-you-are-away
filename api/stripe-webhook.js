import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function normalizeSupabaseUrl(raw) {
  if (!raw) return ''
  return raw.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '')
}

const supabaseAdmin = createClient(
  normalizeSupabaseUrl(process.env.SUPABASE_URL),
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const email = session.customer_details?.email || session.metadata?.email
    const siteUrl = process.env.SITE_URL || 'http://localhost:5173'
    const redirectTo = `${siteUrl}/auth/callback?payment=success`

    if (email) {
      try {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const exists = existingUsers?.users?.find((u) => u.email === email)

        if (!exists) {
          await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
          })
        }

        // Supabase가 매직링크 이메일 발송 (SMTP 설정 필요)
        const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: redirectTo,
          },
        })

        if (otpError) {
          console.error('Magic link email error:', otpError.message)
        } else {
          console.log(`Magic link sent to ${email}`)
        }
      } catch (err) {
        console.error('Post-payment setup error:', err)
      }
    }
  }

  res.status(200).json({ received: true })
}
