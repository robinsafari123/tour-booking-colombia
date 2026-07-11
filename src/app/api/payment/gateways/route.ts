import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/gateway-config';

const GATEWAY_IDS = ['WOMPI', 'PAYU', 'MERCADOPAGO', 'PAYPAL'] as const;

export async function GET() {
  try {
    const entries = await Promise.all(
      GATEWAY_IDS.map(async (id) => {
        const val = await getConfig(`${id}_ENABLED`);
        // Default to enabled if the key has never been set
        return [id.toLowerCase(), val === '' || val === 'true'] as const;
      }),
    );
    return NextResponse.json(Object.fromEntries(entries));
  } catch (err) {
    console.error('Gateways GET error:', err);
    // Fail open — all enabled — so a misconfigured server never blocks payments
    return NextResponse.json({ wompi: true, payu: true, mercadopago: true, paypal: true });
  }
}
