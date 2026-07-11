import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Environment,
  OrdersController,
  CheckoutPaymentIntent,
} from '@paypal/paypal-server-sdk';
import { createClient } from '@supabase/supabase-js';
import { getConfig } from '@/lib/gateway-config';
import { rateLimiters, getIp, tooManyRequests } from '@/lib/ratelimit';

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

// POST — create PayPal order and return approval URL
// PayPal requires USD; we convert from COP using PAYPAL_COP_TO_USD_RATE
export async function POST(request: NextRequest) {
  const { success, limit, reset } = await rateLimiters.payment.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  try {
    const body = await request.json();
    const { bookingId: singleId, bookingIds, tourName, totalCop } = body;
    const ids: string[] = bookingIds?.length ? bookingIds : singleId ? [singleId] : [];
    const primaryId = ids[0];

    if (!primaryId || !totalCop) {
      return NextResponse.json({ error: 'Datos de pago incompletos' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const rateStr = await getConfig('PAYPAL_COP_TO_USD_RATE');
    const rate = Number(rateStr) || 4100;
    const usdAmount = (totalCop / rate).toFixed(2);

    const paypalClient = await getPayPalClient();
    const ordersController = new OrdersController(paypalClient);

    const { result } = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: 'USD',
              value: usdAmount,
            },
            description: (tourName || 'Tour Mavicure Travel').slice(0, 127),
            referenceId: ids.join(','),
          },
        ],
        applicationContext: {
          brandName: 'Mavicure Travel Tours',
          returnUrl: `${siteUrl}/api/payment/paypal/capture?bookingId=${ids.join(',')}`,
          cancelUrl: `${siteUrl}/carrito`,
        },
      },
    });

    const approvalUrl = result.links?.find((l) => l.rel === 'approve')?.href;
    if (!approvalUrl) {
      return NextResponse.json({ error: 'No se pudo obtener URL de aprobación' }, { status: 500 });
    }

    // Store PayPal order ID on all bookings in this checkout
    const supabase = getSupabase();
    await Promise.all(ids.map((id) =>
      supabase.from('bookings').update({ payment_gateway: 'paypal', payment_reference: result.id }).eq('id', id)
    ));

    return NextResponse.json({ checkoutUrl: approvalUrl, orderId: result.id });
  } catch (err) {
    console.error('PayPal POST error:', err);
    return NextResponse.json({ error: 'Error al generar enlace de pago' }, { status: 500 });
  }
}
