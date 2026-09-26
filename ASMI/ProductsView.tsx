import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Package } from 'lucide-react';

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export const jsx: any;
  export const jsxs: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

export function ProductsView() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [uom, setUom] = useState('Units');
  const [alertQty, setAlertQty] = useState(5);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([
      { name, sku, category, uom, min_stock_alert: alertQty }
    ]);

    if (!error) {
      setName('');
      setSku('');
      setCategory('');
      fetchProducts();
    } else {
      alert(error.message);
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Plus class="w-5 h-5 text-indigo-600" /> New Product
        </h2>
        <form onSubmit={handleCreate} class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Steel Rods 12mm"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">SKU / Code</label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSku(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="STL-12MM-001"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Raw Materials"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">UoM</label>
              <input
                type="text"
                required
                value={uom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUom(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="kg / pcs"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Alert Qty</label>
              <input
                type="number"
                value={alertQty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlertQty(parseFloat(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition"
          >
            Save Product
          </button>
        </form>
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Package class="w-5 h-5 text-indigo-600" /> Catalog
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                <th class="p-3">SKU</th>
                <th class="p-3">Name</th>
                <th class="p-3">Category</th>
                <th class="p-3">UoM</th>
                <th class="p-3">Min Alert</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {products.map((p: any) => (
                <tr key={p.id} class="hover:bg-slate-50">
                  <td class="p-3 font-mono text-xs font-semibold text-indigo-600">{p.sku}</td>
                  <td class="p-3 font-medium text-slate-900">{p.name}</td>
                  <td class="p-3 text-slate-600">{p.category}</td>
                  <td class="p-3 text-slate-600">{p.uom}</td>
                  <td class="p-3 text-slate-600">{p.min_stock_alert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}