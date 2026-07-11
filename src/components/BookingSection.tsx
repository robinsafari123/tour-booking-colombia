'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/language-context';
import { usePageContent } from '@/lib/use-page-content';
import { tours, formatCOP } from '@/components/ToursSection';
import CalendarPicker from '@/components/ui/calendar-picker';
import { getAllowedDays } from '@/lib/tour-booking-days';
import { getCartItem, addCartItem, removeCartItem } from '@/lib/cart';

type BookingStatus = 'idle' | 'submitting' | 'submitted' | 'paying' | 'error';

type Gateway = 'wompi' | 'payu' | 'mercadopago' | 'paypal';

interface GatewayOption {
  id: Gateway;
  name: string;
  description: string;
  methods: string;
  installments?: boolean;
  color: string;
  badge?: string;
}

const GATEWAYS: GatewayOption[] = [
  {
    id: 'wompi',
    name: 'Wompi',
    description: 'Bancolombia',
    methods: 'Tarjeta · PSE · Nequi · Daviplata',
    installments: true,
    color: '#00C3A5',
    badge: 'Colombia',
  },
  {
    id: 'payu',
    name: 'PayU',
    description: 'Internacional',
    methods: 'Tarjeta · PSE · Efecty · Baloto',
    installments: true,
    color: '#1B3A6B',
    badge: 'Más métodos',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Latinoamérica',
    methods: 'Tarjeta · Wallet · PSE',
    installments: true,
    color: '#00B1EA',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'USD / EUR',
    methods: 'Tarjeta internacional · PayPal',
    installments: false,
    color: '#003087',
    badge: 'Internacional',
  },
];

export default function BookingSection() {
  const { lang, t } = useLanguage();
  const { get, getSize } = usePageContent('reservar');
  const [status, setStatus] = useState<BookingStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [payingGateway, setPayingGateway] = useState<Gateway | null>(null);
  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuParams, setPayuParams] = useState<Record<string, string> | null>(null);
  const [payuAction, setPayuAction] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    tourIndex: '',
    guests: '1',
    message: '',
  });

  const [enabledGateways, setEnabledGateways] = useState<Record<string, boolean>>({
    wompi: true, payu: true, mercadopago: true, paypal: true,
  });

  useEffect(() => {
    // Load which gateways are active from admin settings
    fetch('/api/payment/gateways')
      .then((r) => r.json())
      .then((data) => setEnabledGateways(data))
      .catch(() => { /* keep defaults */ });

    // Resume pending cart booking (dispatched by CartWidget on same page)
    function applyResume(item: { customerName: string; email: string; phone: string; tourIndex: string; guests: string; message: string; date: string; bookingId: string }) {
      setForm({
        name: item.customerName,
        email: item.email,
        phone: item.phone,
        tourIndex: item.tourIndex,
        guests: item.guests,
        message: item.message,
      });
      setSelectedDate(item.date ? new Date(item.date + 'T12:00:00') : undefined);
      setBookingId(item.bookingId);
      setStatus('submitted');
    }

    function onResume(e: Event) {
      const item = (e as CustomEvent).detail;
      if (item) applyResume(item);
    }
    window.addEventListener('resumeBooking', onResume);

    // Resume when navigating here from another page (CartWidget sets this flag)
    if (sessionStorage.getItem('mavicure_resume') === '1') {
      sessionStorage.removeItem('mavicure_resume');
      const saved = getCartItem();
      if (saved) applyResume(saved);
    }

    return () => window.removeEventListener('resumeBooking', onResume);
  }, []);

  const selectedTour = form.tourIndex !== '' ? tours[Number(form.tourIndex)] : null;
  const totalCOP = selectedTour && form.guests
    ? selectedTour.priceCOP * Number(form.guests)
    : 0;
  const allowedDays = selectedTour ? getAllowedDays(selectedTour.name.es) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'tourIndex' && selectedDate) {
      const newTour = value !== '' ? tours[Number(value)] : null;
      const newAllowed = newTour ? getAllowedDays(newTour.name.es) : null;
      if (newAllowed && !newAllowed.includes(selectedDate.getDay())) {
        setSelectedDate(undefined);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTour) return;
    setStatus('submitting');
    setErrorMsg('');

    const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

    try {
      const payload = {
        tour_name: selectedTour.name[lang],
        customer_name: form.name,
        email: form.email,
        phone: form.phone,
        date: dateStr,
        num_people: Number(form.guests),
        notes: form.message,
        total_cop: totalCOP,
      };

      let resolvedBookingId = bookingId;
      if (bookingId) {
        // Update existing booking (user went back to correct info)
        const res = await fetch('/api/bookings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error');
      } else {
        // Create new booking
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
        tourId: '',
        tourIndex: form.tourIndex,
        tourName: selectedTour.name[lang],
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
  };

  const handleGatewayPayment = async (gateway: Gateway) => {
    if (!bookingId) return;
    setPayingGateway(gateway);
    setStatus('paying');

    try {
      const res = await fetch(`/api/payment/${gateway}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          tourName: selectedTour?.name[lang],
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
        // PayU uses a form POST — build and submit a hidden form
        setPayuAction(data.checkoutUrl);
        setPayuParams(data.params);
        // Submit happens after state update via useEffect-equivalent (setTimeout)
        setTimeout(() => payuFormRef.current?.submit(), 50);
      } else {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al iniciar pago');
      setStatus('submitted');
      setPayingGateway(null);
    }
  };

  return (
    <section id='booking' className='py-24 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-16 items-start'>
          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className='inline-block text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3'>
              {get('booking_label', lang) || t('booking.label')}
            </span>
            <h2 className='text-5xl md:text-6xl font-bold font-heading text-gray-900 mb-6 leading-tight whitespace-pre-line'>
              {get('booking_title', lang) || t('booking.title')}
            </h2>
            <p className='text-gray-500 text-lg leading-relaxed mb-10'>
              {get('booking_subtitle', lang) || t('booking.subtitle')}
            </p>

            {/* Info cards */}
            <div className='space-y-4'>
              {([
                { n: 1, label: get('booking_card1_label', lang) || t('booking.response'), value: get('booking_card1_value', lang) || t('booking.response.val') },
                { n: 2, label: get('booking_card2_label', lang) || t('booking.free'),     value: get('booking_card2_value', lang) || t('booking.free.val') },
                { n: 3, label: get('booking_card3_label', lang) || t('booking.flexible'), value: get('booking_card3_value', lang) || t('booking.flexible.val') },
              ] as const).filter(item => get(`booking_card${item.n}_label_hidden`, 'es') !== '1').map((item) => (
                <div key={item.label} className='flex items-center gap-4 bg-gray-50 rounded-xl p-4'>
                  <CheckCircle className='w-5 h-5 text-emerald-500 flex-shrink-0' />
                  <div>
                    <p style={getSize(`booking_card${item.n}_label`)} className='text-xs text-gray-400 font-medium'>{item.label}</p>
                    <p style={getSize(`booking_card${item.n}_value`)} className='text-sm font-semibold text-gray-800'>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment method badges */}
            <div className='mt-8 p-5 bg-gray-50 rounded-2xl'>
              <p className='text-xs text-gray-500 font-medium mb-3 uppercase tracking-wide'>
                {lang === 'es' ? 'Pago seguro con' : 'Secure payment with'}
              </p>
              <div className='flex items-center gap-2 flex-wrap'>
                {[
                  ...(enabledGateways.wompi ? ['Wompi'] : []),
                  ...(enabledGateways.payu ? ['PayU'] : []),
                  ...(enabledGateways.mercadopago ? ['Mercado Pago'] : []),
                  ...(enabledGateways.paypal ? ['PayPal'] : []),
                  'PSE', 'Nequi', 'Efecty', 'Visa', 'Mastercard',
                ].map((m) => (
                  <span key={m} className='px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 shadow-sm'>
                    {m}
                  </span>
                ))}
              </div>
              <p className='text-xs text-gray-400 mt-3'>
                {lang === 'es' ? 'Cuotas disponibles con tarjeta crédito' : 'Installments available with credit card'}
              </p>
            </div>

            {/* Image */}
            <div className='mt-8 rounded-2xl overflow-hidden h-52'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={get('booking_image', 'es') || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'}
                alt='Colombia mountains'
                className='w-full h-full object-cover'
              />
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {status === 'submitted' || status === 'paying' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='bg-emerald-50 border border-emerald-200 rounded-3xl p-8 flex flex-col items-center gap-5'
              >
                <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-8 h-8 text-emerald-600' />
                </div>
                <h3 className='text-2xl font-bold text-gray-900 text-center'>
                  {t('booking.success.title')}
                </h3>
                <p className='text-gray-500 max-w-xs text-center text-sm'>
                  {t('booking.success.body')
                    .replace('{name}', form.name)
                    .replace('{email}', form.email)}
                </p>

                {/* Total + gateway selector */}
                {totalCOP > 0 && (
                  <div className='w-full bg-white rounded-2xl p-5 border border-emerald-200'>
                    <p className='text-xs text-gray-500 mb-1 text-center'>{t('booking.total')}</p>
                    <p className='text-3xl font-bold text-gray-900 mb-4 text-center'>{formatCOP(totalCOP)}</p>

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

                    <p className='text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 text-center'>
                      {lang === 'es' ? 'Elige tu método de pago' : 'Choose your payment method'}
                    </p>

                    <div className='grid grid-cols-1 gap-2'>
                      {GATEWAYS.filter((gw) => enabledGateways[gw.id]).map((gw) => (
                        <button
                          key={gw.id}
                          onClick={() => handleGatewayPayment(gw.id)}
                          disabled={status === 'paying'}
                          className='w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed border border-gray-200 rounded-xl px-4 py-3 text-left transition-colors'
                        >
                          {/* Color dot */}
                          <span
                            className='w-3 h-3 rounded-full shrink-0'
                            style={{ background: gw.color }}
                          />
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2'>
                              <span className='font-semibold text-sm text-gray-900'>{gw.name}</span>
                              {gw.badge && (
                                <span className='text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full'>
                                  {gw.badge}
                                </span>
                              )}
                              {gw.installments && (
                                <span className='text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full'>
                                  Cuotas
                                </span>
                              )}
                            </div>
                            <p className='text-xs text-gray-400 truncate'>{gw.methods}</p>
                          </div>
                          {status === 'paying' && payingGateway === gw.id ? (
                            <Loader2 className='w-4 h-4 animate-spin text-gray-400 shrink-0' />
                          ) : (
                            <svg className='w-4 h-4 text-gray-300 shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                    <p className='text-xs text-gray-400 mt-4 text-center'>
                      {lang === 'es'
                        ? 'Serás redirigido a la pasarela de pago segura'
                        : 'You will be redirected to the secure payment gateway'}
                    </p>
                  </div>
                )}

                {/* Hidden PayU form — auto-submitted for PayU payments */}
                {payuParams && (
                  <form ref={payuFormRef} method='POST' action={payuAction} style={{ display: 'none' }}>
                    {Object.entries(payuParams).map(([key, value]) => (
                      <input key={key} type='hidden' name={key} value={value} />
                    ))}
                  </form>
                )}

                <Button
                  variant='outline'
                  className='rounded-full border-emerald-300 text-emerald-700 text-sm'
                  onClick={() => { if (bookingId) { removeCartItem(bookingId); window.dispatchEvent(new CustomEvent('cartUpdated')); } setStatus('idle'); setBookingId(''); setSelectedDate(undefined); setPayingGateway(null); }}
                >
                  {t('booking.success.again')}
                </Button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className='bg-gray-50 rounded-3xl p-8 space-y-5'
              >
                <div className='grid sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name' className='text-sm font-medium text-gray-700'>
                      {t('booking.name')}
                    </Label>
                    <Input
                      id='name' name='name'
                      placeholder='Ana García'
                      required
                      value={form.name}
                      onChange={handleChange}
                      className='rounded-xl border-gray-200 bg-white focus:border-emerald-400'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
                      {t('booking.email')}
                    </Label>
                    <Input
                      id='email' name='email' type='email'
                      placeholder='ana@ejemplo.com'
                      required
                      value={form.email}
                      onChange={handleChange}
                      className='rounded-xl border-gray-200 bg-white focus:border-emerald-400'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone' className='text-sm font-medium text-gray-700'>
                    {t('booking.phone')}
                  </Label>
                  <Input
                    id='phone' name='phone' type='tel'
                    placeholder='+57 300 123 4567'
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className='rounded-xl border-gray-200 bg-white focus:border-emerald-400'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='tourIndex' className='text-sm font-medium text-gray-700'>
                    {t('booking.tour')}
                  </Label>
                  <select
                    id='tourIndex' name='tourIndex'
                    required
                    value={form.tourIndex}
                    onChange={handleChange}
                    className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
                  >
                    <option value=''>{t('booking.tour.placeholder')}</option>
                    {tours.map((tour, i) => (
                      <option key={tour.id} value={i}>
                        {tour.name[lang]} — {formatCOP(tour.priceCOP)}/persona
                      </option>
                    ))}
                  </select>
                </div>

                <div className='grid sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-gray-700'>
                      {t('booking.date')}
                    </Label>
                    <CalendarPicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                      allowedDays={allowedDays}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='guests' className='text-sm font-medium text-gray-700'>
                      {t('booking.guests')}
                    </Label>
                    <Input
                      id='guests' name='guests' type='number'
                      min='1' max='10' placeholder='2'
                      required
                      value={form.guests}
                      onChange={handleChange}
                      className='rounded-xl border-gray-200 bg-white focus:border-emerald-400'
                    />

                  </div>
                </div>

                <div className='text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3'>
                  {lang === 'es'
                    ? 'Para reservas en días no habilitados, contáctanos vía WhatsApp para asistencia personalizada.'
                    : 'For bookings on unavailable dates, contact us via WhatsApp for personalized assistance.'}
                </div>

                {/* Price preview */}
                {selectedTour && form.guests && (
                  <div className='bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between'>
                    <span className='text-sm text-emerald-700 font-medium'>
                      {form.guests} × {formatCOP(selectedTour.priceCOP)}
                    </span>
                    <span className='text-lg font-bold text-emerald-800'>
                      {formatCOP(totalCOP)}
                    </span>
                  </div>
                )}

                <div className='space-y-2'>
                  <Label htmlFor='message' className='text-sm font-medium text-gray-700'>
                    {t('booking.message')}
                  </Label>
                  <textarea
                    id='message' name='message'
                    rows={3}
                    placeholder={t('booking.message.placeholder')}
                    value={form.message}
                    onChange={handleChange}
                    className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none'
                  />
                </div>

                {status === 'error' && (
                  <p className='text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3'>{errorMsg}</p>
                )}

                <Button
                  type='submit'
                  disabled={status === 'submitting'}
                  className='w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-base font-semibold gap-2'
                >
                  {status === 'submitting' ? (
                    <><Loader2 className='w-4 h-4 animate-spin' /> Enviando...</>
                  ) : (
                    <>{t('booking.submit')} <Send className='w-4 h-4' /></>
                  )}
                </Button>

                <p className='text-center text-xs text-gray-400'>
                  {t('booking.privacy')}
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
