import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import { getConfig } from '@/lib/gateway-config';
import { rateLimiters, getIp, tooManyRequests } from '@/lib/ratelimit';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// POST — create Mercado Pago Checkout Pro preference and return init_point URL
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

    const accessToken = await getConfig('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 503 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: primaryId,
            title: (tourName || 'Tour Mavicure Travel').slice(0, 256),
            quantity: 1,
            unit_price: totalCop,
            currency_id: 'COP',
          },
        ],
        payer: {
          name: customerName || '',
          email: email || '',
        },
        back_urls: {
          success: `${siteUrl}/pago-exitoso?booking=${primaryId}&gateway=mercadopago`,
          failure: `${siteUrl}/#booking`,
          pending: `${siteUrl}/pago-exitoso?booking=${primaryId}&gateway=mercadopago`,
        },
        auto_return: 'approved',
        external_reference: ids.join(','),
        notification_url: `${siteUrl}/api/payment/mercadopago/webhook`,
        statement_descriptor: 'MAVICURE TRAVEL',
      },
    });

    // Store reference on all bookings in this checkout
    const supabase = getSupabase();
    await Promise.all(ids.map((id) =>
      supabase.from('bookings').update({ payment_gateway: 'mercadopago', payment_reference: response.id }).eq('id', id)
    ));

    const checkoutUrl = response.init_point;
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No se pudo obtener URL de pago' }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error('Mercado Pago POST error:', err);
    return NextResponse.json({ error: 'Error al generar enlace de pago' }, { status: 500 });
  }
}
