import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import PhoneInput from '../components/ui/PhoneInput';
import { normalizePhone, findOrCreateGuest } from '../lib/utils';
import { supabase } from '../lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function RSVP() {
  const [form, setForm] = useState({
    fullName: '',
    countryCode: '+234',
    localPhone: '',
    email: '',
    attending: 'yes',
    guestCount: '1',
    note: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.localPhone.trim()) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const guestId = await findOrCreateGuest({
        fullName: form.fullName,
        countryCode: form.countryCode,
        localPhone: form.localPhone,
        email: form.email || undefined,
      });

      if (!guestId) throw new Error('Could not create guest record.');

      const normalized = normalizePhone(form.countryCode, form.localPhone);

      const { data: existingRsvp } = await supabase
        .from('rsvps')
        .select('id')
        .eq('guest_id', guestId)
        .maybeSingle();

      if (existingRsvp) {
        await supabase.from('rsvps').update({
          attending: form.attending === 'yes',
          guest_count: parseInt(form.guestCount) || 1,
          note: form.note || undefined,
          updated_at: new Date().toISOString(),
        }).eq('id', existingRsvp.id);
      } else {
        await supabase.from('rsvps').insert({
          guest_id: guestId,
          attending: form.attending === 'yes',
          guest_count: parseInt(form.guestCount) || 1,
          note: form.note || undefined,
          source: 'form',
        });
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="font-serif text-4xl text-dark-900 mb-4">You're Confirmed!</h2>
          <div className="divider-gold" />
          <p className="font-sans text-dark-500 text-sm leading-relaxed mb-2">
            {form.attending === 'yes'
              ? `We're so excited to celebrate with you, ${form.fullName.split(' ')[0]}! 🎉`
              : `Thank you for letting us know, ${form.fullName.split(' ')[0]}. We'll miss you.`}
          </p>
          <p className="font-sans text-dark-400 text-sm mb-8">
            A summary has been recorded. See you on December 26, 2026!
          </p>
          <button
            onClick={() => { setStatus('idle'); setForm({ fullName: '', countryCode: '+234', localPhone: '', email: '', attending: 'yes', guestCount: '1', note: '' }); }}
            className="btn-secondary"
          >
            Submit Another RSVP
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
            src="https://images.pexels.com/photos/1730877/pexels-photo-1730877.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="RSVP"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-dark-950/70" />
        </div>
        <div className="relative z-10 text-center px-6">
          <p className="section-subheading text-gold-300/90 mb-4">Join Us</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-white text-shadow-lg mb-4">RSVP</h1>
          <div className="divider-gold" />
          <p className="font-sans text-cream-200/70 font-light">Please respond by September 1, 2026</p>
        </div>
      </section>

      <section className="py-20 bg-cream-50">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <div className="bg-amber-50 border border-amber-200 p-4 mb-8 flex gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="font-sans text-sm text-amber-800 leading-relaxed">
              <strong>Asoebi Reminder:</strong> All guests attending the ceremony hall must wear Asoebi fabric.
              Purchase yours before <strong>July 31, 2026</strong>.
            </p>
          </div>

          <div className="card p-8 md:p-12">
            <h2 className="font-serif text-3xl text-dark-900 mb-2">Confirm Your Attendance</h2>
            <p className="font-sans text-sm text-dark-400 mb-8">
              Your phone number is used to identify your RSVP. You can always update it using the same number.
            </p>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 p-4 mb-6 flex gap-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="font-sans text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="Your full name"
                  required
                  className="input-field"
                />
              </div>

              <PhoneInput
                countryCode={form.countryCode}
                localPhone={form.localPhone}
                onCountryChange={v => set('countryCode', v)}
                onPhoneChange={v => set('localPhone', v)}
                required
              />

              <div>
                <label className="label">Email Address <span className="text-dark-300 font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="your@email.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Will You Be Attending? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: 'yes', label: 'Yes, I will attend' }, { v: 'no', label: "No, I can't make it" }].map(({ v, label }) => (
                    <label
                      key={v}
                      className={`flex items-center gap-3 p-4 border-2 cursor-pointer transition-all duration-200
                        ${form.attending === v ? 'border-gold-500 bg-gold-50' : 'border-cream-300 hover:border-gold-300'}`}
                    >
                      <input type="radio" name="attending" value={v} checked={form.attending === v} onChange={() => set('attending', v)} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${form.attending === v ? 'border-gold-500 bg-gold-500' : 'border-cream-400'}`} />
                      <span className="font-sans text-sm text-dark-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.attending === 'yes' && (
                <div>
                  <label className="label">Number of Guests (including yourself)</label>
                  <select value={form.guestCount} onChange={e => set('guestCount', e.target.value)} className="input-field">
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="label">Message to the Couple <span className="text-dark-300 font-normal">(optional)</span></label>
                <textarea
                  value={form.note}
                  onChange={e => set('note', e.target.value)}
                  rows={3}
                  placeholder="Share your excitement or a special message..."
                  className="input-field resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full"
              >
                {status === 'loading' ? 'Submitting...' : 'Confirm RSVP'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
