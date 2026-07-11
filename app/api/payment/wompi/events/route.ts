import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmation } from '@/lib/email';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// POST — Wompi async event webhook
// Configure this URL in your Wompi dashboard → Desarrolladores → Eventos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature
    // Wompi sends: X-Event-Checksum header = SHA256(eventId + event.occurred_at + eventsKey)
    const eventsKey = process.env.WOMPI_EVENTS_KEY;
    if (eventsKey) {
      const checksum = request.headers.get('X-Event-Checksum');
      const eventId = body?.event?.id ?? '';
      const occurredAt = body?.event?.occurred_at ?? '';
      const expected = crypto
        .createHash('sha256')
        .update(`${eventId}${occurredAt}${eventsKey}`)
        .digest('hex');

      if (checksum && checksum !== expected) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const eventType: string = body?.event?.type ?? '';
    const transaction = body?.data?.transaction;

    if (eventType === 'transaction.updated' && transaction?.status === 'APPROVED') {
      const reference: string = transaction.reference ?? '';
      const transactionId: string = transaction.id ?? '';

      if (!reference) {
        return NextResponse.json({ ok: true });
      }

      const supabase = getSupabase();
      const { data: booking, error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'confirmed',
          payment_gateway: 'wompi',
          payment_reference: reference,
          wompi_transaction_id: transactionId,
          wompi_reference: reference,
        })
        .eq('wompi_reference', reference)
        .select('customer_name, email, tour_name, date, num_people, total_cop, email_sent, id')
        .single();

      if (error) {
        console.error('Wompi events webhook: booking update failed', error);
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
          gateway: 'wompi',
          reference,
        });
        await supabase.from('bookings').update({ email_sent: true }).eq('id', booking.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Wompi events webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
