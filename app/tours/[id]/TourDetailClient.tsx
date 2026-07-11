'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, MapPin, CheckCircle, Send, Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { formatCOP } from '@/components/ToursSection';
import type { DbTour } from '@/components/ToursSection';
import Link from 'next/link';
import CalendarPicker from '@/components/ui/calendar-picker';
import { getAllowedDays } from '@/lib/tour-booking-days';
import { getCartItems, addCartItem, removeCartItem } from '@/lib/cart';

type Status = 'idle' | 'submitting' | 'submitted' | 'paying' | 'error';
type Gateway = 'wompi' | 'payu' | 'mercadopago' | 'paypal';

const GATEWAYS = [
  { id: 'wompi' as Gateway,       name: 'Wompi',        desc: 'Tarjeta · PSE · Nequi · Daviplata', installments: true,  color: '#00C3A5', badge: 'Colombia' },
  { id: 'payu' as Gateway,        name: 'PayU',         desc: 'Tarjeta · PSE · Efecty · Baloto',   installments: true,  color: '#1B3A6B', badge: 'Más métodos' },
  { id: 'mercadopago' as Gateway, name: 'Mercado Pago', desc: 'Tarjeta · Wallet · PSE',             installments: true,  color: '#00B1EA' },
  { id: 'paypal' as Gateway,      name: 'PayPal',       desc: 'Tarjeta internacional · PayPal',    installments: false, color: '#003087', badge: 'Internacional' },
];

export default function TourDetailClient({ tour }: { tour: DbTour }) {
  const { lang } = useLanguage();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [bookingId, setBookingId] = useState('');
  const [payingGateway, setPayingGateway] = useState<Gateway | null>(null);
  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuParams, setPayuParams] = useState<Record<string, string> | null>(null);
  const [payuAction, setPayuAction] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: '4', message: '' });
  const [enabledGateways, setEnabledGateways] = useState<Record<string, boolean>>({
    wompi: true, payu: true, mercadopago: true, paypal: true,
  });

  const allowedDays = getAllowedDays(tour.name_es);
  const name = lang === 'es' ? tour.name_es : tour.name_en;
  const shortDesc = lang === 'es' ? tour.description_es : tour.description_en;
  const detail = lang === 'es'
    ? (tour.detail_es || tour.description_es)
    : (tour.detail_en || tour.description_en);
  const duration = lang === 'es' ? tour.duration_es : tour.duration_en;
  const totalCOP = tour.price_cop * Number(form.guests);

  useEffect(() => {
    fetch('/api/payment/gateways')
      .then((r) => r.json())
      .then((data) => setEnabledGateways(data))
      .catch(() => { /* keep defaults */ });

    // Resume from cart if CartWidget sent us here
    const resumeId = sessionStorage.getItem('mavicure_resume_id');
    if (resumeId) {
      sessionStorage.removeItem('mavicure_resume_id');
      const saved = getCartItems().find((i) => i.bookingId === resumeId) ?? null;
      if (saved) {
        setForm({ name: saved.customerName, email: saved.email, phone: saved.phone, guests: saved.guests, message: saved.message });
        setSelectedDate(saved.date ? new Date(saved.date + 'T12:00:00') : undefined);
        setBookingId(saved.bookingId);
        setStatus('idle'); // show pre-filled form so user can edit details
      }
    }

    function onResume(e: Event) {
      const item = (e as CustomEvent).detail;
      if (!item) return;
      setForm({ name: item.customerName, email: item.email, phone: item.phone, guests: item.guests, message: item.message });
      setSelectedDate(item.date ? new Date(item.date + 'T12:00:00') : undefined);
      setBookingId(item.bookingId);
      setStatus('submitted');
    }
    window.addEventListener('resumeBooking', onResume);
    return () => window.removeEventListener('resumeBooking', onResume);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
    const payload = {
      tour_name: name,
      customer_name: form.name,
      email: form.email,
      phone: form.phone,
      date: dateStr,
      num_people: Number(form.guests),
      notes: form.message,
      total_cop: totalCOP,
    };

    try {
      let resolvedBookingId = bookingId;
      if (bookingId) {
        const res = await fetch('/api/bookings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error');
      } else {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error');
        resolvedBookingId = data.bookingId;
        setBookingId(resolvedBookingId);
      }

      addCartItem({
        bookingId: resolvedBookingId,
        tourId: tour.id,
        tourIndex: '',
        tourName: name,
        date: dateStr,
        guests: form.guests,
        totalCOP,
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        createdAt: new Date().toISOString(),
      });
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      setStatus('submitted');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido');
      setStatus('error');
    }
  }

  async function handleGatewayPayment(gateway: Gateway) {
    if (!bookingId) return;
    setPayingGateway(gateway);
    setStatus('paying');
    try {
      const res = await fetch(`/api/payment/${gateway}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          tourName: name,
          customerName: form.name,
          email: form.email,
          phone: form.phone,
          totalCop: totalCOP,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      removeCartItem(bookingId);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      if (gateway === 'payu') {
        setPayuAction(data.checkoutUrl);
        setPayuParams(data.params);
        setTimeout(() => payuFormRef.current?.submit(), 50);
      } else {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al iniciar pago');
      setStatus('submitted');
      setPayingGateway(null);
    }
  }

  return (
    <>
      {/* Hero */}
      <div className='relative h-[50vh] min-h-[340px] overflow-hidden'>
        {tour.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tour.image_url} alt={name} className='w-full h-full object-cover' />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent' />
        <div className='absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-5xl mx-auto'>
          <Link href='/tours' className='inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors'>
            <ArrowLeft className='w-4 h-4' />
            {lang === 'es' ? 'Todos los tours' : 'All tours'}
          </Link>
          <h1 className='font-heading text-4xl md:text-5xl font-bold text-white mb-3'>{name}</h1>
          <div className='flex flex-wrap items-center gap-4 text-white/80 text-sm'>
            <span className='flex items-center gap-1.5'><MapPin className='w-4 h-4' />{tour.destination}</span>
            <span className='flex items-center gap-1.5'><Clock className='w-4 h-4' />{duration}</span>
            <span className='flex items-center gap-1.5'><Users className='w-4 h-4' />{lang === 'es' ? `Desde ${tour.max_people} personas` : `From ${tour.max_people} people`}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className='py-16 bg-white'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-16 items-start'>

            {/* Left — description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                {lang === 'es' ? 'Acerca de este tour' : 'About this tour'}
              </h2>
              <div className='text-gray-600 leading-relaxed prose prose-sm max-w-none' dangerouslySetInnerHTML={{ __html: shortDesc }} />
              {detail !== shortDesc && (
                <div className='text-gray-600 leading-relaxed prose prose-sm max-w-none mt-4' dangerouslySetInnerHTML={{ __html: detail }} />
              )}
              <div className='mb-8' />

              <div className='bg-emerald-50 rounded-2xl p-6'>
                <p className='text-3xl font-bold text-emerald-700 mb-1'>{formatCOP(tour.price_cop)}</p>
                <p className='text-emerald-600 text-sm'>{lang === 'es' ? 'por persona' : 'per person'}</p>
              </div>
            </motion.div>

            {/* Right — booking form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className='bg-gray-50 rounded-2xl p-6'>
                <h3 className='text-xl font-bold text-gray-900 mb-6'>
                  {lang === 'es' ? 'Reserva' : 'Book'}
                </h3>

                {status === 'submitted' || status === 'paying' ? (
                  <div className='py-4'>
                    <div className='flex flex-col items-center mb-5'>
                      <CheckCircle className='w-10 h-10 text-emerald-500 mb-2' />
                      <h4 className='text-base font-bold text-gray-900'>
                        {lang === 'es' ? '¡Reserva creada!' : 'Booking created!'}
                      </h4>
                      <p className='text-gray-500 text-xs text-center mt-1'>
                        {lang === 'es' ? 'Elige cómo pagar' : 'Choose how to pay'}
                      </p>
                    </div>

                    <div className='text-center mb-3'>
                      <p className='text-xs text-gray-400'>{lang === 'es' ? 'Total' : 'Total'}</p>
                      <p className='text-2xl font-bold text-gray-900'>{formatCOP(totalCOP)}</p>
                    </div>

                    {/* Go Back button */}
                    {status === 'submitted' && (
                      <button
                        onClick={() => setStatus('idle')}
                        className='w-full flex items-center justify-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-4 transition-colors'
                      >
                        <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                        </svg>
                        {lang === 'es' ? '← Volver al formulario' : '← Back to form'}
                      </button>
                    )}

                    <div className='space-y-2'>
                      {GATEWAYS.filter((gw) => enabledGateways[gw.id]).map((gw) => (
                        <button
                          key={gw.id}
                          onClick={() => handleGatewayPayment(gw.id)}
                          disabled={status === 'paying'}
                          className='w-full flex items-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed border border-gray-200 rounded-xl px-4 py-3 text-left transition-colors'
                        >
                          <span className='w-3 h-3 rounded-full shrink-0' style={{ background: gw.color }} />
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1.5 flex-wrap'>
                              <span className='font-semibold text-sm text-gray-900'>{gw.name}</span>
                              {gw.badge && <span className='text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full'>{gw.badge}</span>}
                              {gw.installments && <span className='text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full'>{lang === 'es' ? 'Cuotas' : 'Installments'}</span>}
                            </div>
                            <p className='text-xs text-gray-400 truncate'>{gw.desc}</p>
                          </div>
                          {status === 'paying' && payingGateway === gw.id
                            ? <Loader2 className='w-4 h-4 animate-spin text-gray-400 shrink-0' />
                            : <svg className='w-4 h-4 text-gray-300 shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' /></svg>
                          }
                        </button>
                      ))}
                    </div>

                    {payuParams && (
                      <form ref={payuFormRef} method='POST' action={payuAction} style={{ display: 'none' }}>
                        {Object.entries(payuParams).map(([k, v]) => <input key={k} type='hidden' name={k} value={v} />)}
                      </form>
                    )}

                    {errorMsg && <p className='text-red-500 text-xs mt-2 text-center'>{errorMsg}</p>}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>
                          {lang === 'es' ? 'Nombre completo' : 'Full name'} *
                        </label>
                        <input
                          name='name' value={form.name} onChange={handleChange} required
                          className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400'
                          placeholder={lang === 'es' ? 'Tu nombre' : 'Your name'}
                        />
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>
                          {lang === 'es' ? 'Correo electrónico' : 'Email'} *
                        </label>
                        <input
                          name='email' type='email' value={form.email} onChange={handleChange} required
                          className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400'
                          placeholder='email@example.com'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>
                          {lang === 'es' ? 'Teléfono / WhatsApp' : 'Phone / WhatsApp'}
                        </label>
                        <input
                          name='phone' value={form.phone} onChange={handleChange}
                          className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400'
                          placeholder='+57 300 000 0000'
                        />
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>
                          {lang === 'es' ? 'Número de personas' : 'Number of guests'} *
                        </label>
                        <input
                          name='guests' type='number' min={4} max={10} value={form.guests} onChange={handleChange} required
                          className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400'
                        />

                      </div>
                    </div>

                    <div className='text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3'>
                      {lang === 'es'
                        ? 'Para reservas en días no habilitados, contáctanos vía WhatsApp para asistencia personalizada.'
                        : 'For bookings on unavailable dates, contact us via WhatsApp for personalized assistance.'}
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1'>
                        {lang === 'es' ? 'Fecha preferida' : 'Preferred date'}
                      </label>
                      <CalendarPicker value={selectedDate} onChange={setSelectedDate} allowedDays={allowedDays} />
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1'>
                        {lang === 'es' ? 'Mensaje (opcional)' : 'Message (optional)'}
                      </label>
                      <textarea
                        name='message' value={form.message} onChange={handleChange} rows={3}
                        className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none'
                        placeholder={lang === 'es' ? 'Cuéntanos más sobre tu viaje...' : 'Tell us more about your trip...'}
                      />
                    </div>

                    {form.guests && Number(form.guests) > 0 && (
                      <div className='flex items-center justify-between py-2 border-t border-gray-200'>
                        <span className='text-sm text-gray-600'>
                          {lang === 'es' ? 'Total estimado' : 'Estimated total'}
                        </span>
                        <span className='font-bold text-gray-900'>{formatCOP(totalCOP)}</span>
                      </div>
                    )}

                    {status === 'error' && <p className='text-red-500 text-sm'>{errorMsg}</p>}

                    <button
                      type='submit'
                      disabled={status === 'submitting'}
                      className='w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60'
                    >
                      {status === 'submitting'
                        ? <><Loader2 className='w-4 h-4 animate-spin' />{lang === 'es' ? 'Enviando...' : 'Sending...'}</>
                        : <><Send className='w-4 h-4' />{lang === 'es' ? 'Reservar' : 'Book now'}</>
                      }
                    </button>

                    <div className='mt-4 bg-red-50 border border-red-200 rounded-xl p-4'>
                      <p className='text-red-700 font-bold text-sm mb-2'>
                        {lang === 'es' ? 'PENALIDADES POR CANCELACIÓN:' : 'CANCELLATION PENALTIES:'}
                      </p>
                      <ul className='space-y-1 text-red-700 text-xs list-disc list-inside'>
                        {lang === 'es' ? (
                          <>
                            <li>Si el viajero cancela de 8 a 6 días antes del viaje tendrá una penalidad del 30%</li>
                            <li>Si el viajero cancela de 5 a 2 días antes del viaje tendrá una penalidad del 50%</li>
                            <li>Si el viajero cancela antes de las 24 horas del viaje tendrá una penalidad del 100%</li>
                          </>
                        ) : (
                          <>
                            <li>Cancellation 8–6 days before departure: 30% penalty</li>
                            <li>Cancellation 5–2 days before departure: 50% penalty</li>
                            <li>Cancellation within 24 hours of departure: 100% penalty</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
