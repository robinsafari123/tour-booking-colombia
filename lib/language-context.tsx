'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type Lang = 'es' | 'en';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  es: {
    // Navbar
    'nav.tours': 'Tours',
    'nav.about': 'Nosotros',
    'nav.whyus': '¿Por qué nosotros?',
    'nav.testimonials': 'Testimonios',
    'nav.contact': 'Contacto',
    'nav.book': 'Reservar ahora',

    // Hero
    'hero.title': 'Mavicure Travel Tours',
    'hero.subtitle': 'Desde las místicas cumbres de granito de Guainía hasta la turquesa costa del Caribe — Mavicure Travel Tours crea aventuras auténticas lideradas por las personas que llaman a Colombia su hogar.',
    'hero.cta.tours': 'Ver tours',
    'hero.cta.book': 'Reservar ahora',
    'hero.scroll': 'Desliza para explorar',

    // Tours
    'tours.label': 'Explora Colombia',
    'tours.title': 'Nuestros tours destacados',
    'tours.subtitle': 'Experiencias a medida desde el Amazonas hasta el Caribe — cada tour liderado por expertos locales que aman Colombia tanto como tú lo harás.',
    'tours.people': 'personas',
    'tours.book': 'Más información',

    // About
    'about.label': 'Quiénes somos',
    'about.title': 'Nacidos en Colombia,\nhechos para exploradores',
    'about.body': 'Mavicure Travel Tours fue fundada por un grupo de aventureros colombianos que querían compartir la cruda y asombrosa belleza de su tierra natal con el mundo. Desde los gigantes de granito de Guainía hasta el encanto colonial de Cartagena, diseñamos viajes que van más allá de la superficie.',
    'about.value1.title': 'Raíces Locales',
    'about.value1.desc': 'Somos colombianos que crecimos explorando estas tierras. Cada tour refleja nuestro profundo amor y respeto por nuestro país.',
    'about.value2.title': 'Guías Expertos',
    'about.value2.desc': 'Todos nuestros guías están certificados, son bilingües y tienen formación en primeros auxilios — garantizando tu seguridad y enriqueciendo tu experiencia.',
    'about.value3.title': 'Turismo Sostenible',
    'about.value3.desc': 'Nos asociamos con comunidades indígenas y eco-lodges, asegurando que el turismo beneficie a las personas locales y proteja la naturaleza.',
    'about.stat1': 'Viajeros Felices',
    'about.stat2': 'Tours Disponibles',
    'about.stat3': 'Años de Experiencia',
    'about.stat4': 'Calificación Promedio',

    // WhyUs
    'whyus.label': 'Por qué elegirnos',
    'whyus.title': 'La diferencia Mavicure',
    'whyus.subtitle': 'Nos esforzamos por superar las expectativas en cada viaje que organizamos.',

    // Booking
    'booking.label': 'Reserva tu tour',
    'booking.title': '¿Listo para tu\naventura colombiana?',
    'booking.subtitle': 'Completa el formulario y nuestro equipo te contactará en 24 horas con una cotización personalizada. Sin compromiso.',
    'booking.response': 'Tiempo de respuesta',
    'booking.response.val': 'En menos de 24 horas',
    'booking.free': 'Consulta gratuita',
    'booking.free.val': 'Sin costo por consultar',
    'booking.flexible': 'Reserva flexible',
    'booking.flexible.val': 'Cancela hasta 14 días antes',
    'booking.name': 'Nombre completo',
    'booking.email': 'Correo electrónico',
    'booking.phone': 'Teléfono / WhatsApp',
    'booking.tour': 'Selecciona un tour',
    'booking.tour.placeholder': 'Elige un tour…',
    'booking.date': 'Fecha preferida',
    'booking.guests': 'Número de personas',
    'booking.message': 'Solicitudes especiales (opcional)',
    'booking.message.placeholder': 'Restricciones alimentarias, necesidades especiales, preguntas...',
    'booking.submit': 'Enviar solicitud de reserva',
    'booking.privacy': 'Al enviar aceptas nuestra política de privacidad. No se requiere pago en esta etapa.',
    'booking.success.title': '¡Solicitud enviada!',
    'booking.success.body': 'Gracias, {name}. Nuestro equipo se pondrá en contacto contigo en {email} en menos de 24 horas.',
    'booking.success.again': 'Enviar otra solicitud',
    'booking.pay': 'Pagar con Wompi',
    'booking.total': 'Total',

    // Testimonials
    'testimonials.label': 'Testimonios',
    'testimonials.title': 'Lo que dicen nuestros viajeros',
    'testimonials.subtitle': 'Historias reales de personas que exploraron Colombia con nosotros.',

    // Contact / Footer
    'footer.tagline': 'Experiencias auténticas de viaje por Colombia diseñadas para conectarte con la naturaleza, la cultura y la comunidad.',
    'footer.location': 'Bogotá, Colombia',
    'footer.privacy': 'Política de privacidad',
    'footer.terms': 'Términos de servicio',
    'footer.cookies': 'Política de cookies',
    'footer.rights': '© 2025 Mavicure Travel Tours. Todos los derechos reservados.',
    'footer.tours': 'Tours',
    'footer.company': 'Empresa',
    'footer.support': 'Soporte',
    'footer.company.about': 'Sobre nosotros',
    'footer.company.guides': 'Nuestros guías',
    'footer.company.sustainability': 'Sostenibilidad',
    'footer.company.blog': 'Blog',
    'footer.support.book': 'Reserva un tour',
    'footer.support.faq': 'Preguntas frecuentes',
    'footer.support.insurance': 'Seguro de viaje',
    'footer.support.cancel': 'Política de cancelación',
    'footer.support.contact': 'Contáctanos',
  },
  en: {
    // Navbar
    'nav.tours': 'Tours',
    'nav.about': 'About Us',
    'nav.whyus': 'Why Us',
    'nav.testimonials': 'Testimonials',
    'nav.contact': 'Contact',
    'nav.book': 'Book Now',

    // Hero
    'hero.title': 'Mavicure Travel Tours',
    'hero.subtitle': 'From the mystical granite peaks of Guainía to the turquoise Caribbean coast — Mavicure Travel Tours crafts authentic adventures led by the people who call Colombia home.',
    'hero.cta.tours': 'Explore Tours',
    'hero.cta.book': 'Book a Tour',
    'hero.scroll': 'Scroll to explore',

    // Tours
    'tours.label': 'Explore Colombia',
    'tours.title': 'Our Featured Tours',
    'tours.subtitle': 'Handcrafted experiences from the Amazon to the Caribbean — each tour led by local experts who love Colombia as much as you will.',
    'tours.people': 'people',
    'tours.book': 'More information',

    // About
    'about.label': 'Who We Are',
    'about.title': 'Born in Colombia,\nMade for Explorers',
    'about.body': 'Mavicure Travel Tours was founded by a group of Colombian adventurers who wanted to share the raw, breathtaking beauty of their homeland with the world. From the granite giants of Guainía to the colonial charm of Cartagena, we design journeys that go beyond the surface.',
    'about.value1.title': 'Locally Rooted',
    'about.value1.desc': 'We are Colombians who grew up exploring these lands. Every tour reflects our deep love and respect for our country.',
    'about.value2.title': 'Expert Guides',
    'about.value2.desc': 'All our guides are certified, bilingual, and trained in first aid — ensuring your safety and enriching your experience.',
    'about.value3.title': 'Sustainable Travel',
    'about.value3.desc': 'We partner with indigenous communities and eco-lodges, ensuring tourism benefits local people and protects nature.',
    'about.stat1': 'Happy Travelers',
    'about.stat2': 'Tours Available',
    'about.stat3': 'Years Experience',
    'about.stat4': 'Average Rating',

    // WhyUs
    'whyus.label': 'Why Choose Us',
    'whyus.title': 'The Mavicure Difference',
    'whyus.subtitle': 'We go the extra mile to exceed expectations on every trip we organize.',

    // Booking
    'booking.label': 'Book Your Tour',
    'booking.title': 'Ready for Your\nColombian Adventure?',
    'booking.subtitle': 'Fill in the form and our team will get back to you within 24 hours with a personalized quote and itinerary. No commitment required.',
    'booking.response': 'Response time',
    'booking.response.val': 'Within 24 hours',
    'booking.free': 'Free consultation',
    'booking.free.val': 'No booking fee to inquire',
    'booking.flexible': 'Flexible booking',
    'booking.flexible.val': 'Cancel up to 14 days before',
    'booking.name': 'Full Name',
    'booking.email': 'Email Address',
    'booking.phone': 'Phone / WhatsApp',
    'booking.tour': 'Select Tour',
    'booking.tour.placeholder': 'Choose a tour…',
    'booking.date': 'Preferred Date',
    'booking.guests': 'Number of Guests',
    'booking.message': 'Special Requests (optional)',
    'booking.message.placeholder': 'Dietary restrictions, mobility needs, questions...',
    'booking.submit': 'Send Booking Request',
    'booking.privacy': 'By submitting you agree to our privacy policy. No payment required at this stage.',
    'booking.success.title': 'Booking Request Sent!',
    'booking.success.body': 'Thank you, {name}. Our team will reach out to {email} within 24 hours.',
    'booking.success.again': 'Submit Another Request',
    'booking.pay': 'Pay with Wompi',
    'booking.total': 'Total',

    // Testimonials
    'testimonials.label': 'Testimonials',
    'testimonials.title': 'What Our Travelers Say',
    'testimonials.subtitle': 'Real stories from people who explored Colombia with us.',

    // Contact / Footer
    'footer.tagline': 'Authentic Colombian travel experiences designed to connect you with nature, culture, and community.',
    'footer.location': 'Bogotá, Colombia',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',
    'footer.rights': '© 2025 Mavicure Travel Tours. All rights reserved.',
    'footer.tours': 'Tours',
    'footer.company': 'Company',
    'footer.support': 'Support',
    'footer.company.about': 'About Us',
    'footer.company.guides': 'Our Guides',
    'footer.company.sustainability': 'Sustainability',
    'footer.company.blog': 'Blog',
    'footer.support.book': 'Book a Tour',
    'footer.support.faq': 'FAQ',
    'footer.support.insurance': 'Travel Insurance',
    'footer.support.cancel': 'Cancellation Policy',
    'footer.support.contact': 'Contact Us',
  },
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'es',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
    }
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] ?? translations['es'][key] ?? key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
