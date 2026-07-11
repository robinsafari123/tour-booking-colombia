import Navbar from '@/components/Navbar';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nosotros — Mavicure Travel Tours',
  description: 'Conoce quiénes somos, nuestra misión y por qué somos la mejor agencia de turismo en Colombia.',
};

export default function NosotrosPage() {
  return (
    <main className='pt-20'>
      <Navbar />
      <PageHero
        page="nosotros"
        defaults={{
          badge: { es: 'Agencia de Turismo Operadora · RNT 218233', en: 'Licensed Tour Operator · RNT 218233' },
          title: { es: 'Nosotros', en: 'About Us' },
          subtitle: { es: 'Colombianos apasionados por mostrarle al mundo la magia de nuestra tierra.', en: 'Colombians passionate about showing the world the magic of our land.' },
        }}
      />
      <AboutSection />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
