import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Boxes, Check, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { z } from 'zod'
import { configured, supabase } from '../services'
import { Button, Input } from '../components/ui'

const emailSchema = z.email('Enter a valid email address')
export default function Auth() {
  const path = useLocation().pathname
  const navigate = useNavigate()
  const mode = path === '/signup' ? 'signup' : path === '/forgot-password' ? 'forgot' : path === '/reset-password' ? 'reset' : 'login'
  const [fullName, setFullName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState('')
  const [error, setError] = useState(''), [message, setMessage] = useState(''), [loading, setLoading] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setMessage('')
    try {
      if (!configured) throw new Error('Add your Supabase URL and anon key to frontend/.env first.')
      if (mode !== 'reset') emailSchema.parse(email)
      if (mode === 'signup' || mode === 'reset') {
        if (password.length < 8) throw new Error('Password needs at least 8 characters.')
        if (password !== confirm) throw new Error('Passwords do not match.')
      }
      if (mode === 'signup' && !fullName.trim()) throw new Error('Enter your full name.')
      setLoading(true)
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard')
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } })
        if (error) throw error
        setMessage(data.session ? 'Account created. Opening dashboard…' : 'Check your email to confirm your account, then log in.')
        if (data.session) navigate('/dashboard')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
        if (error) throw error
        setMessage('If this email has an account, you will receive a reset link.')
      } else {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setMessage('Password updated. You can continue to your dashboard.')
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong') }
    finally { setLoading(false) }
  }
  return <div className="auth-layout"><div className="auth-hero"><div className="auth-logo"><Boxes size={26}/> StockSense</div><div className="auth-hero-copy"><span className="eyebrow light">INVENTORY, IN FOCUS</span><h1>Know what you have.<br/>Move with confidence.</h1><p>One clear workspace for products, warehouses and every movement between them.</p><div className="auth-features"><span><Check size={17}/> Real-time stock visibility</span><span><Check size={17}/> Traceable operations</span><span><Check size={17}/> Built for your team</span></div></div><div className="auth-hero-foot">STOCKSENSE / OPERATIONS PLATFORM</div></div><div className="auth-form-wrap"><div className="auth-form"><div className="auth-mobile-brand"><Boxes size={22}/> StockSense</div><div className="auth-symbol">{mode === 'forgot' || mode === 'reset' ? <Mail size={22}/> : <LockKeyhole size={22}/>}</div><span className="eyebrow">YOUR WORKSPACE</span><h2>{mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Choose a new password' : 'Welcome back'}</h2><p className="muted">{mode === 'signup' ? 'Set up your StockSense workspace in a minute.' : mode === 'forgot' ? 'We’ll send a reset link to your email.' : mode === 'reset' ? 'Enter a password you haven’t used before.' : 'Sign in to manage your inventory.'}</p><form onSubmit={submit} className="auth-fields">{mode === 'signup' && <label>Full name<Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" autoComplete="name" required/></label>}{mode !== 'reset' && <label>Email address<Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required/></label>}{mode !== 'forgot' && <label>Password<Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required/></label>}{(mode === 'signup' || mode === 'reset') && <label>Confirm password<Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required/></label>}{mode === 'login' && <div className="auth-options"><label><input type="checkbox" defaultChecked/> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div>}{error && <div className="alert error" role="alert">{error}</div>}{message && <div className="alert success" role="status">{message}</div>}<Button disabled={loading} className="auth-submit">{loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : mode === 'reset' ? 'Update password' : 'Sign in'} <ArrowRight size={18}/></Button></form><div className="auth-switch">{mode === 'login' ? <>New here? <Link to="/signup">Create an account</Link></> : <>Already have an account? <Link to="/login">Sign in</Link></>}</div><div className="auth-secure"><ShieldCheck size={16}/> Secure access powered by Supabase</div></div></div></div>
}
