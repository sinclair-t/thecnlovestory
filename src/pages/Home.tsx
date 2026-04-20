import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Clock, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const categories = [
  { title: 'ASOEBE Girls',     img: 'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=600', href: '/asoebe' },
  { title: 'ASOEBE Men',       img: 'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=600', href: '/asoebe' },
  { title: "Friends of Bride", img: 'https://images.pexels.com/photos/1488319/pexels-photo-1488319.jpeg?auto=compress&cs=tinysrgb&w=600', href: '/asoebe' },
  { title: "Groom's Family",   img: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=600', href: '/asoebe' },
  { title: "Bride's Family",   img: 'https://images.pexels.com/photos/3622622/pexels-photo-3622622.jpeg?auto=compress&cs=tinysrgb&w=600', href: '/asoebe' },
];

const STORY_DEFAULTS = {
  heading: 'A Love Story Worth Celebrating',
  paragraph1: 'What started as a chance encounter blossomed into the most beautiful chapter of our lives. From late-night conversations to spontaneous adventures, every moment has brought us closer to this extraordinary day.',
  paragraph2: 'We are overjoyed to invite you to witness our union and celebrate with us. Your presence means the world to us, and we cannot wait to create memories together that will last a lifetime.',
};

export default function Home() {
  const [story, setStory] = useState(STORY_DEFAULTS);

  useEffect(() => {
    supabase
      .from('settings')
      .select('key, value')
      .in('key', ['story_heading', 'story_paragraph_1', 'story_paragraph_2'])
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach(r => { map[r.key] = r.value ?? ''; });
        setStory({
          heading: map['story_heading'] || STORY_DEFAULTS.heading,
          paragraph1: map['story_paragraph_1'] || STORY_DEFAULTS.paragraph1,
          paragraph2: map['story_paragraph_2'] || STORY_DEFAULTS.paragraph2,
        });
      });
  }, []);

  return (
    <div>
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Wedding.png"
            alt="Chuks and Naomi in traditional Nigerian wedding attire surrounded by lush tropical greenery"
            className="w-full h-full object-cover object-top sm:object-center"
          />
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center px-6 py-20 max-w-4xl mx-auto flex flex-col items-center">
          <p className="section-subheading text-gold-300/90 mb-6 animate-fade-in">
            We Are Getting Married
          </p>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light text-white text-shadow-lg leading-none tracking-[0.05em] mb-6 animate-fade-up">
            Chuks
            <span className="block text-gold-300 italic font-light text-5xl md:text-7xl lg:text-8xl mt-2">&amp; Naomi</span>
          </h1>
          <div className="gold-line w-full max-w-xs my-8 opacity-60" />
          <div className="flex flex-wrap items-center justify-center gap-6 text-cream-100/80 font-sans text-sm tracking-[0.2em] mb-12">
            <span className="flex items-center gap-2"><Calendar size={14} className="text-gold-400" /> December 26, 2026</span>
            <span className="hidden sm:block text-gold-500/50">·</span>
            <span className="flex items-center gap-2"><MapPin size={14} className="text-gold-400" /> Abuja, Nigeria</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/rsvp" className="btn-primary">
              RSVP Now <ArrowRight size={15} />
            </Link>
            <Link to="/asoebe" className="btn-outline-light">
              Buy Asoebi
            </Link>
          </div>
        </div>

        <a
          href="#story"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown size={28} />
        </a>
      </section>

      <section id="story" className="py-24 bg-cream-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border border-gold-300/40 rounded-sm pointer-events-none" />
              <img
                src="/Our_Story.jpg"
                alt="Couple"
                className="w-full h-[520px] object-cover object-center rounded-sm shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-dark-950 text-white px-6 py-5 shadow-xl">
                <p className="font-serif text-3xl font-light text-gold-300">26</p>
                <p className="font-sans text-xs tracking-[0.3em] uppercase text-cream-200/60">December</p>
                <p className="font-sans text-sm text-cream-200/60">2026</p>
              </div>
            </div>
            <div>
              <p className="section-subheading mb-4">Our Story</p>
              <h2 className="section-heading mb-6">
                {story.heading.includes('Celebrating') ? (
                  <>
                    {story.heading.split('Celebrating')[0]}
                    <em className="text-gold-600 font-light">Celebrating</em>
                  </>
                ) : (
                  story.heading
                )}
              </h2>
              <div className="divider-gold-left" />
              <p className="text-dark-600 font-sans text-base leading-relaxed mb-5">{story.paragraph1}</p>
              <p className="text-dark-600 font-sans text-base leading-relaxed mb-8">{story.paragraph2}</p>
              <Link to="/rsvp" className="btn-primary">
                Confirm Attendance <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-950">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-400 mb-3 font-semibold">The Details</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-white">Wedding Day Schedule</h2>
            <div className="divider-gold" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'Ceremony', time: '10:00 AM – 2:30 PM', sub: 'Traditional & Church Ceremony' },
              { icon: MapPin, title: 'Venue', time: 'Abuja BMO venue', sub: 'Abuja, Nigeria' },
              { icon: Clock, title: 'Reception', time: '4:30 PM – 1:00 AM', sub: 'Dinner, Music & Celebration' },
            ].map(({ icon: Icon, title, time, sub }) => (
              <div key={title} className="border border-gold-700/30 p-8 text-center hover:border-gold-500/50 transition-colors duration-300">
                <div className="w-12 h-12 border border-gold-600/40 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon size={20} className="text-gold-400" />
                </div>
                <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-400 mb-2 font-semibold">{title}</p>
                <p className="font-serif text-xl text-white mb-1">{time}</p>
                <p className="font-sans text-sm text-cream-200/50">{sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/wedding-details" className="btn-outline-light">
              Full Details <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-cream-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="section-subheading mb-3">Dress Code</p>
            <h2 className="section-heading">
              Explore the<br />
              <em className="text-gold-600">Asoebi</em> Collection
            </h2>
            <div className="divider-gold" />
            <p className="font-sans text-dark-500 max-w-xl mx-auto text-sm leading-relaxed">
              Asoebi fabric is <strong>mandatory</strong> for seating inside the event hall.
              Deadline: <strong>July 31, 2026</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map(cat => (
              <Link key={cat.title} to={cat.href} className="group relative overflow-hidden">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-dark-950/40 group-hover:bg-dark-950/20 transition-all duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-serif text-sm font-light text-white text-center text-shadow">{cat.title}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/asoebe" className="btn-primary">
              Shop Asoebi <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-28">
        <div className="absolute inset-0">
          <img
            src="/CTA.jpg"
            alt="Wedding celebration"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-dark-950/75" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <span className="font-serif text-5xl text-gold-300/60 leading-none">"</span>
          <p className="font-serif text-2xl md:text-3xl italic font-light text-white leading-relaxed -mt-4 mb-8 text-shadow">
            Two souls, one journey. Thank you for being part of the most beautiful chapter of our story.
          </p>
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-400">— TheCNLovestory Part III</p>
        </div>
      </section>

      <section className="py-20 bg-dark-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="section-subheading text-gold-400 mb-3">Show Your Love</p>
          <h2 className="font-serif text-4xl text-white font-light mb-4">
            Send a Gift
          </h2>
          <div className="divider-gold" />
          <p className="font-sans text-cream-200/60 text-sm leading-relaxed max-w-xl mx-auto mb-8">
            Please do not bring physical gifts — the couple is not based in Nigeria.
            You can show your love through our secure gift transfer page.
          </p>
          <Link to="/gifts" className="btn-primary">
            Send a Gift <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
