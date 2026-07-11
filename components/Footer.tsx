'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { usePageContent } from '@/lib/use-page-content';

function FacebookIcon() {
  return <svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4'><path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' /></svg>;
}
function InstagramIcon() {
  return <svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' /></svg>;
}
function WhatsAppIcon() {
  return <svg viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' /></svg>;
}

function sentenceCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function Footer() {
  const { lang } = useLanguage();
  const { get } = usePageContent('global');
  const [dbTours, setDbTours] = useState<{ id: string; name_es: string; name_en: string }[]>([]);

  useEffect(() => {
    fetch('/api/tours')
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) ? setDbTours(data) : null)
      .catch(() => {});
  }, []);

  const tagline = get('footer_tagline',  lang) || (lang === 'es' ? 'Tu agencia de confianza para descubrir la magia de Colombia.' : 'Your trusted agency to discover the magic of Colombia.');
  const phone   = get('contact_phone',   'es') || '+57 300 123 4567';
  const email   = get('contact_email',   'es') || 'hola@mavicuretours.com';
  const address = get('contact_address', lang) || 'Bogotá, Colombia';
  const fbUrl   = get('footer_fb_url',   'es') || 'https://facebook.com/mavicuretours';
  const igUrl   = get('footer_ig_url',   'es') || 'https://instagram.com/mavicuretours';
  const waNum   = (get('contact_whatsapp', 'es') || '573001234567').replace(/\D/g, '');
  const waUrl   = `https://wa.me/${waNum}?text=${encodeURIComponent('Hola, me interesa información sobre los tours de Colombia')}`;

  const navGroups = [
    {
      title: 'Tours',
      items: dbTours.map(t => ({ label: sentenceCase(lang === 'es' ? t.name_es : (t.name_en || t.name_es)), href: `/tours/${t.id}` })),
    },
    {
      title: lang === 'es' ? 'Empresa' : 'Company',
      items: [
        { label: lang === 'es' ? 'Nosotros' : 'About Us', href: '/nosotros' },
      ],
    },
    {
      title: lang === 'es' ? 'Soporte' : 'Support',
      items: [
        { label: lang === 'es' ? 'Reservar' : 'Book', href: '/tours' },
        { label: lang === 'es' ? 'Contacto' : 'Contact', href: '/contacto' },
      ],
    },
  ];

  return (
    <footer className='bg-gray-950 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='grid lg:grid-cols-5 gap-10 mb-12'>
          <div className='lg:col-span-2'>
            <div className='mb-5'>
              <Image src='/logo.png' alt='Mavicure Travel Tours' width={120} height={120} className='h-20 w-auto' />
            </div>
            <p className='text-gray-400 text-sm leading-relaxed mb-6 max-w-xs'>{tagline}</p>
            <div className='space-y-2 text-sm text-gray-400'>
              <div className='flex items-center gap-2'><MapPin className='w-4 h-4 text-emerald-500 flex-shrink-0' /><span>{address}</span></div>
              <div className='flex items-center gap-2'><Phone className='w-4 h-4 text-emerald-500 flex-shrink-0' /><a href={`tel:${phone.replace(/\s/g,'')}`} className='hover:text-emerald-400 transition-colors'>{phone}</a></div>
              <div className='flex items-center gap-2'><Mail className='w-4 h-4 text-emerald-500 flex-shrink-0' /><a href={`mailto:${email}`} className='hover:text-emerald-400 transition-colors'>{email}</a></div>
            </div>
            <div className='flex gap-3 mt-6'>
              <a href={fbUrl} target='_blank' rel='noopener noreferrer' aria-label='Facebook' className='w-9 h-9 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors'><FacebookIcon /></a>
              <a href={igUrl} target='_blank' rel='noopener noreferrer' aria-label='Instagram' className='w-9 h-9 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-colors'><InstagramIcon /></a>
              <a href={waUrl} target='_blank' rel='noopener noreferrer' aria-label='WhatsApp' className='w-9 h-9 rounded-full bg-white/10 hover:bg-green-600 flex items-center justify-center transition-colors'><WhatsAppIcon /></a>
            </div>
          </div>
          {navGroups.map(g => (
            <div key={g.title}>
              <h4 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>{g.title}</h4>
              <ul className='space-y-2'>
                {g.items.map(item => <li key={item.label}><Link href={item.href} className='text-gray-400 hover:text-emerald-400 text-sm transition-colors'>{item.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className='border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500'>
          <p>© {new Date().getFullYear()} Mavicure Travel Tours. {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
          <div className='flex gap-6'>
            <Link href='#' className='hover:text-gray-300 transition-colors'>{lang === 'es' ? 'Privacidad' : 'Privacy'}</Link>
            <Link href='#' className='hover:text-gray-300 transition-colors'>{lang === 'es' ? 'Términos' : 'Terms'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
