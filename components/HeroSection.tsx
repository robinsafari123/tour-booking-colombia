'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { usePageContent, type PageContent } from '@/lib/use-page-content';

function scrollBelowHero() {
  const hero = document.querySelector('section');
  if (hero) window.scrollTo({ top: hero.offsetHeight, behavior: 'smooth' });
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1920&q=90';

export default function HeroSection({ initialContent }: { initialContent?: PageContent }) {
  const { t, lang } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const { get, getSize } = usePageContent('home', initialContent);

  const heroImage = get('hero_image', 'es') || DEFAULT_IMAGE;
  const heroTitle = get('hero_title', lang);
  const heroSlogan = get('hero_slogan', lang);

  useEffect(() => {
    const img = new Image();
    img.src = heroImage;
    img.onload = () => setLoaded(true);
  }, [heroImage]);

  return (
    <section className='relative h-screen min-h-[680px] flex flex-col items-center justify-center overflow-hidden'>
      {/* Background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70' />

      {/* Content */}
      <div className='relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center'>
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          style={getSize('hero_title')}
          className='font-heading text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight'
        >
          {heroTitle || (lang === 'es' ? (
            <>Descubre la<br /><span className='text-emerald-400'>Colombia</span> real</>
          ) : (
            <>Discover the<br /><span className='text-emerald-400'>real Colombia</span></>
          ))}
        </motion.h1>

        {/* Slogan */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={getSize('hero_slogan')}
          className='text-white/85 text-2xl md:text-3xl max-w-3xl mx-auto mb-10 leading-snug font-heading font-light italic'
        >
          {heroSlogan || (lang === 'es'
            ? '"Explora lo auténtico, siente lo nuestro en la tierra de muchas Aguas"'
            : '"Explore the authentic, feel what is ours in the land of many Waters"')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className='flex flex-col sm:flex-row gap-4 justify-center'
        >
          <button
            onClick={() => router.push('/tours')}
            className='inline-flex items-center justify-center px-9 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5'
          >
            {get('hero_cta_tours', lang) || t('hero.cta.tours')}
          </button>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollBelowHero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className='absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white flex flex-col items-center gap-2 transition-colors'
        aria-label='Scroll down'
      >
        <span className='text-xs font-medium tracking-widest uppercase'>
          {lang === 'es' ? 'Explorar' : 'Explore'}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown className='w-5 h-5' />
        </motion.div>
      </motion.button>
    </section>
  );
}
