'use client';

import { motion } from 'framer-motion';
import { Clock, Users, Star, MapPin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/language-context';
import { usePageContent } from '@/lib/use-page-content';
import { tours, formatCOP } from '@/components/ToursSection';
import Link from 'next/link';

const featured = tours.slice(0, 3);

export default function FeaturedTours() {
  const { lang, t } = useLanguage();
  const { get, getSize } = usePageContent('home');

  return (
    <section className='py-24 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <span className='inline-block text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3'>
            {get('featured_label', lang) || (lang === 'es' ? 'Destinos' : 'Destinations')}
          </span>
          <h2 style={getSize('featured_title')} className='font-heading text-5xl md:text-6xl font-bold text-gray-900 mb-4'>
            {get('featured_title', lang) || (lang === 'es' ? 'Tours destacados' : 'Featured Tours')}
          </h2>
          <p style={getSize('featured_subtitle')} className='text-gray-500 max-w-xl mx-auto text-lg'>
            {get('featured_subtitle', lang) || (lang === 'es' ? 'Experiencias únicas diseñadas para descubrir la Colombia auténtica.' : 'Unique experiences designed to discover authentic Colombia.')}
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
          {featured.map((tour, i) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className='overflow-hidden group hover:shadow-2xl transition-shadow duration-500 border-0 rounded-2xl h-full'>
                <div className='relative h-56 overflow-hidden'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tour.image} alt={tour.name[lang]}
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
                  <span className={`absolute top-3 left-3 ${tour.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                    {tour.badge[lang]}
                  </span>
                  <div className='absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1'>
                    <Star className='w-3.5 h-3.5 text-amber-400 fill-amber-400' />
                    <span className='text-xs font-bold text-gray-800'>{tour.rating}</span>
                  </div>
                </div>
                <CardContent className='p-5 flex flex-col flex-1'>
                  <div className='flex items-center gap-1 text-emerald-600 text-xs font-medium mb-2'>
                    <MapPin className='w-3.5 h-3.5' />{tour.location}
                  </div>
                  <h3 className='font-heading font-bold text-gray-900 text-xl mb-2'>{tour.name[lang]}</h3>
                  <p className='text-gray-500 text-sm mb-4 leading-relaxed flex-1'>{tour.description[lang]}</p>
                  <div className='flex items-center gap-4 text-xs text-gray-400 mb-4'>
                    <span className='flex items-center gap-1'><Clock className='w-3.5 h-3.5' />{tour.duration[lang]}</span>
                    <span className='flex items-center gap-1'><Users className='w-3.5 h-3.5' />{tour.groupSize}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='text-xl font-bold text-gray-900'>{formatCOP(tour.priceCOP)}</span>
                      <span className='text-gray-400 text-xs'>/persona</span>
                    </div>
                    <Link href='/reservar'
                      className='flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors gap-1 group/btn'>
                      {t('tours.book')}
                      <ArrowRight className='w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform' />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className='text-center'>
          <Link href='/tours'
            className='inline-flex items-center gap-2 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold px-8 py-3 rounded-full transition-all duration-300'>
            {get('featured_viewall', lang) || (lang === 'es' ? 'Ver todos los tours' : 'View all tours')}
            <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </section>
  );
}
