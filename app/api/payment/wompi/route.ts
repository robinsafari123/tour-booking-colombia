import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmation } from '@/lib/email';
import { getConfig } from '@/lib/gateway-config';
import { rateLimiters, getIp, tooManyRequests } from '@/lib/ratelimit';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

function generateWompiSignature(
  reference: string,
  amountInCents: number,
  currency: string,
  expirationTime: string,
  integrityKey: string
): string {
  const chain = `${reference}${amountInCents}${currency}${expirationTime}${integrityKey}`;
  return crypto.createHash('sha256').update(chain).digest('hex');
}

// POST — generate Wompi hosted checkout URL
export async function POST(request: NextRequest) {
  const { success, limit, reset } = await rateLimiters.payment.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  try {
    const body = await request.json();
    const { bookingId: singleId, bookingIds, tourName, customerName, email, totalCop } = body;
    const ids: string[] = bookingIds?.length ? bookingIds : singleId ? [singleId] : [];
    const primaryId = ids[0];

    if (!primaryId || !totalCop) {
      return NextResponse.json({ error: 'Datos de pago incompletos' }, { status: 400 });
    }

    const publicKey = await getConfig('WOMPI_PUBLIC_KEY');
    const integrityKey = await getConfig('WOMPI_INTEGRITY_KEY');

    if (!publicKey || !integrityKey) {
      return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 503 });
    }

    const reference = `MAV-${primaryId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    const amountInCents = totalCop * 100;
    const currency = 'COP';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const expiration = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const signature = generateWompiSignature(
      reference,
      amountInCents,
      currency,
      expiration,
      integrityKey
    );

    // Store the reference on ALL bookings in this cart checkout
    const supabase = getSupabase();
    await Promise.all(ids.map((id) =>
      supabase.from('bookings').update({ wompi_reference: reference, payment_gateway: 'wompi' }).eq('id', id)
    ));

    // Pass all IDs in redirect so the callback can confirm all of them
    const redirectUrl = `${siteUrl}/api/payment/wompi?booking=${ids.join(',')}`;

    const wompiUrl = new URL('https://checkout.wompi.co/p/');
    wompiUrl.searchParams.set('public-key', publicKey);
    wompiUrl.searchParams.set('currency', currency);
    wompiUrl.searchParams.set('amount-in-cents', String(amountInCents));
    wompiUrl.searchParams.set('reference', reference);
    wompiUrl.searchParams.set('signature:integrity', signature);
    wompiUrl.searchParams.set('expiration-time', expiration);
    wompiUrl.searchParams.set('redirect-url', redirectUrl);
    wompiUrl.searchParams.set('customer-data:email', email || '');
    wompiUrl.searchParams.set('customer-data:full-name', customerName || '');

    return NextResponse.json({ checkoutUrl: wompiUrl.toString(), reference });
  } catch (err) {
    console.error('Wompi POST error:', err);
    return NextResponse.json({ error: 'Error al generar enlace de pago' }, { status: 500 });
  }
}

// GET — handle redirect back from Wompi checkout
// Wompi appends: ?id={txId}&reference={ref}&amount={cents}&currency=COP&status={STATUS}
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookingParam = searchParams.get('booking');
  const ids = bookingParam ? bookingParam.split(',').filter(Boolean) : [];
  const primaryId = ids[0];
  const transactionId = searchParams.get('id');
  const status = searchParams.get('status');
  const reference = searchParams.get('reference');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!primaryId) {
    return NextResponse.redirect(`${siteUrl}/`);
  }

  if (transactionId && status === 'APPROVED') {
    try {
      const supabase = getSupabase();
      // Confirm all bookings in this checkout
      const updateResults = await Promise.all(ids.map((id) =>
        supabase.from('bookings').update({
          payment_status: 'confirmed',
          payment_gateway: 'wompi',
          payment_reference: reference,
          wompi_transaction_id: transactionId,
          wompi_reference: reference,
        }).eq('id', id)
      ));
      updateResults.forEach((res, i) => {
        if (res.error) console.error(`Wompi callback: booking ${ids[i]} update failed`, res.error);
      });

      // Send confirmation email for the primary booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('customer_name, email, tour_name, date, num_people, total_cop, email_sent')
        .eq('id', primaryId)
        .single();

      if (error) console.error('Wompi callback: fetching primary booking failed', error);

      if (booking && !booking.email_sent) {
        await sendBookingConfirmation({
          to: booking.email,
          customerName: booking.customer_name,
          tourName: booking.tour_name,
          date: booking.date,
          numPeople: booking.num_people,
          totalCop: booking.total_cop,
          gateway: 'wompi',
          reference: reference || transactionId,
        });
        await supabase.from('bookings').update({ email_sent: true }).eq('id', primaryId);
      }
    } catch (err) {
      console.error('Wompi callback update error:', err);
    }
  }

  return NextResponse.redirect(`${siteUrl}/pago-exitoso?booking=${primaryId}&gateway=wompi`);
}
