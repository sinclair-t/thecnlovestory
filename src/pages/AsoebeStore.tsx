import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, AlertCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import type { AsoebeProduct, AsoebeCategory } from '../lib/types';

export default function AsoebeStore() {
  const [products, setProducts] = useState<AsoebeProduct[]>([]);
  const [categories, setCategories] = useState<AsoebeCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('asoebe_categories').select('*').eq('active', true).order('display_order'),
        supabase.from('asoebe_products').select('*, category:asoebe_categories(*)').eq('active', true),
      ]);
      setCategories(cats ?? []);
      setProducts(prods ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category_id === activeCategory);

  return (
    <div>
      <section className="relative pt-40 pb-20">
        <div className="absolute inset-0">
          <img
            src="/asoebi.jpg/Asoebi.jpg"
            alt="Asoebi"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-dark-950/75" />
        </div>
        <div className="relative z-10 text-center px-6">
          <p className="section-subheading text-gold-300/90 mb-4">Explore the</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-white text-shadow-lg">
            Asoebi Store
          </h1>
          <div className="divider-gold" />
          <p className="font-sans text-cream-200/70 font-light max-w-lg mx-auto text-sm">
            Purchase deadline: <strong className="text-gold-300">July 31, 2026</strong> · Fabric shipped to your address
          </p>
        </div>
      </section>

      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="font-sans text-xs text-amber-800 leading-relaxed space-y-1">
              <p><strong>Important:</strong> Asoebi is important for seating charts and group arrangements (only kids are exempt — payments plan will be available and all payment deadline is for August)</p>
              <p>Shipping is covered up to ₦5,000. Any excess shipping cost will be invoiced separately.</p>
              <p>The bride and groom are not based in Nigeria. Please <strong>do not bring physical gifts</strong> — use our gift section instead.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="py-16 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={() => setActiveCategory('all')}
              className={`font-sans text-xs tracking-widest uppercase px-5 py-2.5 border transition-all duration-200
                ${activeCategory === 'all' ? 'bg-dark-900 text-white border-dark-900' : 'border-cream-300 text-dark-600 hover:border-dark-400'}`}
            >
              All Fabrics
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`font-sans text-xs tracking-widest uppercase px-5 py-2.5 border transition-all duration-200
                  ${activeCategory === cat.id ? 'bg-dark-900 text-white border-dark-900' : 'border-cream-300 text-dark-600 hover:border-dark-400'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white animate-pulse">
                  <div className="aspect-[3/4] bg-cream-200" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-cream-200 rounded w-3/4" />
                    <div className="h-3 bg-cream-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={40} className="text-cream-400 mx-auto mb-4" />
              <p className="font-sans text-dark-400">No fabrics found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(product => (
                <Link key={product.id} to={`/asoebe/${product.id}`} className="group card overflow-hidden">
                  <div className="relative overflow-hidden aspect-[3/4]">
                    <img
                      src={product.image_url ?? 'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-dark-950/0 group-hover:bg-dark-950/20 transition-all duration-300" />
                    {product.category && (
                      <span className="absolute top-4 left-4 bg-dark-950/80 text-gold-300 text-xs font-sans tracking-widest uppercase px-3 py-1.5">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-xl text-dark-900 mb-1">{product.name}</h3>
                    <p className="font-sans text-sm text-dark-400 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-xs text-dark-400 tracking-wide">Price per yard</p>
                        <p className="font-serif text-xl text-gold-700">{formatCurrency(product.price_per_yard)}</p>
                      </div>
                      <span className="flex items-center gap-1 font-sans text-xs tracking-widest uppercase text-dark-700 group-hover:text-gold-600 transition-colors">
                        Order <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
