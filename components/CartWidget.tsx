'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, X, CreditCard, Trash2, ExternalLink } from 'lucide-react';
import { getCartItems, removeCartItem, type CartItem } from '@/lib/cart';
import { formatCOP } from '@/components/ToursSection';

export default function CartWidget() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  function sync() {
    setItems(getCartItems());
  }

  useEffect(() => {
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('cartUpdated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('cartUpdated', sync);
    };
  }, []);

  if (items.length === 0) return null;

  function handleRemove(bookingId: string) {
    removeCartItem(bookingId);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    sync();
  }

  const total = items.reduce((sum, i) => sum + i.totalCOP, 0);

  return (
    <div className='fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3'>
      {/* Popup */}
      {open && (
        <div className='bg-white border border-gray-200 rounded-2xl shadow-xl w-80 text-sm overflow-hidden'>
          <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
            <span className='font-semibold text-gray-900'>
              {items.length === 1 ? 'Reserva pendiente' : `${items.length} reservas pendientes`}
            </span>
            <button onClick={() => setOpen(false)} className='text-gray-400 hover:text-gray-600'>
              <X className='w-4 h-4' />
            </button>
          </div>

          <div className='max-h-72 overflow-y-auto divide-y divide-gray-100'>
            {items.map((item) => {
              const dateFormatted = item.date
                ? new Date(item.date + 'T12:00:00').toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                : '—';
              return (
                <div key={item.bookingId} className='p-3'>
                  <div className='flex items-start justify-between gap-2 mb-1'>
                    <p className='font-semibold text-gray-800 text-sm leading-tight flex-1'>{item.tourName}</p>
                    <button
                      onClick={() => handleRemove(item.bookingId)}
                      className='text-gray-300 hover:text-red-400 transition-colors shrink-0'
                      title='Quitar'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  </div>
                  <p className='text-gray-400 text-xs'>{dateFormatted} · {item.guests} persona{Number(item.guests) !== 1 ? 's' : ''}</p>
                  <div className='flex items-center justify-between mt-1'>
                    <p className='text-emerald-700 font-bold text-sm'>{formatCOP(item.totalCOP)}</p>
                    {item.tourId && (
                      <button
                        onClick={() => {
                          sessionStorage.setItem('mavicure_resume_id', item.bookingId);
                          window.location.href = `/tours/${item.tourId}`;
                        }}
                        className='flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors'
                        title='Ver tour y editar datos'
                      >
                        <ExternalLink className='w-3 h-3' />
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className='px-4 py-3 border-t border-gray-100 bg-gray-50'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-xs text-gray-500 font-medium'>Total</span>
              <span className='font-bold text-gray-900'>{formatCOP(total)}</span>
            </div>
            <a
              href='/carrito'
              className='w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors'
            >
              <CreditCard className='w-4 h-4' />
              Pagar ahora
            </a>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className='relative flex items-center justify-center w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-colors'
        aria-label='Ver carrito'
      >
        <ShoppingCart className='w-6 h-6' />
        <span className='absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
          {items.length}
        </span>
      </button>
    </div>
  );
}
