import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getConfig } from '@/lib/gateway-config';
import { rateLimiters, getIp, tooManyRequests } from '@/lib/ratelimit';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

function generatePayUSignature(
  apiKey: string,
  merchantId: string,
  referenceCode: string,
  amount: string,
  currency: string
): string {
  // PayU signature: MD5(apiKey~merchantId~referenceCode~amount~currency)
  const chain = `${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`;
  return crypto.createHash('md5').update(chain).digest('hex');
}

// POST — generate PayU Web Checkout form parameters
// The client receives these and auto-submits a hidden HTML form
export async function POST(request: NextRequest) {
  const { success, limit, reset } = await rateLimiters.payment.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  try {
    const body = await request.json();
    const { bookingId: singleId, bookingIds, tourName, customerName, email, phone, totalCop } = body;
    const ids: string[] = bookingIds?.length ? bookingIds : singleId ? [singleId] : [];
    const primaryId = ids[0];

    if (!primaryId || !totalCop) {
      return NextResponse.json({ error: 'Datos de pago incompletos' }, { status: 400 });
    }

    const apiKey = await getConfig('PAYU_API_KEY');
    const merchantId = await getConfig('PAYU_MERCHANT_ID');
    const accountId = await getConfig('PAYU_ACCOUNT_ID');

    if (!apiKey || !merchantId || !accountId) {
      return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 503 });
    }

    const isTest = (await getConfig('NEXT_PUBLIC_PAYU_TEST')) === 'true';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const referenceCode = `MAV-${primaryId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    const currency = 'COP';
    // PayU requires amount with max 2 decimal places
    const amount = (Math.round(totalCop * 100) / 100).toFixed(2);

    const signature = generatePayUSignature(apiKey, merchantId, referenceCode, amount, currency);

    // Store reference on all bookings in this checkout
    const supabase = getSupabase();
    await Promise.all(ids.map((id) =>
      supabase.from('bookings').update({ payment_gateway: 'payu', payment_reference: referenceCode }).eq('id', id)
    ));

    const checkoutUrl = isTest
      ? 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/'
      : 'https://checkout.payulatam.com/ppp-web-gateway-payu/';

    return NextResponse.json({
      checkoutUrl,
      params: {
        merchantId,
        accountId,
        description: (tourName || 'Tour Mavicure Travel').slice(0, 255),
        referenceCode,
        amount,
        tax: '0',
        taxReturnBase: '0',
        currency,
        signature,
        test: isTest ? '1' : '0',
        buyerEmail: email || '',
        buyerFullName: customerName || '',
        buyerPhone: phone || '',
        responseUrl: `${siteUrl}/pago-exitoso?booking=${primaryId}&gateway=payu`,
        confirmationUrl: `${siteUrl}/api/payment/payu/notify`,
      },
    });
  } catch (err) {
    console.error('PayU POST error:', err);
    return NextResponse.json({ error: 'Error al generar enlace de pago' }, { status: 500 });
  }
}
