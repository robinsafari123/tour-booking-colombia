import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimiters, getIp, tooManyRequests } from '@/lib/ratelimit';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  const { success, limit, reset } = await rateLimiters.bookings.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  try {
    const body = await request.json();
    const { tour_id, tour_name, customer_name, email, phone, date, num_people, notes, total_cop } = body;

    // Basic validation
    if (!customer_name || !email || !phone || !tour_name || !date || !num_people || !total_cop) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        tour_id: tour_id || null,
        tour_name,
        customer_name,
        email,
        phone,
        date,
        num_people: Number(num_people),
        notes: notes || null,
        payment_status: 'pending',
        total_cop: Number(total_cop),
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, bookingId: data.id });
  } catch (err) {
    console.error('Booking error:', err);
    return NextResponse.json({ error: 'Error al crear la reserva' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { success, limit, reset } = await rateLimiters.bookings.limit(getIp(request));
  if (!success) return tooManyRequests(reset, limit);

  try {
    const body = await request.json();
    const { bookingId, tour_name, customer_name, email, phone, date, num_people, notes, total_cop } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId requerido' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('bookings')
      .update({
        tour_name,
        customer_name,
        email,
        phone,
        date,
        num_people: Number(num_people),
        notes: notes || null,
        total_cop: Number(total_cop),
      })
      .eq('id', bookingId);

    if (error) throw error;

    return NextResponse.json({ success: true, bookingId });
  } catch (err) {
    console.error('Booking PATCH error:', err);
    return NextResponse.json({ error: 'Error al actualizar la reserva' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Fetch bookings error:', err);
    return NextResponse.json({ error: 'Error al obtener reservas' }, { status: 500 });
  }
}
