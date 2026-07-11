import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmation } from '@/lib/email';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// POST — Mercado Pago IPN / webhook
// Mercado Pago sends notifications when payment status changes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Only handle payment notifications
    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ ok: true });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);

    const payment = await paymentClient.get({ id: data.id });

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true });
    }

    const bookingId = payment.external_reference;
    if (!bookingId) {
      return NextResponse.json({ ok: true });
    }

    const supabase = getSupabase();
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        payment_status: 'confirmed',
        payment_gateway: 'mercadopago',
        payment_reference: String(payment.id),
        payment_method: payment.payment_method_id ?? null,
      })
      .eq('id', bookingId)
      .select('customer_name, email, tour_name, date, num_people, total_cop, email_sent, id')
      .single();

    if (error) {
      console.error('MP webhook: booking update failed', error);
      return NextResponse.json({ error: 'Booking update failed' }, { status: 500 });
    }

    if (booking && !booking.email_sent) {
      await sendBookingConfirmation({
        to: booking.email,
        customerName: booking.customer_name,
        tourName: booking.tour_name,
        date: booking.date,
        numPeople: booking.num_people,
        totalCop: booking.total_cop,
        gateway: 'mercadopago',
        reference: String(payment.id),
      });
      await supabase.from('bookings').update({ email_sent: true }).eq('id', booking.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('MP webhook error:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
