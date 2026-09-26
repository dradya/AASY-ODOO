import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { OperationsView } from './components/OperationsView';
import { LedgerView } from './components/LedgerView';
import { LayoutDashboard, Package, ArrowLeftRight, History, LogOut, Loader2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'operations' | 'ledger'>('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div class="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!session) {
    return <AuthView onSuccess={() => setLoading(false)} />;
  }

  return (
    <div class="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside class="w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800">
        <div>
          <div class="p-6 border-b border-slate-800 flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">SS</div>
            <span class="text-xl font-bold tracking-tight text-white">StockSense</span>
          </div>
          <nav class="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard class="w-5 h-5" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package class="w-5 h-5" /> Products Catalog
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                activeTab === 'operations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ArrowLeftRight class="w-5 h-5" /> Operations
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                activeTab === 'ledger' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History class="w-5 h-5" /> Move Ledger
            </button>
          </nav>
        </div>
        <div class="p-4 border-t border-slate-800 flex items-center justify-between">
          <div class="truncate text-xs">
            <p class="text-slate-400">Signed in as</p>
            <p class="text-white font-medium truncate">{session.user.email}</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            class="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main class="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'operations' && <OperationsView />}
        {activeTab === 'ledger' && <LedgerView />}
      </main>
    </div>
  );
}