import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const links = [
  { to: '/',               label: 'Home' },
  { to: '/wedding-details', label: 'Wedding Details' },
  { to: '/rsvp',           label: 'RSVP' },
  { to: '/asoebe',         label: 'Asoebi' },
  { to: '/gifts',          label: 'Gifts' },
  { to: '/faq',            label: 'FAQ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent
          ? 'bg-transparent'
          : 'bg-dark-950/95 backdrop-blur-sm shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-18 md:h-20">
          <Link to="/" className="group flex flex-col items-start">
            <span className="font-serif text-2xl font-light tracking-[0.15em] text-white group-hover:text-gold-300 transition-colors duration-300">
              TheCNLovestory <span className="text-gold-400">Part III</span>
            </span>
            <span className="font-sans text-[9px] tracking-[0.5em] uppercase text-cream-300/70 -mt-0.5">
              December 26, 2026
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-sans text-xs tracking-[0.2em] uppercase transition-colors duration-200 ${
                  location.pathname === to
                    ? 'text-gold-400'
                    : 'text-cream-100/80 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setOpen(p => !p)}
            className="lg:hidden text-white p-2 hover:text-gold-300 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-dark-950/98 backdrop-blur-md border-t border-dark-800">
          <div className="px-6 py-6 flex flex-col gap-5">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-sans text-sm tracking-[0.2em] uppercase transition-colors duration-200 ${
                  location.pathname === to
                    ? 'text-gold-400'
                    : 'text-cream-100/80 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
