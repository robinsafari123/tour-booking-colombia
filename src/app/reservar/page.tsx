import Navbar from '@/components/Navbar';
import BookingSection from '@/components/BookingSection';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reservar — Mavicure Travel Tours',
  description: 'Reserva tu tour por Colombia. Elige fecha, número de personas y paga de forma segura con Wompi, PayU, Mercado Pago o PayPal.',
};

export default function ReservarPage() {
  return (
    <main className='pt-20'>
      <Navbar />
      <PageHero
        page='reservar'
        defaults={{
          badge: { es: 'Reservas', en: 'Bookings' },
          title: { es: 'Reserva tu Tour', en: 'Book Your Tour' },
          subtitle: {
            es: 'Elige tu aventura, selecciona la fecha y paga de forma segura.',
            en: 'Choose your adventure, pick a date, and pay securely.',
          },
        }}
      />
      <BookingSection />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
