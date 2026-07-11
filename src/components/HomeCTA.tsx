'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { usePageContent } from '@/lib/use-page-content';

export default function HomeCTA() {
  const { lang } = useLanguage();
  const { get, getSize } = usePageContent('home');

  const title    = get('cta_title',    lang) || (lang === 'es' ? '¿Listo para tu próxima aventura?'                              : 'Ready for your next adventure?');
  const subtitle = get('cta_subtitle', lang) || (lang === 'es' ? 'Contáctanos hoy y diseñamos el viaje perfecto por Colombia.'   : "Contact us today and we'll design the perfect Colombia trip for you.");
  const btn1     = get('cta_btn1',     lang) || (lang === 'es' ? 'Hacer una reserva'                                             : 'Make a Booking');
  const btn2     = get('cta_btn2',     lang) || (lang === 'es' ? 'Contáctanos'                                                   : 'Contact Us');

  return (
    <section className='py-24 bg-emerald-900 relative overflow-hidden'>
      <div className='absolute inset-0 opacity-10'
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=60')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className='absolute inset-0 bg-emerald-900/80' />
      <div className='relative max-w-3xl mx-auto px-6 text-center'>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 style={getSize('cta_title')} className='font-heading text-5xl md:text-6xl font-bold text-white mb-6 leading-tight'>{title}</h2>
          <p style={getSize('cta_subtitle')} className='text-emerald-200 text-xl mb-10 leading-relaxed'>{subtitle}</p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/tours' className='inline-flex items-center justify-center px-9 py-4 bg-white text-emerald-900 font-bold text-lg rounded-full hover:bg-emerald-50 transition-colors shadow-lg'>
              {btn1}
            </Link>
            <Link href='/contacto' className='inline-flex items-center justify-center px-9 py-4 border-2 border-white/40 text-white font-semibold text-lg rounded-full hover:bg-white/10 transition-colors'>
              {btn2}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
