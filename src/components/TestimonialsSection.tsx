'use client';

import { motion } from 'framer-motion';
import { TestimonialsColumn, type Testimonial } from '@/components/ui/testimonials-columns-1';

const testimonials: Testimonial[] = [
  {
    text: 'La expedición a los cerros de Mavicure fue simplemente increíble. Jamás había visto algo así — roca pura rodeada de selva amazónica. El guía Carlos lo sabe todo sobre la región.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    name: 'Sarah M.',
    role: 'New York, USA — Mavicure Hills',
  },
  {
    text: 'Despertar en una finca cafetera rodeado de montañas verdes, aprender a recoger café y probar la mejor taza de mi vida. Una experiencia absolutamente perfecta.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    name: 'Thomas B.',
    role: 'Berlín, Alemania — Región Cafetera',
  },
  {
    text: 'Tayrona fue impresionante. La caminata por la selva hasta llegar a Cabo San Juan valió cada paso. El equipo de Mavicure organizó todo perfectamente.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    name: 'Amira K.',
    role: 'Londres, UK — Tayrona',
  },
  {
    text: 'Siete días en el Amazonas colombiano fueron un sueño. Delfines rosados, fauna increíble, noches escuchando la selva. Cada centavo del precio premium valió la pena.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    name: 'James L.',
    role: 'Sídney, Australia — Amazonas Eco',
  },
  {
    text: 'Cartagena me robó el corazón. El tour por la ciudad amurallada, el crucero al atardecer y el esnórquel en las islas del Rosario — todo en un mismo paquete bien organizado.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80',
    name: 'María C.',
    role: 'Madrid, España — Cartagena',
  },
  {
    text: 'El tour a Bogotá superó todas mis expectativas. El Museo del Oro, el cerro Monserrate y el mercado de Usaquén fueron mis favoritos. Guía bilingüe excelente.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    name: 'Lucas F.',
    role: 'São Paulo, Brasil — Bogotá City',
  },
  {
    text: 'Reservar fue facilísimo y el equipo respondió en minutos por WhatsApp. Durante el tour, todo estuvo impecable. Ya estoy planeando mi próximo viaje con ellos.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
    name: 'Nicolás R.',
    role: 'Buenos Aires, Argentina — Coffee Region',
  },
  {
    text: 'Como viajera sola, me sentí completamente segura en todo momento. Los guías son profesionales, amables y conocen cada rincón de Colombia a la perfección.',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80',
    name: 'Emma P.',
    role: 'Toronto, Canadá — Tayrona',
  },
  {
    text: 'La experiencia en el Amazonas con la ceremonia del chamán y el avistamiento de delfines fue algo que nunca olvidaré. Colombia es un destino mágico.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    name: 'Henrik S.',
    role: 'Estocolmo, Suecia — Amazonas Eco',
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function TestimonialsSection() {
  return (
    <section id='testimonials' className='py-24 bg-emerald-900 overflow-hidden relative'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className='flex flex-col items-center justify-center max-w-[540px] mx-auto mb-12'
        >
          <div className='flex justify-center mb-4'>
            <div className='border border-emerald-400/40 text-emerald-300 py-1 px-4 rounded-lg text-sm font-medium'>
              Testimonios
            </div>
          </div>
          <h2 className='text-5xl md:text-6xl font-bold font-heading text-white text-center tracking-tight'>
            Lo que dicen nuestros viajeros
          </h2>
          <p className='text-center mt-4 text-emerald-200/75 text-lg'>
            Historias reales de personas que exploraron Colombia con nosotros.
          </p>
        </motion.div>

        <div className='flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[700px] overflow-hidden'>
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn testimonials={secondColumn} className='hidden md:block' duration={22} />
          <TestimonialsColumn testimonials={thirdColumn} className='hidden lg:block' duration={15} />
        </div>
      </div>
    </section>
  );
}
