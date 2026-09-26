import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, PackageCheck } from 'lucide-react';

export function AuthView({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="h-screen w-screen bg-slate-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden p-8">
        <div class="flex items-center gap-3 justify-center mb-6">
          <div class="p-3 bg-indigo-600 rounded-xl text-white">
            <PackageCheck class="w-8 h-8" />
          </div>
          <h1 class="text-2xl font-bold text-slate-900">StockSense</h1>
        </div>

        <h2 class="text-lg font-semibold text-center text-slate-600 mb-6">
          {isSignUp ? 'Create an Account' : 'Sign in to Dashboard'}
        </h2>

        {error && (
          <div class="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
            <div class="relative">
              <Mail class="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="manager@stocksense.com"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Password</label>
            <div class="relative">
              <Lock class="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading && <Loader2 class="w-4 h-4 animate-spin" />}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            class="text-sm text-indigo-600 hover:underline font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}