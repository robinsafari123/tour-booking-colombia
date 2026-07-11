'use client';

import { usePageContent } from '@/lib/use-page-content';
import { useLanguage } from '@/lib/language-context';

interface PageHeroProps {
  page: string;
  defaults: {
    badge?: { es: string; en: string };
    title: { es: string; en: string };
    subtitle?: { es: string; en: string };
  };
}

export default function PageHero({ page, defaults }: PageHeroProps) {
  const { get, getSize } = usePageContent(page);
  const { lang } = useLanguage();

  const bgImage = get('hero_image', 'es');
  const title = get('hero_title', lang) || defaults.title[lang];
  const subtitle = get('hero_subtitle', lang) || defaults.subtitle?.[lang] || '';
  const badge = get('hero_badge', lang) || defaults.badge?.[lang] || '';

  return (
    <div
      className="relative bg-emerald-900 py-24 text-center overflow-hidden"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {bgImage && <div className="absolute inset-0 bg-emerald-900/65" />}
      <div className="relative z-10 px-6">
        {badge && (
          <span className="inline-block text-emerald-300 font-semibold text-sm uppercase tracking-widest mb-3">
            {badge}
          </span>
        )}
        <h1 style={getSize('hero_title')} className="font-heading text-5xl md:text-7xl font-bold text-white mb-4">{title}</h1>
        {subtitle && (
          <p style={getSize('hero_subtitle')} className="text-emerald-200 text-xl max-w-xl mx-auto">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
