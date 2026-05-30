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

// Vercel에서 raw body 받으려면 bodyParser 끄기
export const config = {
  api: { bodyParser: false },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Raw body를 Buffer로 직접 읽기
  const rawBody = await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

  const sig = req.headers['stripe-signature']

  let event
  try {
    // rawBody를 Buffer 그대로 전달 — 문자열 변환 금지
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const email = session.customer_details?.email || session.metadata?.email

    console.log('Payment completed for:', email)

    if (email) {
      try {
        // 유저 존재 확인
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const exists = users?.find((u) => u.email === email)

        if (!exists) {
          await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
          })
          console.log('Created user:', email)
        }

        // 매직링크 생성
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: {
            redirectTo: `${process.env.SITE_URL}/auth/callback?payment=success`,
          },
        })

        if (linkError) {
          console.error('Magic link error:', linkError)
          return res.status(200).json({ received: true })
        }

        const magicLink = linkData?.properties?.action_link
        console.log('Magic link generated:', !!magicLink)

        // 이메일 발송
        const { error: emailError } = await supabaseAdmin.auth.admin.sendRawEmail({
          to: email,
          subject: "Your letter box is ready — here's your link",
          html: buildEmail(magicLink, session.metadata),
        })

        if (emailError) {
          console.error('Email send error:', emailError)
        } else {
          console.log('Email sent to:', email)
        }
      } catch (err) {
        console.error('Post-payment error:', err)
      }
    }
  }

  res.status(200).json({ received: true })
}

function buildEmail(magicLink, metadata) {
  const fromName = metadata?.fromName || 'Someone special'
  const toName = metadata?.toName || 'someone you love'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FBF4E8;font-family:Georgia,serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;width:48px;height:48px;background:#C8706E;border-radius:50%;align-items:center;justify-content:center;font-size:20px;color:white;font-style:italic;">W</div>
    </div>
    <h1 style="font-style:italic;font-size:26px;color:#1A1008;text-align:center;letter-spacing:-0.02em;margin-bottom:8px;">
      Your letter box is ready
    </h1>
    <p style="text-align:center;color:#9B8070;font-size:14px;margin-bottom:32px;line-height:1.6;font-family:Arial,sans-serif;font-weight:300;">
      From ${fromName}, for ${toName}
    </p>
    <div style="background:#FFFDF9;border:1px solid #E8D5B5;border-radius:16px;padding:28px;margin-bottom:24px;">
      <p style="color:#2D1F14;font-size:14px;line-height:1.8;margin-bottom:20px;font-family:Arial,sans-serif;font-weight:300;">
        Payment confirmed. Click below to continue building your letter box — your progress saves automatically across all devices.
      </p>
      <div style="text-align:center;">
        <a href="${magicLink}" style="display:inline-block;background:#C8706E;color:white;padding:14px 32px;border-radius:14px;text-decoration:none;font-size:14px;font-weight:500;font-family:Arial,sans-serif;">
          Continue building →
        </a>
      </div>
    </div>
    <div style="background:#F5E8D0;border-radius:12px;padding:16px 20px;">
      <p style="color:#6B5040;font-size:12px;line-height:1.7;margin:0;font-family:Arial,sans-serif;font-weight:300;">
        <strong style="font-weight:500;">This link signs you in automatically.</strong>
        Save this email to return from any device. Link expires in 24 hours.
      </p>
    </div>
    <p style="text-align:center;color:#9B8070;font-size:11px;margin-top:24px;font-family:Arial,sans-serif;">
      While You're Away · One-time purchase · No subscription
    </p>
  </div>
</body>
</html>`
}
