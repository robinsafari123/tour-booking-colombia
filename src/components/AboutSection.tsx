'use client';

import { motion } from 'framer-motion';
import { Award, Heart, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { usePageContent } from '@/lib/use-page-content';

export default function AboutSection() {
  const { lang, t } = useLanguage();
  const { get } = usePageContent('nosotros');

  const label  = get('about_label', lang)  || t('about.label');
  const title  = get('about_title', lang)  || t('about.title');
  const body   = get('about_body',  lang)  || t('about.body');

  const values = [
    {
      icon: Heart,
      title: get('about_value1_title', lang) || t('about.value1.title'),
      desc:  get('about_value1_desc',  lang) || t('about.value1.desc'),
    },
    {
      icon: Award,
      title: get('about_value2_title', lang) || t('about.value2.title'),
      desc:  get('about_value2_desc',  lang) || t('about.value2.desc'),
    },
    {
      icon: Globe,
      title: get('about_value3_title', lang) || t('about.value3.title'),
      desc:  get('about_value3_desc',  lang) || t('about.value3.desc'),
    },
  ];

  const stats = [
    { value: get('about_stat1_value', 'es') || '500+', label: get('about_stat1_label', lang) || t('about.stat1') },
    { value: get('about_stat2_value', 'es') || '12+',  label: get('about_stat2_label', lang) || t('about.stat2') },
    { value: get('about_stat3_value', 'es') || '8',    label: get('about_stat3_label', lang) || t('about.stat3') },
    { value: get('about_stat4_value', 'es') || '4.9★', label: get('about_stat4_label', lang) || t('about.stat4') },
  ];

  return (
    <section id='about' className='py-24 bg-white overflow-hidden'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-16 items-start'>
          {/* Left — image collage */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className='relative'
          >
            <div className='relative h-[480px]'>
              <div className='absolute inset-0 rounded-3xl overflow-hidden shadow-2xl'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={get('about_main_image', 'es') || 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80'}
                  alt='Colombia landscape'
                  className='w-full h-full object-cover object-top'
                />
                <div className='absolute inset-0 bg-emerald-900/20' />
              </div>
              <div className='absolute top-6 -right-6 bg-emerald-600 text-white rounded-2xl px-4 py-3 shadow-lg'>
                <p className='text-2xl font-bold leading-none'>{get('about_badge_years', 'es') || '8+'}</p>
                <p className='text-xs mt-0.5 opacity-90'>{t('about.stat3')}</p>
              </div>
            </div>
          </motion.div>

          {/* Right — text */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className='inline-block text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3'>
              {label}
            </span>
            <h2 className='text-5xl md:text-6xl font-bold font-heading text-gray-900 mb-6 leading-tight whitespace-pre-line'>
              {title}
            </h2>
            <p className='text-gray-500 text-lg leading-relaxed mb-8'>
              {body}
            </p>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
