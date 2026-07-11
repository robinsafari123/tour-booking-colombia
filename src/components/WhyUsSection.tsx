'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Headphones, Map, Leaf, CreditCard, Star } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { usePageContent } from '@/lib/use-page-content';

const ICONS = [Map, ShieldCheck, Headphones, Leaf, CreditCard, Star];
const COLORS = [
  'bg-emerald-50 text-emerald-600',
  'bg-blue-50 text-blue-600',
  'bg-violet-50 text-violet-600',
  'bg-lime-50 text-lime-600',
  'bg-amber-50 text-amber-600',
  'bg-rose-50 text-rose-600',
];
const DEFAULTS = [
  { title: { es: 'Itinerarios a medida', en: 'Custom Itineraries' }, desc: { es: 'Cada viaje está diseñado según tus intereses, ritmo y presupuesto. Sin paquetes estándar.', en: 'Every trip is tailored to your interests, pace, and budget. No cookie-cutter packages.' } },
  { title: { es: 'Seguridad primero', en: 'Safety First' }, desc: { es: 'Guías certificados, seguros de viaje y soporte de emergencia 24/7 en cada tour.', en: 'Certified guides, travel insurance partnerships, and 24/7 emergency support on every tour.' } },
  { title: { es: 'Soporte 24/7', en: '24/7 Support' }, desc: { es: 'Nuestro equipo local siempre está disponible — antes, durante y después de tu viaje.', en: 'Our local team is always reachable — before, during, and after your journey.' } },
  { title: { es: 'Turismo consciente', en: 'Eco-Conscious' }, desc: { es: 'Viaje de bajo impacto que apoya comunidades indígenas y preserva los ecosistemas de Colombia.', en: "Low-impact travel that supports indigenous communities and preserves Colombia's ecosystems." } },
  { title: { es: 'Precios transparentes', en: 'Transparent Pricing' }, desc: { es: 'Sin cargos ocultos. Lo que ves es lo que pagas — con opciones de pago flexibles.', en: 'No hidden fees. What you see is what you pay — with flexible payment options available.' } },
  { title: { es: 'Guías mejor valorados', en: 'Top-Rated Guides' }, desc: { es: 'Nuestros guías tienen un promedio de 4.9 estrellas. Son narradores, naturalistas y amigos.', en: "Our guides average a 4.9-star rating. They're storytellers, naturalists, and friends." } },
];

export default function WhyUsSection() {
  const { lang } = useLanguage();
  const { get, getSize } = usePageContent('home');

  const label    = get('whyus_label',    lang) || (lang === 'es' ? 'Por qué Mavicure'             : 'Why Mavicure');
  const title    = get('whyus_title',    lang) || (lang === 'es' ? 'La diferencia Mavicure'        : 'The Mavicure Difference');
  const subtitle = get('whyus_subtitle', lang) || (lang === 'es' ? 'Vamos más allá de los tours. Creamos recuerdos que permanecen contigo.' : 'We go beyond tours. We create memories that stay with you.');

  return (
    <section id='why-us' className='py-24 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <span className='inline-block text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3'>{label}</span>
          <h2 style={getSize('whyus_title')} className='text-5xl md:text-6xl font-bold font-heading text-gray-900 mb-4'>{title}</h2>
          <p style={getSize('whyus_subtitle')} className='text-gray-500 max-w-xl mx-auto text-lg'>{subtitle}</p>
        </motion.div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {DEFAULTS.map((def, i) => {
            const n = i + 1;
            if (get(`whyus_card${n}_title_hidden`, 'es') === '1') return null;
            const Icon = ICONS[i];
            const cardTitle = get(`whyus_card${n}_title`, lang) || def.title[lang];
            const cardDesc  = get(`whyus_card${n}_desc`,  lang) || def.desc[lang];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className='bg-white rounded-2xl p-7 hover:shadow-xl transition-shadow duration-300 group'
              >
                <div className={`w-12 h-12 rounded-2xl ${COLORS[i]} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className='w-5 h-5' />
                </div>
                <h3 style={getSize(`whyus_card${n}_title`)} className='font-bold text-gray-900 text-lg mb-2'>{cardTitle}</h3>
                <p style={getSize(`whyus_card${n}_desc`)} className='text-gray-500 text-sm leading-relaxed'>{cardDesc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
