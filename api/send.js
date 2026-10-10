// Vercel serverless function. Secrets live in env vars only.
const hits = new Map()
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const clip = (s, n) => String(s ?? '').trim().slice(0, n)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Best-effort rate limit (per warm instance): 5 requests / 10 min / IP
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000)
  if (recent.length >= 5) return res.status(429).json({ error: 'Too many tries. Please wait a few minutes.' })
  hits.set(ip, [...recent, now])

  const b = req.body || {}
  if (b.website) return res.status(400).json({ error: 'Rejected.' }) // honeypot
  const date = clip(b.date, 10), time = clip(b.time, 12), place = clip(b.place, 80), nick = clip(b.nick, 30)
  const foods = Array.isArray(b.foods) ? b.foods.slice(0, 13).map((f) => clip(f, 90)).filter(Boolean) : []
  const pay = b.pay === 'skipped' ? 'Skipped payment' : b.pay === 'clicked-pay' ? 'Clicked "pay korbo" (not verified)' : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time || !place || !foods.length || !pay)
    return res.status(400).json({ error: 'Some plan details are missing or invalid.' })

  const { RESEND_API_KEY, TO_EMAIL, FROM_EMAIL } = process.env
  if (!RESEND_API_KEY || !TO_EMAIL || !FROM_EMAIL) return res.status(500).json({ error: 'Email is not configured on the server.' })

  const row = (k, v) => `<tr><td style="padding:6px 12px;font-weight:700">${k}</td><td style="padding:6px 12px">${esc(v)}</td></tr>`
  const html = `<div style="font-family:Arial,sans-serif;background:#ffe9f2;padding:20px;border-radius:16px"><h2>💗 New date plan!</h2><table>
    ${row('Date', date)}${row('Time', time)}${row('Location', place)}${row('Food', foods.join(', '))}${row('Payment', pay)}
    ${nick ? row('Nickname', nick) : ''}${row('Submitted', new Date().toISOString())}</table></div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: [TO_EMAIL], subject: `💗 Date plan: ${date} at ${time}`, html }),
    })
    if (!r.ok) {
      const errData = await r.json().catch(() => ({}))
      console.error('Resend error:', errData)
      return res.status(502).json({ error: errData.message || 'Email service rejected the request.' })
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Fetch error:', err)
    return res.status(502).json({ error: 'Could not reach the email service.' })
  }
}
