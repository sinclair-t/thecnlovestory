import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { normalizePhone, findOrCreateGuest, uploadReceipt } from '../lib/utils';
import PhoneInput from '../components/ui/PhoneInput';
import FileUpload from '../components/ui/FileUpload';
import BankAccountCard from '../components/ui/BankAccountCard';
import type { BankAccount } from '../lib/types';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function GiftPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    giverName: '', countryCode: '+234', localPhone: '', amount: '', message: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    async function loadAccounts() {
      const { data: assigned } = await supabase
        .from('gift_bank_accounts')
        .select('bank_account_id, display_order, bank_account:bank_accounts(*)')
        .order('display_order');

      if (assigned && assigned.length > 0) {
        const accts = assigned
          .map(r => r.bank_account as unknown as BankAccount)
          .filter(Boolean)
          .filter(a => a.active);
        setBankAccounts(accts);
      } else {
        const { data } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('purpose', 'gift')
          .eq('active', true)
          .order('display_order');
        setBankAccounts(data ?? []);
      }
    }
    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) { setErrorMsg('Please upload your payment receipt.'); return; }
    setStatus('loading');
    setErrorMsg('');

    try {
      const guestId = await findOrCreateGuest({
        fullName: form.giverName,
        countryCode: form.countryCode,
        localPhone: form.localPhone,
      });

      const { data: gift, error: giftErr } = await supabase.from('gifts').insert({
        guest_id: guestId ?? undefined,
        giver_name: form.giverName,
        normalized_phone: normalizePhone(form.countryCode, form.localPhone),
        country_code: form.countryCode,
        local_phone: form.localPhone,
        amount: form.amount ? parseFloat(form.amount) : undefined,
        message: form.message || undefined,
        status: 'pending',
      }).select('id').maybeSingle();

      if (giftErr || !gift) throw new Error('Failed to submit gift.');

      const uploaded = await uploadReceipt(receiptFile, 'gifts');
      if (uploaded) {
        await supabase.from('receipts').insert({
          reference_type: 'gift',
          reference_id: gift.id,
          file_path: uploaded.path,
          file_url: uploaded.url,
          file_name: receiptFile.name,
        });
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="font-serif text-4xl text-dark-900 mb-4">Gift Received!</h2>
          <div className="divider-gold" />
          <p className="font-sans text-dark-500 text-sm leading-relaxed mb-8">
            Thank you so much, {form.giverName.split(' ')[0]}! Your gift means the world to Chuks & Naomi.
            It will be reviewed and confirmed within 24–48 hours.
          </p>
          <button onClick={() => { setStatus('idle'); setForm({ giverName: '', countryCode: '+234', localPhone: '', amount: '', message: '' }); setReceiptFile(null); }} className="btn-secondary">
            Send Another Gift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative pt-40 pb-20">
        <div className="absolute inset-0">
          <img
            src="/gifts.jpg/Gifts.jpg"
            alt="Gifts"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-dark-950/72" />
        </div>
        <div className="relative z-10 text-center px-6">
          <p className="section-subheading text-gold-300/90 mb-4">Show Your Love</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-white text-shadow-lg">Send a Gift</h1>
          <div className="divider-gold" />
        </div>
      </section>

      <section className="py-20 bg-cream-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-amber-50 border border-amber-200 p-5 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-amber-800 mb-1">No Physical Gifts Please</p>
                    <p className="font-sans text-xs text-amber-700 leading-relaxed">
                      The bride and groom are not based in Nigeria. Please show your love through this cash gift transfer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                  <Gift size={18} className="text-gold-600" />
                </div>
                <div>
                  <p className="section-subheading">Gift Transfer</p>
                  <h3 className="font-serif text-xl text-dark-900">Bank Details</h3>
                </div>
              </div>

              <div className="space-y-4">
                {bankAccounts.map(acct => <BankAccountCard key={acct.id} account={acct} />)}
                {bankAccounts.length === 0 && (
                  <p className="font-sans text-sm text-dark-400">Loading bank details...</p>
                )}
              </div>

              <div className="mt-8 bg-forest-50 border border-forest-200 p-5">
                <h4 className="font-serif text-lg text-forest-800 mb-2">How It Works</h4>
                <ol className="font-sans text-xs text-forest-700 space-y-2 leading-relaxed list-decimal list-inside">
                  <li>Transfer your gift amount to the bank account above.</li>
                  <li>Fill in the form with your name and contact details.</li>
                  <li>Upload a screenshot or photo of your transfer receipt.</li>
                  <li>Submit the form — we'll confirm within 24–48 hours.</li>
                </ol>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card p-8">
                <h2 className="font-serif text-3xl text-dark-900 mb-2">Your Gift Details</h2>
                <p className="font-sans text-sm text-dark-400 mb-8">Fill in your details after making the transfer.</p>

                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 p-4 mb-6 flex gap-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="font-sans text-sm text-red-700">{errorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="label">Your Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.giverName} onChange={e => set('giverName', e.target.value)} required className="input-field" placeholder="Your name as it appears on transfer" />
                  </div>
                  <PhoneInput
                    countryCode={form.countryCode}
                    localPhone={form.localPhone}
                    onCountryChange={v => set('countryCode', v)}
                    onPhoneChange={v => set('localPhone', v)}
                    required
                  />
                  <div>
                    <label className="label">Gift Amount (₦) <span className="text-dark-300 font-normal">(optional)</span></label>
                    <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} className="input-field" placeholder="e.g. 50000" min="0" />
                  </div>
                  <div>
                    <label className="label">Message to the Couple <span className="text-dark-300 font-normal">(optional)</span></label>
                    <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={3} className="input-field resize-none" placeholder="A heartfelt message for Chuks & Naomi..." />
                  </div>
                  <FileUpload label="Upload Transfer Receipt" file={receiptFile} onChange={setReceiptFile} required />
                  <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                    {status === 'loading' ? 'Submitting...' : 'Submit Gift'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
