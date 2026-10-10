import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { PLACES, FOODS, TIMES, TEASES, STEPS, PAY_NUMBER } from './data.js'

const EMPTY = { date: '', time: '', place: '', foods: [], other: '', pay: '', nick: '' }
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10) }
const prettyDate = (d) => d ? new Date(d + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''
const to12 = (t) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }

function Floaties({ n = 14, items = ['💗', '💕', '🌸', '✨'], cls = 'float' }) {
  const list = useMemo(() => Array.from({ length: n }, (_, i) => ({
    e: items[i % items.length], left: Math.random() * 100, size: 14 + Math.random() * 20,
    dur: 8 + Math.random() * 8, delay: -Math.random() * 12,
  })), [n])
  return <div className={cls} aria-hidden="true">{list.map((p, i) => (
    <span key={i} style={{ left: p.left + '%', fontSize: p.size, animationDuration: p.dur + 's', animationDelay: p.delay + 's' }}>{p.e}</span>
  ))}</div>
}

function NoButton() {
  const [pos, setPos] = useState(null)
  const [tries, setTries] = useState(0)
  const ref = useRef(null)
  const flee = useCallback(() => {
    const el = ref.current; if (!el) return
    const { width: w, height: h } = el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 12
    const yes = document.getElementById('yes')?.getBoundingClientRect()
    let x, y, t = 0
    do {
      x = m + Math.random() * Math.max(0, vw - w - 2 * m)
      y = m + Math.random() * Math.max(0, vh - h - 2 * m)
      t++
    } while (t < 30 && yes && x < yes.right + 16 && x + w > yes.left - 16 && y < yes.bottom + 16 && y + h > yes.top - 16)
    setPos({ x, y }); setTries((n) => n + 1)
  }, [])
  useEffect(() => {
    const move = (e) => {
      if (e.pointerType !== 'mouse' || !ref.current) return
      const r = ref.current.getBoundingClientRect()
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
      if (d < Math.max(r.width, r.height) * 0.9 + 30) flee()
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [flee])
  const btn = (
    <button ref={ref} className={'btn no' + (pos ? ' moved' : '')} style={pos ? { left: pos.x, top: pos.y } : undefined}
      onPointerDown={(e) => { e.preventDefault(); flee() }} onClick={(e) => { e.preventDefault(); flee() }}>NO 🙄</button>
  )
  return (
    <>
      <span className="slot"><span className="btn ghost" aria-hidden="true">NO 🙄</span>{pos ? null : btn}</span>
      {pos && createPortal(btn, document.body)}
      <p className="tease" aria-live="polite">{tries >= 2 ? TEASES[(tries - 2) % TEASES.length] : '\u00a0'}</p>
    </>
  )
}

function Tile({ slug, emoji, name }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="thumb">
      <span className="emo">{emoji}</span>
      {ok && <img src={`/img/${slug}.webp`} alt={name} loading="lazy" decoding="async" width="320" height="200" onError={() => setOk(false)} />}
    </div>
  )
}

function Calendar({ value, onPick }) {
  const t = today()
  const [ym, setYm] = useState(() => { const d = value ? new Date(value + 'T00:00') : new Date(); return [d.getFullYear(), d.getMonth()] })
  const [y, m] = ym
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate()
  const iso = (d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const shift = (n) => { const d = new Date(y, m + n, 1); setYm([d.getFullYear(), d.getMonth()]) }
  const atMin = y * 12 + m <= Number(t.slice(0, 4)) * 12 + Number(t.slice(5, 7)) - 1
  return (
    <div className="cal">
      <div className="calhead">
        <button className="calnav" onClick={() => shift(-1)} disabled={atMin} aria-label="Previous month">‹</button>
        <b>{new Date(y, m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} 🌸</b>
        <button className="calnav" onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>
      <div className="calgrid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d} className="dow">{d}</span>)}
        {cells.map((d, i) => d === null ? <span key={i} /> : (
          <button key={i} className={'day' + (iso(d) === value ? ' sel' : '') + (iso(d) === t ? ' now' : '')}
            disabled={iso(d) < t} aria-pressed={iso(d) === value} aria-label={prettyDate(iso(d))} onClick={() => onPick(iso(d))}>{d}</button>
        ))}
      </div>
    </div>
  )
}

function Nav({ back, next, nextLabel = 'Continue 💗', disabled, err }) {
  return (
    <div className="nav">
      {err && <p className="err" role="alert">{err}</p>}
      <div className="row">
        {back && <button className="btn ghosty" onClick={back}>Back</button>}
        <button className="btn yes" onClick={next} disabled={disabled}>{nextLabel}</button>
      </div>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(0)
  const [plan, setPlan] = useState(EMPTY)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)
  const [payMsg, setPayMsg] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | ok | fail
  const [failMsg, setFailMsg] = useState('')
  const [showPlan, setShowPlan] = useState(true)
  const set = (patch) => { setPlan((p) => ({ ...p, ...patch })); setErr('') }
  const go = (n) => { setErr(''); setStep(n); window.scrollTo(0, 0) }
  const need = (ok, msg, n) => ok ? go(n) : setErr(msg)
  const food = plan.foods.map((f) => f === 'other' ? (plan.other.trim() ? `Something else: ${plan.other.trim()}` : 'Something else') : FOODS.find((x) => x.slug === f).name)
  const place = PLACES.find((p) => p.slug === plan.place)?.name || ''
  const toggleFood = (s) => set({ foods: plan.foods.includes(s) ? plan.foods.filter((x) => x !== s) : [...plan.foods, s] })

  const copy = async () => {
    try { await navigator.clipboard.writeText(PAY_NUMBER) } catch {
      const t = document.createElement('textarea'); t.value = PAY_NUMBER; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove()
    }
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }

  const send = async () => {
    setStatus('sending'); setFailMsg('')
    try {
      const r = await fetch('/api/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: plan.date, time: plan.time, place, foods: food, pay: plan.pay, nick: plan.nick, website: '', submittedAt: new Date().toISOString() }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j.ok) setStatus('ok'); else { setStatus('fail'); setFailMsg(j.error || 'Could not send. Please try again.') }
    } catch { setStatus('fail'); setFailMsg('Network problem. Your plan is saved here, so try again.') }
  }

  const restart = () => { setPlan(EMPTY); setStatus('idle'); setPayMsg(''); go(0) }

  return (
    <div className="app">
      <Floaties />
      <header className="progress" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
        {STEPS.map((s, i) => <span key={s} className={'dot' + (i <= step ? ' on' : '')} title={s} />)}
      </header>
      <main className="card" key={step}>
        {step === 0 && (
          <section className="center">
            <div className="hero" aria-hidden="true">🧸💗</div>
            <h1>Hey, cutie! 💗 Would you like to go on a date with me?</h1>
            <div className="row big">
              <button id="yes" className="btn yes grow" onClick={() => go(1)}>YES! 🥹💕</button>
              <NoButton />
            </div>
          </section>
        )}
        {step === 1 && (
          <section>
            <h2>Yayyy! 🥹💕 When are we going on our date?</h2>
            <Calendar value={plan.date} onPick={(d) => set({ date: d })} />
            {plan.date && <p className="sub">Picked: <b>{prettyDate(plan.date)}</b> 💗</p>}
            <Nav back={() => go(0)} next={() => need(plan.date && plan.date >= today(), 'Pick a date from today onwards, cutie 🌸', 2)} err={err} />
          </section>
        )}
        {step === 2 && (
          <section>
            <h2>What time should I pick you up, princess? 🌸</h2>
            <p className="sub">📅 {prettyDate(plan.date)}</p>
            <div className="chips" role="radiogroup" aria-label="Time">
              {TIMES.map((t) => <button key={t} role="radio" aria-checked={plan.time === t} className={'chip' + (plan.time === t ? ' sel' : '')} onClick={() => set({ time: t })}>{t}</button>)}
            </div>
            <label className="field">Or choose your own time ⏰
              <input type="time" onChange={(e) => e.target.value && set({ time: to12(e.target.value) })} />
            </label>
            {plan.time && <p className="sub">Picked: <b>{plan.time}</b> 💗</p>}
            <Nav back={() => go(1)} next={() => need(plan.time, 'Choose a time first 🌸', 3)} err={err} />
          </section>
        )}
        {step === 3 && (
          <section>
            <h2>Where should we make some cute memories together? 🥰</h2>
            <div className="grid">
              {PLACES.map((p) => (
                <button key={p.slug} aria-pressed={plan.place === p.slug} className={'pick' + (plan.place === p.slug ? ' sel' : '')} onClick={() => set({ place: p.slug })}>
                  <Tile {...p} /><b>{p.name}</b><small>{p.desc}</small>{plan.place === p.slug && <i className="heart">💗</i>}
                </button>
              ))}
            </div>
            <Nav back={() => go(2)} next={() => need(plan.place, 'Pick one place 📍', 4)} err={err} />
          </section>
        )}
        {step === 4 && (
          <section>
            <h2>Now the most important question... What are we eating? 🤤💕</h2>
            <p className="sub">Pick as many as you like.</p>
            <div className="grid food">
              {FOODS.map((f) => (
                <button key={f.slug} aria-pressed={plan.foods.includes(f.slug)} className={'pick' + (plan.foods.includes(f.slug) ? ' sel' : '')} onClick={() => toggleFood(f.slug)}>
                  <Tile {...f} /><b>{f.emoji} {f.name}</b>{plan.foods.includes(f.slug) && <i className="heart">💗</i>}
                </button>
              ))}
            </div>
            {plan.foods.includes('other') && <label className="field">What are you craving? ✨
              <input type="text" maxLength={60} value={plan.other} onChange={(e) => set({ other: e.target.value })} placeholder="e.g. kacchi, cheesecake…" />
            </label>}
            {plan.foods.length > 0 && <p className="sub">Good choice! But you're still paying half. 😂</p>}
            <Nav back={() => go(3)} next={() => need(plan.foods.length, 'Choose at least one yummy thing 🍕', 5)} err={err} />
          </section>
        )}
        {step === 5 && (
          <section className="center">
            <h2 className="shake">WAIT A MINUTE! 🚨💕</h2>
            <h3>You have to pay for the date first! 😂💸</h3>
            <p className="sub">Love is priceless, but biriyani, coffee, and transportation aren't! So let's see how much you love me. 🤭💗</p>
            <div className="paybox">
              <div className="num">{PAY_NUMBER}</div>
              <div className="chips small">{['bKash', 'Nagad', 'Upay', 'Rocket'].map((m) => <span className="chip static" key={m}>{m}</span>)}</div>
              <button className="btn ghosty" onClick={copy}>{copied ? 'Copied! ✅' : 'Copy Number 📋'}</button>
              <small>Totally optional. Never share a PIN or OTP with anyone.</small>
            </div>
            {payMsg && <p className="sub" role="status"><b>{payMsg}</b></p>}
            <button className="btn yes big" onClick={() => { setPayMsg('Okay baba, pay korbo! Ekhon eto rag keno? 😂😭💗'); set({ pay: 'clicked-pay' }); setTimeout(() => go(6), 1400) }}>MAIR DIBO, TUMI PAY KORBA 🤬</button>
            <button className="link" onClick={() => { set({ pay: 'skipped' }); go(6) }}>Skip Payment, I'm Too Cute 😌💕</button>
            <div className="row"><button className="btn ghosty" onClick={() => go(4)}>Back</button></div>
          </section>
        )}
        {step === 6 && (
          <section className="center">
            <Floaties n={26} items={['🎉', '💗', '🥹', '🌷', '🧸', '✨', '💐']} cls="confetti" />
            <h1>IT'S A DATE!!! 🥹💖🎉</h1>
            <p className="sub">Our date is officially planned! I can't wait to spend some lovely time with you. 🌸💗</p>
            <button className="link" onClick={() => setShowPlan((s) => !s)}>{showPlan ? 'Hide' : 'View'} the date plan 💌</button>
            {showPlan && (
              <dl className="summary">
                <dt>Date</dt><dd>{prettyDate(plan.date)}</dd>
                <dt>Time</dt><dd>{plan.time}</dd>
                <dt>Location</dt><dd>{place}</dd>
                <dt>Food</dt><dd>{food.join(', ')}</dd>
                <dt>Payment</dt><dd>{plan.pay === 'skipped' ? 'Skipped' : 'Clicked "pay korbo" (not verified)'}</dd>
              </dl>
            )}
            {status !== 'ok' ? (
              <>
                <label className="field">Nickname (optional) 🧸
                  <input type="text" maxLength={30} value={plan.nick} onChange={(e) => set({ nick: e.target.value })} placeholder="What should I call you?" />
                </label>
                <button className="btn yes big" disabled={status === 'sending'} onClick={send}>
                  {status === 'sending' ? 'Sending… 💌' : status === 'fail' ? 'Try again 💌' : 'Confirm & send my plan 💌'}
                </button>
                {status === 'fail' && <p className="err" role="alert">{failMsg}</p>}
              </>
            ) : <p className="ok" role="status">Plan delivered! 💌 See you soon 💗</p>}
            <div className="row"><button className="btn ghosty" onClick={() => go(5)} disabled={status === 'sending'}>Back</button><button className="btn ghosty" onClick={restart}>Start over 🔁</button></div>
          </section>
        )}
      </main>
      <footer className="foot">A tiny date plan from Dhaka, with a lot of 💗 by <a href="https://mazharul.bro.bd" target="_blank" rel="noopener noreferrer">Rafi</a></footer>
    </div>
  )
}
