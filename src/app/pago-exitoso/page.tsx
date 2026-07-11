import { createServerClient } from '@/lib/supabase';
import { getConfig } from '@/lib/gateway-config';
import Link from 'next/link';
import { CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pago exitoso — Mavicure Travel Tours',
  description: 'Tu reserva ha sido confirmada.',
};

interface Booking {
  id: string;
  customer_name: string;
  tour_name: string;
  date: string;
  num_people: number;
  total_cop: number;
  payment_status: string;
  payment_gateway: string | null;
  payment_reference: string | null;
  email: string;
  created_at: string;
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const gatewayNames: Record<string, string> = {
  wompi: 'Wompi (Bancolombia)',
  payu: 'PayU',
  mercadopago: 'Mercado Pago',
  paypal: 'PayPal',
};

async function getBooking(bookingId: string): Promise<Booking | null> {
  if (!bookingId) return null;
  const supabase = createServerClient();
  const { data } = await supabase
    .from('bookings')
    .select('id, customer_name, tour_name, date, num_people, total_cop, payment_status, payment_gateway, payment_reference, email, created_at')
    .eq('id', bookingId)
    .single();

  return data ?? null;
}

export default async function PagoExitosoPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; gateway?: string }>;
}) {
  const { booking: bookingId } = await searchParams;
  const booking = bookingId ? await getBooking(bookingId) : null;

  const isConfirmed = booking?.payment_status === 'confirmed';
  const isPending = booking?.payment_status === 'pending';

  const waRaw = await getConfig('contact_whatsapp') || '573001234567';
  const waNum = waRaw.replace(/\D/g, '');
  const waUrl = `https://wa.me/${waNum}`;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Status icon */}
        <div className="flex justify-center mb-8">
          {isConfirmed ? (
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
          ) : isPending ? (
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className={`px-8 py-6 text-center ${isConfirmed ? 'bg-emerald-50 border-b border-emerald-100' : isPending ? 'bg-amber-50 border-b border-amber-100' : 'bg-gray-50 border-b border-gray-100'}`}>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isConfirmed
                ? '¡Reserva confirmada!'
                : isPending
                ? 'Pago en proceso'
                : booking
                ? 'Reserva recibida'
                : 'Página no encontrada'}
            </h1>
            <p className="text-sm text-gray-500">
              {isConfirmed
                ? 'Tu pago fue procesado. Te enviamos la confirmación por correo.'
                : isPending
                ? 'Estamos verificando tu pago. Puede tomar unos minutos.'
                : booking
                ? 'Tu reserva está registrada. Pronto recibirás confirmación.'
                : 'No se encontró información de la reserva.'}
            </p>
          </div>

          {/* Booking details */}
          {booking && (
            <div className="px-8 py-6 space-y-4">
              <DetailRow label="Tour" value={booking.tour_name} />
              <DetailRow label="Fecha" value={formatDate(booking.date)} />
              <DetailRow
                label="Personas"
                value={`${booking.num_people} ${booking.num_people === 1 ? 'persona' : 'personas'}`}
              />
              <DetailRow
                label="Total"
                value={formatCOP(booking.total_cop)}
                valueClass="text-emerald-700 font-bold text-lg"
              />
              {booking.payment_gateway && (
                <DetailRow
                  label="Método de pago"
                  value={gatewayNames[booking.payment_gateway] ?? booking.payment_gateway}
                />
              )}
              {booking.payment_reference && (
                <DetailRow
                  label="Referencia"
                  value={booking.payment_reference}
                  mono
                />
              )}
              <DetailRow label="Correo" value={booking.email} />
            </div>
          )}

          {/* Footer actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
            {isConfirmed && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25d366] hover:bg-[#1ebe5d] text-white text-center font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Contactar por WhatsApp
              </a>
            )}
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}

function DetailRow({
  label,
  value,
  valueClass = 'text-gray-900 font-medium',
  mono = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm text-right ${valueClass} ${mono ? 'font-mono text-xs bg-gray-100 px-2 py-0.5 rounded' : ''}`}>
        {value}
      </span>
    </div>
  );
}
