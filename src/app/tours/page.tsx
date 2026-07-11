import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import ToursSection from '@/components/ToursSection';
import type { DbTour } from '@/components/ToursSection';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tours — Mavicure Travel Tours',
  description: 'Explora todos nuestros paquetes de tours por Colombia. Desde el Amazonas hasta el Caribe.',
};

async function getTours(): Promise<DbTour[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('tours')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    return data || [];
  } catch {
    return [];
  }
}

export default async function ToursPage() {
  const initialTours = await getTours();

  return (
    <main className='pt-20'>
      <Navbar />
      <PageHero
        page="tours"
        defaults={{
          badge: { es: 'Colombia', en: 'Colombia' },
          title: { es: 'Nuestros Tours', en: 'Our Tours' },
          subtitle: { es: 'Experiencias únicas diseñadas para que descubras la Colombia auténtica.', en: 'Unique experiences designed for you to discover authentic Colombia.' },
        }}
      />
      <ToursSection initialTours={initialTours} />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
