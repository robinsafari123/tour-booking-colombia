'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, ShoppingCart, CreditCard } from 'lucide-react';
import { getCartItems, removeCartItem, clearCart, type CartItem } from '@/lib/cart';
import { formatCOP } from '@/components/ToursSection';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Gateway = 'wompi' | 'payu' | 'mercadopago' | 'paypal';

const GATEWAYS = [
  { id: 'wompi' as Gateway,       name: 'Wompi',        desc: 'Tarjeta · PSE · Nequi · Daviplata', installments: true,  color: '#00C3A5', badge: 'Colombia' },
  { id: 'payu' as Gateway,        name: 'PayU',         desc: 'Tarjeta · PSE · Efecty · Baloto',   installments: true,  color: '#1B3A6B', badge: 'Más métodos' },
  { id: 'mercadopago' as Gateway, name: 'Mercado Pago', desc: 'Tarjeta · Wallet · PSE',             installments: true,  color: '#00B1EA' },
  { id: 'paypal' as Gateway,      name: 'PayPal',       desc: 'Tarjeta internacional · PayPal',    installments: false, color: '#003087', badge: 'Internacional' },
];

export default function CarritoPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [enabledGateways, setEnabledGateways] = useState<Record<string, boolean>>({
    wompi: true, payu: true, mercadopago: true, paypal: true,
  });
  const [payingGateway, setPayingGateway] = useState<Gateway | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuParams, setPayuParams] = useState<Record<string, string> | null>(null);
  const [payuAction, setPayuAction] = useState('');

  useEffect(() => {
    setItems(getCartItems());
    fetch('/api/payment/gateways')
      .then((r) => r.json())
      .then(setEnabledGateways)
      .catch(() => {});
  }, []);

  function handleRemove(bookingId: string) {
    removeCartItem(bookingId);
    const updated = getCartItems();
    setItems(updated);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    if (updated.length === 0) router.push('/tours');
  }

  const totalCOP = items.reduce((sum, i) => sum + i.totalCOP, 0);
  const primary = items[0];

  async function handleCheckout(gateway: Gateway) {
    if (!primary) return;
    setPayingGateway(gateway);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/payment/${gateway}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingIds: items.map((i) => i.bookingId),
          tourName: items.length === 1
            ? items[0].tourName
            : `${items.length} tours: ${items.map((i) => i.tourName).join(', ')}`,
          customerName: primary.customerName,
          email: primary.email,
          phone: primary.phone,
          totalCop: totalCOP,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      clearCart();
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
      setPayingGateway(null);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className='min-h-screen pt-24 pb-16 flex flex-col items-center justify-center gap-4 text-center px-4'>
          <ShoppingCart className='w-12 h-12 text-gray-300' />
          <p className='text-gray-500 text-lg font-medium'>
            {lang === 'es' ? 'Tu carrito está vacío' : 'Your cart is empty'}
          </p>
          <button
            onClick={() => router.push('/tours')}
            className='mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors'
          >
            {lang === 'es' ? 'Explorar tours' : 'Browse tours'}
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className='min-h-screen pt-24 pb-16 bg-gray-50'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            {lang === 'es' ? 'Tu carrito' : 'Your cart'}
          </h1>
          <p className='text-gray-500 text-sm mb-8'>
            {items.length === 1
              ? (lang === 'es' ? '1 tour seleccionado' : '1 tour selected')
              : (lang === 'es' ? `${items.length} tours seleccionados` : `${items.length} tours selected`)}
          </p>

          <div className='grid gap-4 mb-8'>
            {items.map((item) => {
              const dateFormatted = item.date
                ? new Date(item.date + 'T12:00:00').toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })
                : '—';
              return (
                <div key={item.bookingId} className='bg-white rounded-2xl p-5 border border-gray-200 flex items-start gap-4'>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-gray-900 mb-1'>{item.tourName}</p>
                    <p className='text-sm text-gray-500'>{dateFormatted}</p>
                    <p className='text-sm text-gray-500 mb-2'>
                      {item.guests} persona{Number(item.guests) !== 1 ? 's' : ''}
                    </p>
                    <p className='text-emerald-700 font-bold'>{formatCOP(item.totalCOP)}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.bookingId)}
                    className='text-gray-300 hover:text-red-400 transition-colors mt-1'
                    title={lang === 'es' ? 'Quitar' : 'Remove'}
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total + checkout */}
          <div className='bg-white rounded-2xl border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-100'>
              <span className='text-gray-600 font-medium'>
                {lang === 'es' ? 'Total a pagar' : 'Total'}
              </span>
              <span className='text-2xl font-bold text-gray-900'>{formatCOP(totalCOP)}</span>
            </div>

            <p className='text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3'>
              {lang === 'es' ? 'Elige tu método de pago' : 'Choose payment method'}
            </p>

            <div className='space-y-2'>
              {GATEWAYS.filter((gw) => enabledGateways[gw.id]).map((gw) => (
                <button
                  key={gw.id}
                  onClick={() => handleCheckout(gw.id)}
                  disabled={!!payingGateway}
                  className='w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed border border-gray-200 rounded-xl px-4 py-3 text-left transition-colors'
                >
                  <span className='w-3 h-3 rounded-full shrink-0' style={{ background: gw.color }} />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-1.5 flex-wrap'>
                      <span className='font-semibold text-sm text-gray-900'>{gw.name}</span>
                      {gw.badge && <span className='text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full'>{gw.badge}</span>}
                      {gw.installments && <span className='text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full'>{lang === 'es' ? 'Cuotas' : 'Installments'}</span>}
                    </div>
                    <p className='text-xs text-gray-400'>{gw.desc}</p>
                  </div>
                  {payingGateway === gw.id
                    ? <Loader2 className='w-4 h-4 animate-spin text-gray-400 shrink-0' />
                    : <CreditCard className='w-4 h-4 text-gray-300 shrink-0' />}
                </button>
              ))}
            </div>

            {errorMsg && <p className='text-red-500 text-sm mt-3 text-center'>{errorMsg}</p>}

            <p className='text-xs text-gray-400 mt-4 text-center'>
              {lang === 'es'
                ? 'Serás redirigido a la pasarela de pago segura'
                : 'You will be redirected to the secure payment gateway'}
            </p>
          </div>
        </div>
      </main>

      {/* Hidden PayU form */}
      {payuParams && (
        <form ref={payuFormRef} method='POST' action={payuAction} style={{ display: 'none' }}>
          {Object.entries(payuParams).map(([k, v]) => <input key={k} type='hidden' name={k} value={v} />)}
        </form>
      )}

      <Footer />
    </>
  );
}
