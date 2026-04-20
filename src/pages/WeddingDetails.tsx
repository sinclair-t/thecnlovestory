import { useEffect, useState } from 'react';
import { MapPin, Clock, Calendar, Heart, Music, Camera, Hotel, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const schedule = [
  { time: '10:00 AM', event: 'Traditional Ceremony Begins',    icon: Heart },
  { time: '12:00 PM', event: 'Church / Court Ceremony',         icon: Heart },
  { time: '2:30 PM',  event: 'Ceremony Concludes',             icon: Camera },
  { time: '4:30 PM',  event: 'Reception Doors Open',           icon: Music },
  { time: '5:00 PM',  event: 'Cocktail Hour & Canapes',        icon: Music },
  { time: '7:00 PM',  event: 'Dinner & Entertainment',         icon: Music },
  { time: '9:00 PM',  event: 'Dancing & Celebration',          icon: Music },
  { time: '1:00 AM',  event: 'Reception Ends',                  icon: Clock },
];

interface AccomSettings {
  hotelName: string;
  hotelUrl: string;
  noticeText: string;
}

export default function WeddingDetails() {
  const [accom, setAccom] = useState<AccomSettings | null>(null);

  useEffect(() => {
    supabase
      .from('settings')
      .select('key, value')
      .in('key', ['accommodation_enabled', 'accommodation_hotel_name', 'accommodation_hotel_url', 'accommodation_notice_text'])
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach(r => { map[r.key] = r.value ?? ''; });
        if (map['accommodation_enabled'] !== 'true') return;
        setAccom({
          hotelName: map['accommodation_hotel_name'] || 'Envoy Hotel',
          hotelUrl: map['accommodation_hotel_url'] || '',
          noticeText: map['accommodation_notice_text'] || '',
        });
      });
  }, []);

  return (
    <div>
      <section className="relative pt-40 pb-24">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Venue"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-dark-950/70" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="section-subheading text-gold-300/90 mb-4">The Wedding</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-white mb-6 text-shadow-lg">
            Wedding Details
          </h1>
          <div className="divider-gold" />
          <p className="font-sans text-cream-200/70 text-lg font-light tracking-wide">
            December 26, 2026 · Abuja, Nigeria
          </p>
        </div>
      </section>

      <section className="py-20 bg-cream-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                  <Heart size={18} className="text-gold-600" />
                </div>
                <div>
                  <p className="section-subheading text-gold-600">Ceremony</p>
                  <h3 className="font-serif text-2xl text-dark-900">Traditional & Church</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-dark-600 font-sans text-sm">
                  <Calendar size={15} className="text-gold-500 flex-shrink-0" />
                  <span>Saturday, December 26, 2026</span>
                </div>
                <div className="flex items-center gap-3 text-dark-600 font-sans text-sm">
                  <Clock size={15} className="text-gold-500 flex-shrink-0" />
                  <span>10:00 AM – 2:30 PM</span>
                </div>
                <div className="flex items-start gap-3 text-dark-600 font-sans text-sm">
                  <MapPin size={15} className="text-gold-500 flex-shrink-0 mt-0.5" />
                  <span>Abuja BMO venue, Abuja</span>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                  <Music size={18} className="text-gold-600" />
                </div>
                <div>
                  <p className="section-subheading text-gold-600">Reception</p>
                  <h3 className="font-serif text-2xl text-dark-900">Dinner & Celebration</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-dark-600 font-sans text-sm">
                  <Calendar size={15} className="text-gold-500 flex-shrink-0" />
                  <span>Saturday, December 26, 2026</span>
                </div>
                <div className="flex items-center gap-3 text-dark-600 font-sans text-sm">
                  <Clock size={15} className="text-gold-500 flex-shrink-0" />
                  <span>4:30 PM – 1:00 AM</span>
                </div>
                <div className="flex items-start gap-3 text-dark-600 font-sans text-sm">
                  <MapPin size={15} className="text-gold-500 flex-shrink-0 mt-0.5" />
                  <span>Same venue – Abuja BMO venue, Abuja</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-950">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-400 mb-3 font-semibold">Timeline</p>
            <h2 className="font-serif text-4xl text-white font-light">Day-Of Schedule</h2>
            <div className="divider-gold" />
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gold-700/30" />
            <div className="space-y-8">
              {schedule.map(({ time, event }, i) => (
                <div key={i} className="flex items-start gap-6 pl-14 relative">
                  <div className="absolute left-4 top-1 w-4 h-4 rounded-full border-2 border-gold-500 bg-dark-950" />
                  <div>
                    <p className="font-sans text-xs text-gold-400 tracking-widest font-semibold mb-1">{time}</p>
                    <p className="font-serif text-lg text-white font-light">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-forest-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-300 mb-3 font-semibold">Venue</p>
            <h2 className="font-serif text-4xl text-white font-light">Getting There</h2>
            <div className="divider-gold" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="font-serif text-2xl text-gold-300 mb-4">Abuja BMO venue</h3>
              <p className="font-sans text-sm text-cream-200/70 leading-relaxed mb-4">
                Abuja BMO venue<br />
                Abuja, Nigeria
              </p>
              <div className="space-y-3 text-sm font-sans text-cream-200/60">
                <p><strong className="text-cream-200/90">Parking:</strong> Complimentary parking available at the venue.</p>
                <p><strong className="text-cream-200/90">Hotel Accommodation:</strong> Discounted rates available. Contact us for the promo code.</p>
              </div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-gold-300 hover:text-gold-200 font-sans text-sm transition-colors"
              >
                <MapPin size={15} /> View on Google Maps
              </a>
            </div>
            <div className="bg-dark-900/50 p-6 border border-gold-700/30">
              <h4 className="font-serif text-lg text-white mb-4">Dress Code</h4>
              <p className="font-sans text-sm text-cream-200/60 leading-relaxed mb-4">
                All guests are expected to wear <strong className="text-gold-300">Asoebi fabric</strong> for entry into the main event hall.
                Asoebi is available for purchase in our store — deadline is <strong className="text-gold-300">July 31, 2026</strong>.
              </p>
              <Link to="/asoebe" className="btn-primary text-sm px-6 py-3">
                Shop Asoebi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {accom && (
        <section className="py-20 bg-cream-50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-600 mb-3 font-semibold">Stay With Us</p>
              <h2 className="font-serif text-4xl text-dark-900 font-light">Guest Accommodation</h2>
              <div className="divider-gold" />
            </div>

            <div className="bg-white border border-cream-200 shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 bg-dark-950 p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 border border-gold-600/40 rounded-full flex items-center justify-center mb-5">
                    <Hotel size={24} className="text-gold-400" />
                  </div>
                  <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-400 mb-3 font-semibold">Recommended Hotel</p>
                  {accom.hotelUrl ? (
                    <a
                      href={accom.hotelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-2xl text-white hover:text-gold-300 transition-colors inline-flex items-center gap-2 group"
                    >
                      {accom.hotelName}
                      <ExternalLink size={16} className="text-gold-500/60 group-hover:text-gold-300 transition-colors" />
                    </a>
                  ) : (
                    <p className="font-serif text-2xl text-white">{accom.hotelName}</p>
                  )}
                </div>

                <div className="md:col-span-3 p-10 flex flex-col justify-center">
                  <p className="font-sans text-dark-600 text-sm leading-relaxed mb-6">{accom.noticeText}</p>
                  {accom.hotelUrl && (
                    <a
                      href={accom.hotelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary self-start"
                    >
                      Book at {accom.hotelName} <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-cream-50">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="section-subheading mb-3">Ready to Join Us?</p>
          <h2 className="section-heading mb-4">Confirm Your Attendance</h2>
          <div className="divider-gold" />
          <p className="font-sans text-dark-500 text-sm mb-8 leading-relaxed">
            We'd love to know you're coming. Please RSVP by September 1, 2026.
          </p>
          <Link to="/rsvp" className="btn-primary">
            RSVP Now
          </Link>
        </div>
      </section>
    </div>
  );
}
