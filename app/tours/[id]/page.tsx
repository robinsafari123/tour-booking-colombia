import { createServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import TourDetailClient from './TourDetailClient';
import type { DbTour } from '@/components/ToursSection';

async function getTour(id: string): Promise<DbTour | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('tours').select('*').eq('id', id).single();
    return data || null;
  } catch {
    return null;
  }
}

export default async function TourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTour(id);
  if (!tour) notFound();

  return (
    <main className='pt-20'>
      <Navbar />
      <TourDetailClient tour={tour} />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
