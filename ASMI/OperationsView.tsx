import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export function OperationsView() {
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [moves, setMoves] = useState<any[]>([]);

  const [moveType, setMoveType] = useState('Receipt');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [srcLocation, setSrcLocation] = useState('');
  const [destLocation, setDestLocation] = useState('');
  const [quantity, setQuantity] = useState(1);

  const fetchData = async () => {
    const { data: prods } = await supabase.from('products').select('*');
    const { data: locs } = await supabase.from('locations').select('*');
    const { data: mvs } = await supabase
      .from('stock_moves')
      .select('*, products(name), src:src_location_id(name), dest:dest_location_id(name)')
      .order('created_at', { ascending: false });

    if (prods) setProducts(prods);
    if (locs) setLocations(locs);
    if (mvs) setMoves(mvs);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMove = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('stock_moves').insert([
      {
        move_type: moveType,
        product_id: selectedProduct,
        src_location_id: srcLocation,
        dest_location_id: destLocation,
        quantity,
        status: 'Draft',
      },
    ]);

    if (!error) {
      setQuantity(1);
      fetchData();
    } else {
      alert(error.message);
    }
  };

  const handleValidateMove = async (moveId: string) => {
    const { error } = await supabase
      .from('stock_moves')
      .update({ status: 'Done' })
      .eq('id', moveId);

    if (!error) {
      fetchData();
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ArrowLeftRight class="w-5 h-5 text-indigo-600" /> New Movement
        </h2>
        <form onSubmit={handleCreateMove} class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Type</label>
            <select
              value={moveType}
              onChange={(e) => setMoveType(e.target.value)}
              class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Receipt">Receipt (Incoming)</option>
              <option value="Delivery">Delivery Order (Outgoing)</option>
              <option value="Internal Transfer">Internal Transfer</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
              class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Source</label>
              <select
                value={srcLocation}
                onChange={(e) => setSrcLocation(e.target.value)}
                required
                class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Source...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Destination</label>
              <select
                value={destLocation}
                onChange={(e) => setDestLocation(e.target.value)}
                required
                class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Destination...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition"
          >
            Schedule Move
          </button>
        </form>
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900 mb-4">Pending Stock Operations</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                <th class="p-3">Type</th>
                <th class="p-3">Product</th>
                <th class="p-3">Qty</th>
                <th class="p-3">Status</th>
                <th class="p-3">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {moves.map((m) => (
                <tr key={m.id} class="hover:bg-slate-50">
                  <td class="p-3 font-semibold text-slate-900">{m.move_type}</td>
                  <td class="p-3 text-slate-700">{m.products?.name}</td>
                  <td class="p-3 font-bold text-slate-900">{m.quantity}</td>
                  <td class="p-3">
                    <span
                      class={`px-2 py-1 rounded text-xs font-bold ${
                        m.status === 'Done'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td class="p-3">
                    {m.status === 'Draft' && (
                      <button
                        onClick={() => handleValidateMove(m.id)}
                        class="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition"
                      >
                        <CheckCircle2 class="w-3.5 h-3.5" /> Validate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}