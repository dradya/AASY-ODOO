import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-key'
export const configured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(url, key)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Your session expired. Please log in again.')
  let response: Response
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}`, ...options.headers },
    })
  } catch { throw new Error('Cannot reach the StockSense API. Check that Flask is running.') }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `Request failed (${response.status})`)
  }
  return (response.status === 204 ? null : await response.json()) as T
}
export function query(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) if (val !== undefined && val !== '') q.set(key, String(val))
  return `?${q}`
}
export function label(id: unknown, rows: Record<string, unknown>[], field = 'name') {
  return rows.find(row => row.id === id)?.[field]?.toString() || '—'
}
export function watchTables(tables: string[], refresh: () => void) {
  const channel = supabase.channel(`stocksense-${Math.random().toString(36).slice(2)}`)
  for (const table of tables) channel.on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
  channel.subscribe()
  return () => { void supabase.removeChannel(channel) }
}
