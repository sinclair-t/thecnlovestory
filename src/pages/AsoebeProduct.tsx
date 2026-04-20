import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Minus, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency, normalizePhone, findOrCreateGuest, uploadReceipt } from '../lib/utils';
import PhoneInput from '../components/ui/PhoneInput';
import FileUpload from '../components/ui/FileUpload';
import BankAccountCard from '../components/ui/BankAccountCard';
import type { AsoebeProduct as Product, BankAccount } from '../lib/types';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function AsoebeProduct() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [yards, setYards] = useState(4);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    buyerName: '', countryCode: '+234', localPhone: '',
    address: '', city: '', state: '', country: 'Nigeria', notes: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const total = product ? product.price_per_yard * yards : 0;

  useEffect(() => {
    async function load() {
      const [{ data: prod }, { data: assigned }] = await Promise.all([
        supabase.from('asoebe_products').select('*, category:asoebe_categories(*)').eq('id', id!).maybeSingle(),
        supabase.from('product_bank_accounts')
          .select('bank_account_id, display_order, bank_account:bank_accounts(*)')
          .eq('product_id', id!)
          .order('display_order'),
      ]);

      if (prod) setProduct(prod);

      if (assigned && assigned.length > 0) {
        const accts = (assigned as { bank_account: unknown }[])
          .map(r => r.bank_account as BankAccount)
          .filter(Boolean)
          .filter(a => a.active);
        setBankAccounts(accts);
      } else {
        const { data: banks } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('purpose', 'asoebe')
          .eq('active', true)
          .order('display_order');
        setBankAccounts(banks ?? []);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!receiptFile) { setErrorMsg('Please upload your payment receipt.'); return; }
    setStatus('loading');
    setErrorMsg('');

    try {
      const guestId = await findOrCreateGuest({
        fullName: form.buyerName,
        countryCode: form.countryCode,
        localPhone: form.localPhone,
      });

      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        guest_id: guestId ?? undefined,
        buyer_name: form.buyerName,
        normalized_phone: normalizePhone(form.countryCode, form.localPhone),
        country_code: form.countryCode,
        local_phone: form.localPhone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_country: form.country,
        delivery_notes: form.notes || undefined,
        total_amount: total,
        status: 'pending',
      }).select('id').maybeSingle();

      if (orderErr || !order) throw new Error('Failed to create order.');

      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        quantity_in_yards: yards,
        price_per_yard: product.price_per_yard,
        subtotal: total,
      });

      if (guestId) {
        const { data: existingRsvp } = await supabase.from('rsvps').select('id').eq('guest_id', guestId).maybeSingle();
        if (!existingRsvp) {
          await supabase.from('rsvps').insert({
            guest_id: guestId, attending: true, guest_count: 1, source: 'asoebe_order',
          });
        }
      }

      const uploaded = await uploadReceipt(receiptFile, 'orders');
      if (uploaded) {
        await supabase.from('receipts').insert({
          reference_type: 'order',
          reference_id: order.id,
          file_path: uploaded.path,
          file_url: uploaded.url,
          file_name: receiptFile.name,
        });
      }

      setStatus('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-cream-50 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 bg-cream-50 text-center px-6">
        <h2 className="font-serif text-3xl text-dark-900 mb-4">Product Not Found</h2>
        <Link to="/asoebe" className="btn-primary">Back to Store</Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="font-serif text-4xl text-dark-900 mb-4">Order Received!</h2>
          <div className="divider-gold" />
          <p className="font-sans text-dark-500 text-sm leading-relaxed mb-2">
            Your Asoebi order for <strong>{product.name}</strong> ({yards} yards = {formatCurrency(total)}) has been submitted.
          </p>
          <p className="font-sans text-dark-400 text-sm mb-8">
            Our team will review your payment receipt and confirm your order shortly.
          </p>
          <Link to="/asoebe" className="btn-secondary">Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 pt-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        <Link to="/asoebe" className="inline-flex items-center gap-2 text-dark-500 hover:text-gold-600 font-sans text-sm transition-colors mb-8">
          <ArrowLeft size={15} /> Back to Store
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative">
            <img
              src={product.image_url ?? 'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg'}
              alt={product.name}
              className="w-full aspect-[3/4] object-cover rounded-sm shadow-lg"
            />
            {product.category && (
              <span className="absolute top-4 left-4 bg-dark-950/80 text-gold-300 text-xs font-sans tracking-widest uppercase px-3 py-1.5">
                {product.category.name}
              </span>
            )}
          </div>

          <div>
            <p className="section-subheading mb-2">{product.category?.name}</p>
            <h1 className="font-serif text-4xl text-dark-900 mb-4">{product.name}</h1>
            <div className="divider-gold-left" />
            <p className="font-sans text-dark-500 text-sm leading-relaxed mb-6">{product.description}</p>

            <div className="bg-white border border-cream-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-sm text-dark-500">Price per yard</span>
                <span className="font-serif text-2xl text-gold-700">{formatCurrency(product.price_per_yard)}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-sm text-dark-500">Quantity (yards)</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setYards(y => Math.max(1, y - 1))} className="w-8 h-8 border border-cream-300 flex items-center justify-center hover:border-gold-400 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="font-sans font-semibold text-dark-900 w-8 text-center">{yards}</span>
                  <button onClick={() => setYards(y => y + 1)} className="w-8 h-8 border border-cream-300 flex items-center justify-center hover:border-gold-400 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="border-t border-cream-200 pt-4 flex items-center justify-between">
                <span className="font-sans font-semibold text-dark-700">Total Amount</span>
                <span className="font-serif text-3xl text-gold-700">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 mb-8">
              <p className="font-sans text-xs text-amber-800">
                <strong>How to order:</strong> Complete the form below, make payment to the bank account listed,
                then upload your receipt. We'll confirm your order within 24–48 hours.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="font-serif text-xl text-dark-900 mb-4">Payment Details</h3>
              <div className="space-y-3">
                {bankAccounts.map(acct => <BankAccountCard key={acct.id} account={acct} />)}
                {bankAccounts.length === 0 && (
                  <p className="font-sans text-sm text-dark-400">Contact us for payment details.</p>
                )}
              </div>
            </div>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 p-4 mb-6 flex gap-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="font-sans text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-serif text-xl text-dark-900">Your Details</h3>
              <div>
                <label className="label">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.buyerName} onChange={e => set('buyerName', e.target.value)} required className="input-field" placeholder="Your full name" />
              </div>
              <PhoneInput
                countryCode={form.countryCode}
                localPhone={form.localPhone}
                onCountryChange={v => set('countryCode', v)}
                onPhoneChange={v => set('localPhone', v)}
                required
              />
              <h3 className="font-serif text-xl text-dark-900 pt-2">Shipping Address</h3>
              <div>
                <label className="label">Street Address <span className="text-red-500">*</span></label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} required className="input-field" placeholder="House number & street name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City <span className="text-red-500">*</span></label>
                  <input type="text" value={form.city} onChange={e => set('city', e.target.value)} required className="input-field" placeholder="City" />
                </div>
                <div>
                  <label className="label">State <span className="text-red-500">*</span></label>
                  <input type="text" value={form.state} onChange={e => set('state', e.target.value)} required className="input-field" placeholder="State" />
                </div>
              </div>
              <div>
                <label className="label">Country</label>
                <input type="text" value={form.country} onChange={e => set('country', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Delivery Notes <span className="text-dark-300 font-normal">(optional)</span></label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input-field resize-none" placeholder="Any special delivery instructions..." />
              </div>
              <FileUpload label="Upload Payment Receipt" file={receiptFile} onChange={setReceiptFile} required />
              <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                {status === 'loading' ? 'Submitting Order...' : `Submit Order — ${formatCurrency(total)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
