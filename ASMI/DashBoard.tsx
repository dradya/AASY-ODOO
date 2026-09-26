// TypeScript cannot resolve the project's React JSX typings in this file.
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, AlertTriangle, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: 'products' | 'operations' | 'ledger') => void;
}

export function DashboardView({ onNavigate }: DashboardProps) {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    lowStock: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    scheduledTransfers: 0,
  });

  const fetchMetrics = async () => {
    const { data: products } = await supabase.from('products').select('*');
    const { data: moves } = await supabase.from('stock_moves').select('*').eq('status', 'Draft');

    const totalProducts = products?.length || 0;
    const pendingReceipts = moves?.filter((m) => m.move_type === 'Receipt').length || 0;
    const pendingDeliveries = moves?.filter((m) => m.move_type === 'Delivery').length || 0;
    const scheduledTransfers = moves?.filter((m) => m.move_type === 'Internal Transfer').length || 0;

    setMetrics({
      totalProducts,
      lowStock: 0, // Computed dynamic trigger
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
    });
  };

  useEffect(() => {
    fetchMetrics();

    // Subscribe to realtime changes on stock operations
    const subscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_moves' }, () => fetchMetrics())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Inventory Dashboard</h1>
        <p class="text-slate-500 text-sm">Real-time snapshot of warehouse operations.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-xs font-semibold uppercase">Total Products</span>
            <Package class="w-5 h-5 text-indigo-600" />
          </div>
          <div class="text-3xl font-bold text-slate-900">{metrics.totalProducts}</div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-xs font-semibold uppercase">Low Stock Alerts</span>
            <AlertTriangle class="w-5 h-5 text-red-500" />
          </div>
          <div class="text-3xl font-bold text-red-600">{metrics.lowStock}</div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-xs font-semibold uppercase">Pending Receipts</span>
            <ArrowDownRight class="w-5 h-5 text-emerald-600" />
          </div>
          <div class="text-3xl font-bold text-emerald-600">{metrics.pendingReceipts}</div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-xs font-semibold uppercase">Pending Deliveries</span>
            <ArrowUpRight class="w-5 h-5 text-amber-600" />
          </div>
          <div class="text-3xl font-bold text-amber-600">{metrics.pendingDeliveries}</div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-xs font-semibold uppercase">Internal Moves</span>
            <ArrowLeftRight class="w-5 h-5 text-blue-600" />
          </div>
          <div class="text-3xl font-bold text-blue-600">{metrics.scheduledTransfers}</div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div class="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate('operations')}
            class="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Create Receipt / Delivery
          </button>
          <button
            onClick={() => onNavigate('products')}
            class="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
          >
            Add New Product
          </button>
          <button
            onClick={() => onNavigate('ledger')}
            class="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
          >
            Audit Stock Ledger
          </button>
        </div>
      </div>
    </div>
  );
}