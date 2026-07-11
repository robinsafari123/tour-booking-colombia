import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Environment,
  OrdersController,
} from '@paypal/paypal-server-sdk';
import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmation } from '@/lib/email';
import { getConfig } from '@/lib/gateway-config';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

async function getPayPalClient() {
  const clientId = await getConfig('PAYPAL_CLIENT_ID');
  const clientSecret = await getConfig('PAYPAL_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('PayPal not configured');
  const env = await getConfig('NEXT_PUBLIC_PAYPAL_ENV');
  const isSandbox = env !== 'production';
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    environment: isSandbox ? Environment.Sandbox : Environment.Production,
  });
}

// GET — capture approved PayPal order
// PayPal redirects here after buyer approves payment
// URL params: ?token={paypalOrderId}&bookingId={bookingId}
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token'); // PayPal order ID
  const bookingParam = searchParams.get('bookingId');
  const ids = bookingParam ? bookingParam.split(',').filter(Boolean) : [];
  const primaryId = ids[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!token || !primaryId) {
    return NextResponse.redirect(`${siteUrl}/carrito`);
  }

  try {
    const paypalClient = await getPayPalClient();
    const ordersController = new OrdersController(paypalClient);

    const { result } = await ordersController.captureOrder({ id: token });

    if (result.status === 'COMPLETED') {
      const captureId =
        result.purchaseUnits?.[0]?.payments?.captures?.[0]?.id ?? token;

      const supabase = getSupabase();
      const updateResults = await Promise.all(ids.map((id) =>
        supabase.from('bookings').update({
          payment_status: 'confirmed',
          payment_gateway: 'paypal',
          payment_reference: captureId,
        }).eq('id', id)
      ));
      updateResults.forEach((res, i) => {
        if (res.error) console.error(`PayPal capture: booking ${ids[i]} update failed`, res.error);
      });

      const { data: booking, error } = await supabase
        .from('bookings')
        .select('customer_name, email, tour_name, date, num_people, total_cop, email_sent')
        .eq('id', primaryId)
        .single();

      if (error) console.error('PayPal capture: fetching primary booking failed', error);

      if (booking && !booking.email_sent) {
        await sendBookingConfirmation({
          to: booking.email,
          customerName: booking.customer_name,
          tourName: booking.tour_name,
          date: booking.date,
          numPeople: booking.num_people,
          totalCop: booking.total_cop,
          gateway: 'paypal',
          reference: captureId,
        });
        await supabase.from('bookings').update({ email_sent: true }).eq('id', primaryId);
      }
    }
  } catch (err) {
    console.error('PayPal capture error:', err);
  }

  return NextResponse.redirect(
    `${siteUrl}/pago-exitoso?booking=${primaryId}&gateway=paypal`
  );
}
