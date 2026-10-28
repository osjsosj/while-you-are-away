import Stripe from 'stripe'

/**
 * Stripe 웹훅 — 결제 완료 기록용
 *
 * 로그인 링크 이메일은 결제 직후 /auth/callback 화면에서 Supabase가 보낸다
 * (Supabase Auth → SMTP 설정에 Resend 연결). 여기서는 서명 검증 + 로그만 남긴다.
 * 예전 코드의 supabaseAdmin.auth.admin.sendRawEmail()은 존재하지 않는 함수라 제거.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawBody = await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    console.log('Payment completed:', session.id, session.amount_total, session.currency)
  }

  res.status(200).json({ received: true })
}
