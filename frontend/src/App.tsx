import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { api, supabase } from './services'
import type { Profile } from './types'
import Layout from './components/layout/Layout'
import Auth from './pages/Auth'
import DashboardPage from './pages/Dashboard'
import ResourcePage from './pages/Resources'
import StockPage from './pages/Stock'
import { OperationDetail, OperationList, OperationNew } from './pages/Operations'

export type Context = { profile: Profile; refreshProfile: () => void }
export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileError, setProfileError] = useState('')
  const location = useLocation()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, current) => setSession(current))
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session) { setProfile(null); return }
    api<Profile>('/me').then(setProfile).catch(e => setProfileError(e.message))
  }, [session?.access_token])
  const refreshProfile = () => api<Profile>('/me').then(setProfile).catch(e => setProfileError(e.message))
  if (session === undefined) return <div className="boot">Loading StockSense…</div>
  const publicRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)
  if (publicRoute) return session && location.pathname !== '/reset-password' ? <Navigate to="/dashboard" replace /> : <Auth />
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <div className="boot">{profileError ? <div>{profileError}<br/><button onClick={refreshProfile}>Try again</button></div> : 'Opening your workspace…'}</div>
  return <Layout profile={profile}>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/stock" element={<StockPage />} />
      <Route path="/products" element={<ResourcePage kind="products" profile={profile} />} />
      <Route path="/warehouses" element={<ResourcePage kind="warehouses" profile={profile} />} />
      <Route path="/locations" element={<ResourcePage kind="locations" profile={profile} />} />
      <Route path="/settings" element={<ResourcePage kind="settings" profile={profile} />} />
      {(['receipts', 'deliveries', 'transfers'] as const).map(kind => [
        <Route key={`${kind}-list`} path={`/${kind}`} element={<OperationList kind={kind} />} />,
        <Route key={`${kind}-new`} path={`/${kind}/new`} element={<OperationNew kind={kind} />} />,
        <Route key={`${kind}-detail`} path={`/${kind}/:id`} element={<OperationDetail kind={kind} />} />,
      ])}
      <Route path="/adjustments" element={<ResourcePage kind="adjustments" profile={profile} />} />
      <Route path="/moves" element={<ResourcePage kind="moves" profile={profile} />} />
      <Route path="*" element={<div className="page"><h1>Page not found</h1><p>That route does not exist.</p></div>} />
    </Routes>
  </Layout>
}
