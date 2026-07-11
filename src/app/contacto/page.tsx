import Navbar from '@/components/Navbar';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto — Mavicure Travel Tours',
  description: 'Contáctanos por WhatsApp, correo o teléfono. Estamos listos para ayudarte a planear tu viaje.',
};

export default function ContactoPage() {
  return (
    <main className='pt-20'>
      <Navbar />
      <PageHero
        page="contacto"
        defaults={{
          badge: { es: 'Estamos aquí para ti', en: 'We are here for you' },
          title: { es: 'Contáctanos', en: 'Contact Us' },
          subtitle: { es: 'Escríbenos por WhatsApp, correo o llénanos el formulario.', en: 'Reach us via WhatsApp, email or fill out the form.' },
        }}
      />
      <ContactSection />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
