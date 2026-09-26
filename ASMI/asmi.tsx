import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { History } from 'lucide-react';

export function LedgerView() {
  const [ledger, setLedger] = useState<any[]>([]);

  const fetchLedger = async () => {
    const { data } = await supabase
      .from('stock_moves')
      .select('*, products(name), src:src_location_id(name), dest:dest_location_id(name)')
      .order('created_at', { ascending: false });

    if (data) setLedger(data);
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center gap-2">
        <History class="w-6 h-6 text-indigo-600" />
        <h1 class="text-xl font-bold text-slate-900">Double-Entry Move Ledger History</h1>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
              <th class="p-3">Timestamp</th>
              <th class="p-3">Type</th>
              <th class="p-3">Product</th>
              <th class="p-3">Source Location</th>
              <th class="p-3">Dest Location</th>
              <th class="p-3">Qty</th>
              <th class="p-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {ledger.map((entry) => (
              <tr key={entry.id} class="hover:bg-slate-50">
                <td class="p-3 text-xs font-mono text-slate-500">
                  {new Date(entry.created_at).toLocaleString()}
                </td>
                <td class="p-3 font-semibold text-slate-900">{entry.move_type}</td>
                <td class="p-3 text-slate-800 font-medium">{entry.products?.name}</td>
                <td class="p-3 text-slate-600">{entry.src?.name || 'N/A'}</td>
                <td class="p-3 text-slate-600">{entry.dest?.name || 'N/A'}</td>
                <td class="p-3 font-bold text-indigo-600">{entry.quantity}</td>
                <td class="p-3">
                  <span
                    class={`px-2 py-1 rounded text-xs font-bold ${
                      entry.status === 'Done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}