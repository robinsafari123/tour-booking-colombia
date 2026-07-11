'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { usePageContent } from '@/lib/use-page-content';

function WhatsAppIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
    </svg>
  );
}

export default function ContactSection() {
  const { lang } = useLanguage();
  const { get } = usePageContent('contacto');
  const { get: getGlobal } = usePageContent('global');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const title    = get('contact_section_title',    lang) || (lang === 'es' ? 'Hablemos de tu\nviaje soñado' : "Let's talk about\nyour dream trip");
  const subtitle = get('contact_section_subtitle', lang) || (lang === 'es' ? 'Nuestro equipo está listo para ayudarte a planear la experiencia colombiana perfecta. Escríbenos por cualquier canal.' : 'Our team is ready to help you plan the perfect Colombian experience. Reach us through any channel.');

  const phone   = getGlobal('contact_phone',     'es') || '+57 300 123 4567';
  const email   = getGlobal('contact_email',     'es') || 'hola@mavicuretours.com';
  const address = getGlobal('contact_address',   lang) || 'Bogotá, Colombia';
  const waNumber = (getGlobal('contact_whatsapp', 'es') || '573001234567').replace(/\D/g, '');
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Hola, me interesa información sobre los tours de Colombia')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      label: lang === 'es' ? 'Teléfono' : 'Phone',
      value: phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: lang === 'es' ? 'Correo electrónico' : 'Email',
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: MapPin,
      label: lang === 'es' ? 'Ubicación' : 'Location',
      value: address,
      href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
    },
  ];

  return (
    <section className='py-24 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-16 items-start'>

          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className='font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6' style={{ whiteSpace: 'pre-line' }}>
              {title}
            </h2>
            <p className='text-gray-500 text-lg leading-relaxed mb-10'>
              {subtitle}
            </p>

            {/* Contact cards */}
            <div className='space-y-4 mb-8'>
              {contactInfo.map((item) => (
                <a key={item.label} href={item.href} target='_blank' rel='noopener noreferrer'
                  className='flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 transition-colors group'>
                  <div className='w-11 h-11 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors flex-shrink-0'>
                    <item.icon className='w-5 h-5 text-emerald-600' />
                  </div>
                  <div>
                    <p className='text-xs text-gray-400 font-medium'>{item.label}</p>
                    <p className='text-gray-900 font-semibold'>{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* WhatsApp highlight */}
            <a href={waUrl} target='_blank' rel='noopener noreferrer'
              className='flex items-center gap-4 p-5 rounded-2xl bg-green-500 hover:bg-green-600 text-white transition-colors group'>
              <div className='w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0'>
                <WhatsAppIcon />
              </div>
              <div>
                <p className='font-bold text-lg'>WhatsApp</p>
                <p className='text-green-100 text-sm'>
                  {lang === 'es' ? 'Respuesta inmediata · chat directo' : 'Instant reply · direct chat'}
                </p>
              </div>
              <Send className='w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform' />
            </a>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {sent ? (
              <div className='bg-emerald-50 border border-emerald-200 rounded-3xl p-14 text-center flex flex-col items-center gap-4'>
                <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-8 h-8 text-emerald-600' />
                </div>
                <h3 className='font-heading text-2xl font-bold text-gray-900'>
                  {lang === 'es' ? '¡Mensaje enviado!' : 'Message sent!'}
                </h3>
                <p className='text-gray-500'>
                  {lang === 'es' ? 'Te respondemos en menos de 24 horas.' : 'We\'ll reply within 24 hours.'}
                </p>
                <Button variant='outline' onClick={() => setSent(false)} className='mt-2 rounded-full border-emerald-300 text-emerald-700'>
                  {lang === 'es' ? 'Enviar otro mensaje' : 'Send another'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='bg-gray-50 rounded-3xl p-8 space-y-5'>
                <div className='grid sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name' className='text-sm font-medium text-gray-700'>
                      {lang === 'es' ? 'Nombre completo' : 'Full name'}
                    </Label>
                    <Input id='name' name='name' required placeholder='Ana García'
                      value={form.name} onChange={handleChange}
                      className='rounded-xl border-gray-200 bg-white focus:border-emerald-400 h-11' />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
                      {lang === 'es' ? 'Correo electrónico' : 'Email'}
                    </Label>
                    <Input id='email' name='email' type='email' required placeholder='ana@ejemplo.com'
                      value={form.email} onChange={handleChange}
                      className='rounded-xl border-gray-200 bg-white focus:border-emerald-400 h-11' />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phone' className='text-sm font-medium text-gray-700'>
                    {lang === 'es' ? 'Teléfono / WhatsApp' : 'Phone / WhatsApp'}
                  </Label>
                  <Input id='phone' name='phone' type='tel' placeholder='+57 300 123 4567'
                    value={form.phone} onChange={handleChange}
                    className='rounded-xl border-gray-200 bg-white focus:border-emerald-400 h-11' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='message' className='text-sm font-medium text-gray-700'>
                    {lang === 'es' ? 'Mensaje' : 'Message'}
                  </Label>
                  <textarea id='message' name='message' required rows={5}
                    placeholder={lang === 'es' ? '¿En qué tour estás interesado? ¿Cuántas personas? ¿Fechas?' : 'Which tour? How many people? Dates?'}
                    value={form.message} onChange={handleChange}
                    className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none' />
                </div>
                <Button type='submit' disabled={loading}
                  className='w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 text-base font-semibold gap-2 h-12'>
                  {loading
                    ? <><Loader2 className='w-4 h-4 animate-spin' />{lang === 'es' ? 'Enviando...' : 'Sending...'}</>
                    : <>{lang === 'es' ? 'Enviar mensaje' : 'Send message'} <Send className='w-4 h-4' /></>
                  }
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
