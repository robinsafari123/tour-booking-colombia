'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { Clock, Users, MapPin, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/language-context';
import { usePageContent } from '@/lib/use-page-content';

export const tours = [
  {
    id: 1,
    name: { es: 'Expedición Cerros de Mavicure', en: 'Mavicure Hills Expedition' },
    location: 'Guainía, Colombia',
    duration: { es: '5 Días', en: '5 Days' },
    groupSize: '4–12',
    rating: 4.9,
    reviews: 128,
    priceCOP: 3_900_000,
    badge: { es: 'Más Vendido', en: 'Best Seller' },
    badgeColor: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
    description: {
      es: 'Trekking por las místicas colinas de granito de Mavicure en el corazón del Amazonas, con guías indígenas expertos.',
      en: 'Trek through the mystical granite hills of Mavicure in the heart of the Amazon, guided by indigenous experts.',
    },
    highlights: {
      es: ['Cima Cerro Mavicure', 'Comunidades indígenas', 'Kayak Río Inírida'],
      en: ['Cerro Mavicure summit', 'Indigenous villages', 'Río Inírida kayaking'],
    },
  },
  {
    id: 2,
    name: { es: 'Tour Ciudad Amurallada Cartagena', en: 'Cartagena Old City Walk' },
    location: 'Cartagena, Colombia',
    duration: { es: '3 Días', en: '3 Days' },
    groupSize: '2–16',
    rating: 4.8,
    reviews: 214,
    priceCOP: 1_980_000,
    badge: { es: 'Popular', en: 'Popular' },
    badgeColor: 'bg-amber-500',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    description: {
      es: 'Descubre los vibrantes colores, la arquitectura colonial y la cultura caribeña de Cartagena, Patrimonio UNESCO.',
      en: 'Discover the vibrant colors, colonial architecture, and Caribbean culture of UNESCO-listed Cartagena.',
    },
    highlights: {
      es: ['Tour Ciudad Amurallada', 'Snórquel Islas del Rosario', 'Crucero al atardecer'],
      en: ['Walled City tour', 'Rosario Islands snorkel', 'Sunset cruise'],
    },
  },
  {
    id: 3,
    name: { es: 'Retiro en la Región Cafetera', en: 'Coffee Region Retreat' },
    location: 'Eje Cafetero, Colombia',
    duration: { es: '4 Días', en: '4 Days' },
    groupSize: '2–10',
    rating: 4.9,
    reviews: 97,
    priceCOP: 2_720_000,
    badge: { es: 'Nuevo', en: 'New' },
    badgeColor: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    description: {
      es: 'Sumérgete en fincas cafeteras exuberantes, coloridos jeep rides por los Andes y degustaciones de café de clase mundial.',
      en: 'Immerse yourself in lush coffee farms, colorful jeep rides through the Andes, and world-class coffee tasting.',
    },
    highlights: {
      es: ['Tour finca cafetera', 'Pueblo de Salento', 'Caminata Valle del Cocora'],
      en: ['Coffee farm tour', 'Salento village', 'Valle de Cocora hike'],
    },
  },
  {
    id: 4,
    name: { es: 'Selva y Playa Tayrona', en: 'Tayrona Jungle & Beach' },
    location: 'Santa Marta, Colombia',
    duration: { es: '3 Días', en: '3 Days' },
    groupSize: '4–14',
    rating: 4.7,
    reviews: 183,
    priceCOP: 2_280_000,
    badge: { es: 'Aventura', en: 'Adventure' },
    badgeColor: 'bg-orange-500',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    description: {
      es: 'Camina por la selva densa hasta llegar a playas escondidas dentro del Parque Nacional Natural Tayrona.',
      en: 'Hike through dense jungle to reach pristine hidden beaches inside Tayrona National Park.',
    },
    highlights: {
      es: ['Senderos del parque', 'Playa Cabo San Juan', 'Arrecifes de snórquel'],
      en: ['Park jungle trails', 'Cabo San Juan beach', 'Snorkeling reefs'],
    },
  },
  {
    id: 5,
    name: { es: 'Eco Aventura Amazónica', en: 'Amazon Eco Adventure' },
    location: 'Leticia, Colombia',
    duration: { es: '7 Días', en: '7 Days' },
    groupSize: '4–10',
    rating: 5.0,
    reviews: 62,
    priceCOP: 5_500_000,
    badge: { es: 'Premium', en: 'Premium' },
    badgeColor: 'bg-purple-500',
    image: 'https://images.unsplash.com/photo-1504884790557-80daa3a9e621?w=800&q=80',
    description: {
      es: 'Una inmersión profunda en el Amazonas colombiano — avistamiento de fauna, expediciones fluviales y noches en la selva.',
      en: 'A deep-dive into the Colombian Amazon — wildlife spotting, river expeditions, and rainforest nights.',
    },
    highlights: {
      es: ['Avistamiento delfines rosados', 'Ceremonia con chamán', 'Canopy zip-line'],
      en: ['Pink dolphin watching', 'Shaman ceremony', 'Canopy zip-line'],
    },
  },
  {
    id: 6,
    name: { es: 'Bogotá Ciudad y Cerros', en: 'Bogotá City & Cerros' },
    location: 'Bogotá, Colombia',
    duration: { es: '2 Días', en: '2 Days' },
    groupSize: '2–20',
    rating: 4.6,
    reviews: 309,
    priceCOP: 1_230_000,
    badge: { es: 'City Break', en: 'City Break' },
    badgeColor: 'bg-teal-500',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80',
    description: {
      es: 'Explora el arte urbano de La Candelaria, el pico de Monserrate y el oro del Museo del Oro.',
      en: 'Explore La Candelaria\'s street art, Monserrate peak, and the gold of the Museo del Oro.',
    },
    highlights: {
      es: ['Museo del Oro', 'Teleférico Monserrate', 'Mercado de Usaquén'],
      en: ['Museo del Oro', 'Monserrate cable car', 'Usaquén street market'],
    },
  },
];

export function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export interface DbTour {
  id: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  detail_es?: string;
  detail_en?: string;
  price_cop: number;
  duration_es: string;
  duration_en: string;
  destination: string;
  image_url: string;
  badge_es: string;
  badge_en: string;
  badge_color: string;
  rating: number;
  reviews: number;
  group_size: string;
  max_people: number;
}

// Map a DB tour row to the shape the card expects
function toCardTour(t: DbTour, i: number) {
  return {
    id: i,
    dbId: t.id,
    name: { es: t.name_es, en: t.name_en },
    location: t.destination,
    duration: { es: t.duration_es, en: t.duration_en },
    groupSize: t.group_size || `2–${t.max_people}`,
    rating: t.rating ?? 4.8,
    reviews: t.reviews ?? 0,
    priceCOP: t.price_cop,
    badge: { es: t.badge_es || '', en: t.badge_en || '' },
    badgeColor: t.badge_color || 'bg-emerald-500',
    image: t.image_url,
    description: { es: t.description_es, en: t.description_en },
    highlights: { es: [] as string[], en: [] as string[] },
  };
}

export default function ToursSection({ initialTours }: { initialTours?: DbTour[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { lang, t } = useLanguage();
  const router = useRouter();
  const { get } = usePageContent('tours');
  const [displayTours, setDisplayTours] = useState<ReturnType<typeof toCardTour>[]>(
    initialTours ? initialTours.map(toCardTour) : []
  );

  useEffect(() => {
    if (initialTours) return; // already have fresh data from server
    fetch('/api/tours')
      .then((res) => res.ok ? res.json() : null)
      .then((data: DbTour[] | null) => {
        if (data) setDisplayTours(data.map(toCardTour));
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id='tours' className='py-24 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Grid */}
        <div ref={ref} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {displayTours.map((tour, i) => (
            <motion.div
              key={tour.id}
              custom={i}
              variants={cardVariants}
              initial='hidden'
              animate={inView ? 'visible' : 'hidden'}
            >
              <Card className='overflow-hidden group hover:shadow-2xl transition-shadow duration-500 border-0 rounded-2xl pt-0'>
                {/* Image */}
                <div className='relative h-56 overflow-hidden rounded-t-2xl'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tour.image}
                    alt={tour.name[lang]}
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
                  {tour.badge[lang] && (
                    <span className={`absolute top-3 left-3 ${tour.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                      {tour.badge[lang]}
                    </span>
                  )}
                </div>

                <CardContent className='p-5'>
                  <div className='flex items-center gap-1 text-emerald-600 text-xs font-medium mb-2'>
                    <MapPin className='w-3.5 h-3.5' />
                    {tour.location}
                  </div>
                  <h3 className='font-bold text-gray-900 text-lg mb-2 leading-snug'>{tour.name[lang]}</h3>
                  <div className='text-gray-500 text-sm mb-4 leading-relaxed' dangerouslySetInnerHTML={{ __html: tour.description[lang] }} />

                  {/* Highlights */}
                  {tour.highlights[lang].length > 0 && (
                    <div className='flex flex-wrap gap-1.5 mb-4'>
                      {tour.highlights[lang].map((h) => (
                        <Badge key={h} variant='secondary' className='text-xs bg-emerald-50 text-emerald-700 border-emerald-100'>
                          {h}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div className='flex items-center gap-4 text-xs text-gray-500 mb-4'>
                    <span className='flex items-center gap-1'>
                      <Clock className='w-3.5 h-3.5' /> {tour.duration[lang]}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Users className='w-3.5 h-3.5' /> {tour.groupSize}
                    </span>
                  </div>

                  {/* Price + CTA */}
                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='text-xl font-bold text-gray-900'>{formatCOP(tour.priceCOP)}</span>
                      <span className='text-gray-400 text-xs'>/persona</span>
                    </div>
                    <Button
                      size='sm'
                      className='bg-emerald-600 hover:bg-emerald-700 text-white rounded-full gap-1 group/btn'
                      onClick={() => router.push(`/tours/${(tour as { dbId?: string }).dbId || tour.id}`)}
                    >
                      {t('tours.book')}
                      <ArrowRight className='w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
