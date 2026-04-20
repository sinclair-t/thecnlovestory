import { Link } from 'react-router-dom';
import { Instagram, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-950 text-cream-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-serif text-2xl font-light text-white mb-1">
              TheCNLovestory <span className="text-gold-400">Part III</span>
            </h3>
            <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-400 mb-4">December 26, 2026 · Abuja</p>
            <p className="text-sm text-cream-200/60 leading-relaxed font-sans">
              We can't wait to celebrate the most beautiful day of our lives with you.
              Thank you for being part of our story.
            </p>
          </div>

          <div>
            <h4 className="font-sans text-xs tracking-[0.35em] uppercase text-gold-400 mb-5 font-semibold">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {[
                { to: '/wedding-details', label: 'Wedding Details' },
                { to: '/rsvp',   label: 'RSVP' },
                { to: '/asoebe', label: 'Asoebi Store' },
                { to: '/gifts',  label: 'Send a Gift' },
                { to: '/faq',    label: 'FAQ & Notices' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="font-sans text-sm text-cream-200/60 hover:text-gold-300 transition-colors duration-200">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-sans text-xs tracking-[0.35em] uppercase text-gold-400 mb-5 font-semibold">Get In Touch</h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:thecnlovestory@gmail.com" className="flex items-center gap-2.5 text-sm text-cream-200/60 hover:text-gold-300 transition-colors duration-200">
                <Mail size={15} />
                thecnlovestory@gmail.com
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-cream-200/60 hover:text-gold-300 transition-colors duration-200">
                <Instagram size={15} />
                #ChuksAndNaomi2026
              </a>
            </div>
            <div className="mt-6 pt-6 border-t border-dark-800">
              <p className="text-xs text-cream-200/40 font-sans">Important Notice</p>
              <p className="text-xs text-cream-200/55 font-sans mt-1.5 leading-relaxed">
                Please do not bring physical gifts. The couple is not based in Nigeria.
                Use our gift section to send love.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-200/35 font-sans flex items-center gap-1.5">
            Made with <Heart size={12} className="text-gold-500" fill="currentColor" /> for TheCNLovestory
          </p>
          <Link
            to="/admin/login"
            className="font-sans text-xs text-dark-600 hover:text-dark-400 transition-colors duration-200 tracking-widest uppercase"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
