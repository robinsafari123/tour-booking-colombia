'use client';

import { useLanguage } from '@/lib/language-context';

export default function HeroContent() {
  const { t } = useLanguage();

  return (
    <div className='max-w-4xl mx-auto text-center'>
      <h2 className='text-3xl font-bold text-gray-900 mb-4'>
        {t('hero.title')}
      </h2>
      <p className='text-gray-500 text-lg mb-8 max-w-2xl mx-auto'>
        {t('hero.subtitle')}
      </p>
      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <a
          href='#tours'
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#tours')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className='inline-flex items-center justify-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-colors'
        >
          {t('hero.cta.tours')}
        </a>
        <a
          href='#booking'
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className='inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 font-semibold rounded-full transition-colors'
        >
          {t('hero.cta.book')}
        </a>
      </div>
    </div>
  );
}
