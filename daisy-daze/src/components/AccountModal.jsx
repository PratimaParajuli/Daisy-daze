// Customer sign-in/register dialog and account order tracking.
import { useEffect, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { api } from '../lib/api.js'

export default function AccountModal({ onClose, onLogin, onRegister, user, onLogout }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user?.token) api('/orders/mine', { token: user.token }).then(setOrders).catch(() => setOrders([]))
  }, [user?.token])

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await (mode === 'login' ? onLogin(form) : onRegister(form))
      onClose()
    } catch (authError) {
      setError(authError.message)
    } finally {
      setBusy(false)
    }
  }

  return <div className="overlay modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="account-modal" aria-label="Your account"><button className="icon-button modal-close" aria-label="Close" onClick={onClose}><X size={20} /></button>{user ? <div className="account-signed-in"><span className="success-flower">✿</span><p className="eyebrow">YOUR DAISY DAZE ACCOUNT</p><h2>Hello, {user.name}.</h2><p>{user.email}</p><div className="customer-orders"><h3>Your orders</h3>{orders.length ? orders.map((order) => <article key={order._id}><div><span>ORDER · {order._id.slice(-7).toUpperCase()}</span><p>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p></div><strong>{order.status.replaceAll('-', ' ')}</strong></article>) : <p className="no-orders">Your lovely orders will find their way here.</p>}</div><button className="button button-outline" onClick={onLogout}>Sign out</button></div> : <><span className="modal-flower">✿</span><p className="eyebrow">A LITTLE HELLO</p><h2>{mode === 'login' ? 'Lovely to see you.' : 'Come on in.'}</h2><p className="modal-intro">{mode === 'login' ? 'Sign in to keep your little loves close.' : 'Make an account and keep track of all your lovely things.'}</p><div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button></div><form className="auth-form" onSubmit={submit}>{mode === 'register' && <label>Your name<input required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>}<label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Password<input required minLength="8" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark checkout-button" disabled={busy}>{busy ? 'One little moment...' : mode === 'login' ? 'Sign in' : 'Create my account'} <ArrowRight size={17} /></button></form></>}</section></div>
}