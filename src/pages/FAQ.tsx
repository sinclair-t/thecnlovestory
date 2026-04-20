import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: 'RSVP',
    items: [
      { q: 'How do I RSVP?', a: 'Visit the RSVP page and complete the form with your name, phone number, and attendance status. Your phone number serves as your unique identifier.' },
      { q: 'Can I update my RSVP?', a: 'Yes! Simply resubmit the RSVP form with the same phone number and your response will be updated.' },
      { q: 'What is the RSVP deadline?', a: 'Please RSVP by September 1, 2026 so we can make proper arrangements for your seating and catering.' },
    ],
  },
  {
    category: 'Asoebi',
    items: [
      { q: 'Is Asoebi mandatory?', a: 'Yes. Asoebi fabric is mandatory for seating allocation inside the wedding event hall. Guests without Asoebi will not be seated inside.' },
      { q: 'What is the Asoebi purchase deadline?', a: 'All orders must be placed by July 31, 2026 to allow time for payment verification and shipping.' },
      { q: 'How will my Asoebi be delivered?', a: 'Asoebi fabric will be shipped to the address you provide during checkout. Shipping is covered up to ₦5,000. If the actual shipping cost exceeds ₦5,000, you will be contacted to pay the difference.' },
      { q: 'How do I place an Asoebi order?', a: 'Visit our Asoebi Store, select your fabric, enter the number of yards, fill in your shipping details, make payment to our bank account, upload your receipt, and submit.' },
      { q: 'How long does delivery take?', a: 'We aim to process and ship all orders within 5–7 business days after payment is confirmed. Delivery time depends on your location.' },
      { q: 'Can I order fabric from outside Nigeria?', a: 'Currently, we ship within Nigeria only. If you are outside Nigeria, please contact us so we can arrange an alternative.' },
    ],
  },
  {
    category: 'Gifts',
    items: [
      { q: 'Can I bring a physical gift to the wedding?', a: 'Please do not bring physical gifts to the venue. The bride and groom are not based in Nigeria and will not be able to transport gifts back home. Use our gift section to send cash love.' },
      { q: 'How do I send a cash gift?', a: 'Visit the Gift page, transfer the amount to the bank account provided, then fill in the form and upload your transfer receipt.' },
      { q: 'Will I receive a confirmation?', a: 'Yes. Once your receipt is verified, we will confirm your gift. The couple will personally acknowledge every gift.' },
    ],
  },
  {
    category: 'General',
    items: [
      { q: 'What is the dress code?', a: 'Asoebi fabric is required to enter the main event hall. Non-Asoebi guests are welcome at the outdoor reception area.' },
      { q: 'Is there parking at the venue?', a: 'Yes, Abuja BMO venue has complimentary parking for guests. Additional roadside parking is also available nearby.' },
      { q: 'Can I bring children?', a: 'Children are welcome! Please indicate them in your guest count when you RSVP.' },
      { q: 'Will there be food and drinks?', a: 'Absolutely! A full Nigerian wedding feast with authentic cuisine, cocktails, and refreshments will be served.' },
      { q: 'Where can I stay?', a: 'We recommend hotels close to Abuja BMO venue. Contact us at thecnlovestory@gmail.com for recommendations and discount codes.' },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-cream-200 last:border-b-0">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-serif text-lg text-dark-900">{q}</span>
        {open ? <ChevronUp size={18} className="text-gold-600 flex-shrink-0" /> : <ChevronDown size={18} className="text-dark-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="pb-5 -mt-2">
          <p className="font-sans text-sm text-dark-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div>
      <section className="relative pt-40 pb-20">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="FAQ"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-dark-950/75" />
        </div>
        <div className="relative z-10 text-center px-6">
          <p className="section-subheading text-gold-300/90 mb-4">Everything You Need to Know</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-white text-shadow-lg">FAQ</h1>
          <div className="divider-gold" />
        </div>
      </section>

      <div className="bg-dark-900 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'RSVP Deadline', value: 'September 1, 2026' },
              { label: 'Asoebi Deadline', value: 'July 31, 2026' },
              { label: 'Wedding Date', value: 'December 26, 2026' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-4 border border-gold-700/30">
                <p className="font-sans text-xs text-gold-400 tracking-widest uppercase mb-1">{label}</p>
                <p className="font-serif text-lg text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="py-20 bg-cream-50">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {faqs.map(section => (
            <div key={section.category} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-sans text-xs tracking-[0.3em] uppercase text-gold-600 font-semibold">{section.category}</span>
                <div className="flex-1 h-px bg-cream-200" />
              </div>
              <div className="card divide-y divide-cream-200 px-6">
                {section.items.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
              </div>
            </div>
          ))}

          <div className="bg-dark-950 p-8 text-center mt-8">
            <p className="font-serif text-2xl text-white mb-2">Still have questions?</p>
            <p className="font-sans text-sm text-cream-200/60 mb-6">
              Reach out to us at{' '}
              <a href="mailto:thecnlovestory@gmail.com" className="text-gold-400 hover:text-gold-300 transition-colors">
                thecnlovestory@gmail.com
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/rsvp" className="btn-primary">RSVP Now</Link>
              <Link to="/asoebe" className="btn-outline-light">Shop Asoebi</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
