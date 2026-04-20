import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import type { AsoebeProduct, AsoebeCategory } from '../../lib/types';

interface ProductForm {
  name: string; category_id: string; description: string;
  price_per_yard: string; image_url: string; active: boolean;
}

const emptyForm: ProductForm = { name: '', category_id: '', description: '', price_per_yard: '', image_url: '', active: true };

export default function AdminProducts() {
  const [products, setProducts] = useState<AsoebeProduct[]>([]);
  const [categories, setCategories] = useState<AsoebeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('asoebe_products').select('*, category:asoebe_categories(*)').order('created_at', { ascending: false }),
      supabase.from('asoebe_categories').select('*').eq('active', true).order('display_order'),
    ]);
    setProducts((prods as AsoebeProduct[]) ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (k: keyof ProductForm, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const openEdit = (p: AsoebeProduct) => {
    setForm({ name: p.name, category_id: p.category_id ?? '', description: p.description ?? '', price_per_yard: String(p.price_per_yard), image_url: p.image_url ?? '', active: p.active });
    setEditing(p.id);
    setShowForm(true);
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, category_id: form.category_id || undefined, description: form.description, price_per_yard: parseFloat(form.price_per_yard), image_url: form.image_url || undefined, active: form.active };
    if (editing) {
      await supabase.from('asoebe_products').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing);
    } else {
      await supabase.from('asoebe_products').insert(payload);
    }
    await load();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('asoebe_products').update({ active: false }).eq('id', id);
    await load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">Products</h1>
          <p className="text-sm text-gray-500 font-sans">{products.length} Asoebi products</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-dark-900 text-white px-4 py-2.5 text-sm font-sans rounded-lg hover:bg-dark-800 transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-sans font-semibold text-lg text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className="input-field">
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input-field resize-none" />
              </div>
              <div>
                <label className="label">Price per Yard (₦)</label>
                <input type="number" value={form.price_per_yard} onChange={e => set('price_per_yard', e.target.value)} required min="0" className="input-field" />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input type="url" value={form.image_url} onChange={e => set('image_url', e.target.value)} className="input-field" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-gold-600" />
                <span className="font-sans text-sm text-gray-700">Active (visible in store)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-3">
                  {saving ? 'Saving...' : <><Check size={15} /> Save</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary py-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 font-sans text-sm">Loading products...</div>
        : products.length === 0 ? <div className="p-12 text-center text-gray-400 font-sans text-sm">No products yet.</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Image', 'Name', 'Category', 'Price/Yard', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <img src={p.image_url ?? ''} alt={p.name} className="w-10 h-10 object-cover rounded" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3.5 text-gray-500">{(p as AsoebeProduct & { category?: AsoebeCategory }).category?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 font-mono text-gray-700">{formatCurrency(p.price_per_yard)}</td>
                    <td className="px-4 py-3.5">
                      <span className={p.active ? 'badge-approved rounded-full' : 'badge-rejected rounded-full'}>
                        {p.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
