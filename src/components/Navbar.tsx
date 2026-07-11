'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import LangSwitcher from '@/components/ui/lang-switcher';
import { usePageContent } from '@/lib/use-page-content';

function FacebookIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4'>
      <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4'>
      <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4'>
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const { get } = usePageContent('global');

  const isHome = pathname === '/';

  const WHATSAPP_NUMBER = (get('contact_whatsapp', 'es') || '573001234567').replace(/\D/g, '');
  const FACEBOOK_URL = get('footer_fb_url', 'es') || 'https://facebook.com/mavicuretours';
  const INSTAGRAM_URL = get('footer_ig_url', 'es') || 'https://instagram.com/mavicuretours';
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, me interesa información sobre los tours de Colombia')}`;

  const navLinks = [
    { label: get('nav_home', lang) || (lang === 'es' ? 'Inicio' : 'Home'), href: '/' },
    { label: get('nav_tours', lang) || t('nav.tours'), href: '/tours' },
    { label: get('nav_about', lang) || t('nav.about'), href: '/nosotros' },
    { label: get('nav_contact', lang) || t('nav.contact'), href: '/contacto' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // On non-home pages always show white navbar style
  const isTransparent = isHome && !scrolled;

  const textColor = isTransparent ? 'text-white/90' : 'text-gray-700';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
      }`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2'>

        {/* Logo — bigger, clickable */}
        <Link href='/' className='flex-shrink-0 transition-opacity hover:opacity-90'>
          <Image
            src='/logo.png'
            alt='Mavicure Travel Tours'
            width={110}
            height={110}
            className='h-16 w-auto drop-shadow-md'
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className='hidden lg:flex items-center gap-8'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors duration-200 hover:text-emerald-500 relative group ${textColor} ${
                pathname === link.href ? 'text-emerald-500' : ''
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-200 ${
                pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className='hidden lg:flex items-center gap-3'>
          {/* Social icons */}
          <a href={FACEBOOK_URL} target='_blank' rel='noopener noreferrer' aria-label='Facebook'
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isTransparent ? 'text-white/70 hover:text-white hover:bg-white/15' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}>
            <FacebookIcon />
          </a>
          <a href={INSTAGRAM_URL} target='_blank' rel='noopener noreferrer' aria-label='Instagram'
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isTransparent ? 'text-white/70 hover:text-white hover:bg-white/15' : 'text-gray-400 hover:text-pink-600 hover:bg-pink-50'
            }`}>
            <InstagramIcon />
          </a>
          <a href={WHATSAPP_URL} target='_blank' rel='noopener noreferrer' aria-label='WhatsApp'
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isTransparent ? 'text-white/70 hover:text-white hover:bg-white/15' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}>
            <WhatsAppIcon />
          </a>

          <div className={`w-px h-5 ${isTransparent ? 'bg-white/20' : 'bg-gray-200'}`} />

          {/* Language pill switcher */}
          <LangSwitcher dark={isTransparent} />

          <Link href='/tours'>
            <Button size='sm' className='bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-6 font-semibold shadow-sm shadow-emerald-600/20'>
              {get('nav_book', lang) || t('nav.book')}
            </Button>
          </Link>
        </div>

        {/* Mobile right */}
        <div className='lg:hidden flex items-center gap-1'>
          <a href={FACEBOOK_URL} target='_blank' rel='noopener noreferrer'
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isTransparent ? 'text-white/80' : 'text-gray-500'}`}>
            <FacebookIcon />
          </a>
          <a href={INSTAGRAM_URL} target='_blank' rel='noopener noreferrer'
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isTransparent ? 'text-white/80' : 'text-gray-500'}`}>
            <InstagramIcon />
          </a>
          <a href={WHATSAPP_URL} target='_blank' rel='noopener noreferrer'
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isTransparent ? 'text-white/80' : 'text-gray-500'}`}>
            <WhatsAppIcon />
          </a>
          <LangSwitcher dark={isTransparent} />
          <button
            className={`ml-1 transition-colors ${isTransparent ? 'text-white' : 'text-gray-700'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className='lg:hidden bg-white border-t border-gray-100 px-5 py-5 flex flex-col gap-1 shadow-lg'
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-base font-medium py-2.5 border-b border-gray-50 last:border-0 transition-colors hover:text-emerald-600 ${
                  pathname === link.href ? 'text-emerald-600' : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href='/tours' onClick={() => setMobileOpen(false)}>
              <Button className='bg-emerald-600 hover:bg-emerald-500 text-white rounded-full w-full mt-3 py-3 font-semibold'>
                {get('nav_book', lang) || t('nav.book')}
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
