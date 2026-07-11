'use client';

import { useLanguage, type Lang } from '@/lib/language-context';

export default function LangSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLanguage();

  const options: { code: Lang; flag: string; label: string }[] = [
    { code: 'en', flag: '🇬🇧', label: 'EN' },
    { code: 'es', flag: '🇨🇴', label: 'ES' },
  ];

  return (
    <div
      role='group'
      aria-label='Select language'
      className={`flex items-center rounded-full p-0.5 gap-0.5 ${
        dark ? 'bg-white/10' : 'bg-gray-100'
      }`}
    >
      {options.map(({ code, flag, label }) => {
        const active = lang === code;
        return (
          <button
            key={code}
            aria-pressed={active}
            onClick={() => setLang(code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold
              transition-all duration-150 cursor-pointer select-none
              ${active
                ? 'bg-emerald-600 text-white shadow-sm'
                : dark
                  ? 'text-white/70 hover:text-white'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            <span className='text-base leading-none'>{flag}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
