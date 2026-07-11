import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmation } from '@/lib/email';
import { getConfig } from '@/lib/gateway-config';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// PayU IPN signature verification
// Formula: MD5(apiKey~merchantId~referenceCode~TX_VALUE~currency~transactionState)
function verifyPayUSignature(
  apiKey: string,
  merchantId: string,
  referenceCode: string,
  txValue: string,
  currency: string,
  transactionState: string,
  receivedSignature: string
): boolean {
  const chain = `${apiKey}~${merchantId}~${referenceCode}~${txValue}~${currency}~${transactionState}`;
  const expected = crypto.createHash('md5').update(chain).digest('hex');
  return expected === receivedSignature;
}

// POST — PayU async IPN (Instant Payment Notification)
// Configure this URL in your PayU dashboard → Módulo administrativo → Configuración de cuentas
export async function POST(request: NextRequest) {
  try {
    // PayU sends form-encoded data
    const text = await request.text();
    const params = new URLSearchParams(text);

    const merchantId = params.get('merchant_id') ?? '';
    const referenceCode = params.get('reference_sale') ?? '';
    const transactionState = params.get('state_pol') ?? '';
    const txValue = params.get('value') ?? '';
    const currency = params.get('currency') ?? '';
    const signature = params.get('sign') ?? '';
    const transactionId = params.get('transaction_id') ?? '';

    const apiKey = await getConfig('PAYU_API_KEY');
    if (!apiKey) {
      return new NextResponse('Payment gateway not configured', { status: 503 });
    }

    // Verify signature
    if (signature && !verifyPayUSignature(apiKey, merchantId, referenceCode, txValue, currency, transactionState, signature)) {
      console.error('PayU IPN: invalid signature');
      return new NextResponse('Invalid signature', { status: 401 });
    }

    // state_pol: 4 = Approved, 6 = Declined, 5 = Expired, 7 = Pending
    if (transactionState === '4' && referenceCode) {
      const supabase = getSupabase();
      const { data: booking, error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'confirmed',
          payment_gateway: 'payu',
          payment_reference: referenceCode,
          wompi_transaction_id: transactionId, // reusing this column for transaction ID
        })
        .eq('payment_reference', referenceCode)
        .select('customer_name, email, tour_name, date, num_people, total_cop, email_sent, id')
        .single();

      if (error) {
        console.error('PayU notify: booking update failed', error);
        return new NextResponse('Booking update failed', { status: 500 });
      }

      if (booking && !booking.email_sent) {
        await sendBookingConfirmation({
          to: booking.email,
          customerName: booking.customer_name,
          tourName: booking.tour_name,
          date: booking.date,
          numPeople: booking.num_people,
          totalCop: booking.total_cop,
          gateway: 'payu',
          reference: referenceCode,
        });
        await supabase.from('bookings').update({ email_sent: true }).eq('id', booking.id);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('PayU notify error:', err);
    return new NextResponse('Error', { status: 500 });
  }
}
