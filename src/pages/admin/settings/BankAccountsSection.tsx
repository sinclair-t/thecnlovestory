import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Link2, Unlink, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { BankAccount, AsoebeProduct } from '../../../lib/types';

interface ProductAssignment {
  productId: string;
  productName: string;
  assignedIds: string[];
}

interface GiftAssignment {
  assignedIds: string[];
}

const BLANK_FORM = { label: '', bank_name: '', account_number: '', account_name: '', currency: 'NGN', purpose: 'general', active: true };

export default function BankAccountsSection() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [products, setProducts] = useState<AsoebeProduct[]>([]);
  const [productAssignments, setProductAssignments] = useState<ProductAssignment[]>([]);
  const [giftAssignment, setGiftAssignment] = useState<GiftAssignment>({ assignedIds: [] });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [expandedAssign, setExpandedAssign] = useState<string | null>(null);
  const [savingAssign, setSavingAssign] = useState(false);

  const load = async () => {
    const [{ data: accts }, { data: prods }, { data: prodBanks }, { data: giftBanks }] = await Promise.all([
      supabase.from('bank_accounts').select('*').order('display_order'),
      supabase.from('asoebe_products').select('id, name').eq('active', true).order('name'),
      supabase.from('product_bank_accounts').select('product_id, bank_account_id'),
      supabase.from('gift_bank_accounts').select('bank_account_id'),
    ]);

    setAccounts((accts as BankAccount[]) ?? []);

    const prodList = (prods ?? []) as AsoebeProduct[];
    setProducts(prodList);

    const assignments: ProductAssignment[] = prodList.map(p => ({
      productId: p.id,
      productName: p.name,
      assignedIds: (prodBanks ?? []).filter(pb => pb.product_id === p.id).map(pb => pb.bank_account_id),
    }));
    setProductAssignments(assignments);

    setGiftAssignment({ assignedIds: (giftBanks ?? []).map(gb => gb.bank_account_id) });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await supabase.from('bank_accounts').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingId);
    } else {
      await supabase.from('bank_accounts').insert(form);
    }
    await load();
    setShowForm(false);
    setEditingId(null);
    setForm(BLANK_FORM);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bank account? All assignments will also be removed.')) return;
    await supabase.from('bank_accounts').delete().eq('id', id);
    await load();
  };

  const handleProductAssign = async (productId: string, bankId: string, assigned: boolean) => {
    setSavingAssign(true);
    if (assigned) {
      await supabase.from('product_bank_accounts').delete()
        .eq('product_id', productId).eq('bank_account_id', bankId);
    } else {
      await supabase.from('product_bank_accounts').insert({ product_id: productId, bank_account_id: bankId, display_order: 0 });
    }
    await load();
    setSavingAssign(false);
  };

  const handleGiftAssign = async (bankId: string, assigned: boolean) => {
    setSavingAssign(true);
    if (assigned) {
      await supabase.from('gift_bank_accounts').delete().eq('bank_account_id', bankId);
    } else {
      await supabase.from('gift_bank_accounts').insert({ bank_account_id: bankId, display_order: 0 });
    }
    await load();
    setSavingAssign(false);
  };

  if (loading) return <div className="p-6 text-center text-gray-400 text-sm font-sans">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-sans font-semibold text-gray-700 text-sm uppercase tracking-wide">Bank Accounts</h3>
            <p className="text-xs text-gray-400 font-sans mt-0.5">Manage accounts and assign them to products or the gift page</p>
          </div>
          <button
            onClick={() => { setForm(BLANK_FORM); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-1.5 text-xs font-sans text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:border-gray-400 transition-colors"
          >
            <Plus size={13} /> Add Account
          </button>
        </div>

        {showForm && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
              {[
                { k: 'label', label: 'Label', placeholder: 'e.g. ASOEBE Payment' },
                { k: 'bank_name', label: 'Bank Name', placeholder: 'e.g. First Bank' },
                { k: 'account_number', label: 'Account Number', placeholder: '0123456789' },
                { k: 'account_name', label: 'Account Name', placeholder: 'Full account name' },
              ].map(({ k, label, placeholder }) => (
                <div key={k}>
                  <label className="block text-xs text-gray-500 font-sans mb-1">{label}</label>
                  <input
                    type="text"
                    value={(form as Record<string, string>)[k]}
                    onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 font-sans mb-1">Purpose</label>
                <select
                  value={form.purpose}
                  onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {['asoebe', 'gift', 'general'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 text-xs font-sans rounded-lg hover:bg-gray-800">
                  <Check size={13} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 text-xs font-sans rounded-lg hover:border-gray-400">
                  <X size={13} /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-2">
          {accounts.map(acct => (
            <div key={acct.id} className="border border-gray-100 rounded-lg hover:border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-gray-900">{acct.label} — {acct.bank_name}</p>
                  <p className="font-mono text-xs text-gray-500">{acct.account_number} · {acct.account_name}</p>
                  <span className={`text-xs font-sans capitalize ${acct.active ? 'text-green-600' : 'text-red-500'}`}>
                    {acct.active ? 'Active' : 'Inactive'} · {acct.purpose}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedAssign(expandedAssign === acct.id ? null : acct.id)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Manage assignments"
                  >
                    <Link2 size={14} />
                  </button>
                  <button
                    onClick={() => { setForm({ label: acct.label, bank_name: acct.bank_name, account_number: acct.account_number, account_name: acct.account_name, currency: acct.currency, purpose: acct.purpose, active: acct.active }); setEditingId(acct.id); setShowForm(true); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(acct.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setExpandedAssign(expandedAssign === acct.id ? null : acct.id)}
                    className="p-1.5 text-gray-400 transition-colors"
                  >
                    {expandedAssign === acct.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {expandedAssign === acct.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wide mb-3">Assign to pages</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={giftAssignment.assignedIds.includes(acct.id)}
                        onChange={() => handleGiftAssign(acct.id, giftAssignment.assignedIds.includes(acct.id))}
                        disabled={savingAssign}
                        className="w-4 h-4 rounded accent-amber-500"
                      />
                      <span className="text-sm font-sans text-gray-700 group-hover:text-gray-900">Gift Page</span>
                      {giftAssignment.assignedIds.includes(acct.id) && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-sans">assigned</span>
                      )}
                    </label>

                    {productAssignments.length > 0 && (
                      <div>
                        <p className="text-xs font-sans text-gray-400 mb-2 mt-3">Products:</p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {productAssignments.map(pa => {
                            const isAssigned = pa.assignedIds.includes(acct.id);
                            return (
                              <label key={pa.productId} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => handleProductAssign(pa.productId, acct.id, isAssigned)}
                                  disabled={savingAssign}
                                  className="w-4 h-4 rounded accent-amber-500"
                                />
                                <span className="text-sm font-sans text-gray-700 group-hover:text-gray-900 truncate">{pa.productName}</span>
                                {isAssigned && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-sans flex-shrink-0">assigned</span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {accounts.length === 0 && (
            <p className="text-sm text-gray-400 font-sans text-center py-4">No bank accounts yet. Add one above.</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Unlink size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-sans font-semibold text-blue-800 mb-1">Assignment Fallback</p>
            <p className="text-xs font-sans text-blue-700 leading-relaxed">
              If no specific accounts are assigned to a product or the gift page, the system falls back to showing accounts by their <strong>purpose</strong> field (asoebe → product pages, gift → gift page).
              Explicit assignments always take priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
