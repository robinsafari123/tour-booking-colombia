'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Save, ImageIcon, Type, Loader2, CheckCircle,
  Home, Map, Users, Phone, BookOpen, Globe,
  RefreshCw, ExternalLink, Upload, X, Edit3, Settings,
  Eye, EyeOff,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminFetch } from '@/lib/admin-fetch';

/* ─── Types ─────────────────────────────────────────────── */
interface ContentField {
  id?: string;
  page: string;
  section: string;
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image_url';
  default_es: string;
  default_en: string;
  value_es: string;
  value_en: string;
  canHide?: boolean;
}

const FONT_SIZES = [
  { label: 'XS',   value: '0.75rem'  },
  { label: 'SM',   value: '0.875rem' },
  { label: 'Base', value: '1rem'     },
  { label: 'LG',   value: '1.125rem' },
  { label: 'XL',   value: '1.25rem'  },
  { label: '2XL',  value: '1.5rem'   },
  { label: '3XL',  value: '1.875rem' },
  { label: '4XL',  value: '2.25rem'  },
  { label: '5XL',  value: '3rem'     },
  { label: '6XL',  value: '3.75rem'  },
];

/* ─── Page meta ──────────────────────────────────────────── */
const PAGES = [
  { key: 'global',   label: 'Global',   icon: Settings, path: '/',          color: 'gray' },
  { key: 'home',     label: 'Inicio',   icon: Home,     path: '/',          color: 'emerald' },
  { key: 'tours',    label: 'Tours',    icon: Map,      path: '/tours',     color: 'blue' },
  { key: 'nosotros', label: 'Nosotros', icon: Users,    path: '/nosotros',  color: 'purple' },
  { key: 'reservar', label: 'Reservar', icon: BookOpen, path: '/reservar',  color: 'amber' },
  { key: 'contacto', label: 'Contacto', icon: Phone,    path: '/contacto',  color: 'rose' },
] as const;

/* ─── Full content schema with default values ────────────── */
const SCHEMA: ContentField[] = [
  // ══════════════ GLOBAL ══════════════
  // Navigation
  { page:'global', section:'Menú de navegación', key:'nav_home',    label:'Enlace: Inicio',      type:'text', default_es:'Inicio',         default_en:'Home',      value_es:'', value_en:'' },
  { page:'global', section:'Menú de navegación', key:'nav_tours',   label:'Enlace: Tours',       type:'text', default_es:'Tours',          default_en:'Tours',     value_es:'', value_en:'' },
  { page:'global', section:'Menú de navegación', key:'nav_about',   label:'Enlace: Nosotros',    type:'text', default_es:'Nosotros',       default_en:'About Us',  value_es:'', value_en:'' },
  { page:'global', section:'Menú de navegación', key:'nav_contact', label:'Enlace: Contacto',    type:'text', default_es:'Contacto',       default_en:'Contact',   value_es:'', value_en:'' },
  { page:'global', section:'Menú de navegación', key:'nav_book',    label:'Botón reservar',      type:'text', default_es:'Reservar ahora', default_en:'Book Now',  value_es:'', value_en:'' },
  // Contact info
  { page:'global', section:'Información de contacto', key:'contact_phone',    label:'Teléfono',                   type:'text', default_es:'+57 300 123 4567',          default_en:'+57 300 123 4567',          value_es:'', value_en:'' },
  { page:'global', section:'Información de contacto', key:'contact_email',    label:'Correo electrónico',         type:'text', default_es:'hola@mavicuretours.com',    default_en:'hola@mavicuretours.com',    value_es:'', value_en:'' },
  { page:'global', section:'Información de contacto', key:'contact_address',  label:'Dirección / Ciudad',         type:'text', default_es:'Bogotá, Colombia',          default_en:'Bogotá, Colombia',          value_es:'', value_en:'' },
  { page:'global', section:'Información de contacto', key:'contact_whatsapp', label:'WhatsApp (con código país)', type:'text', default_es:'573001234567',              default_en:'573001234567',              value_es:'', value_en:'' },
  { page:'global', section:'Información de contacto', key:'whatsapp_message', label:'Mensaje pre-cargado de WhatsApp', type:'textarea', default_es:'Hola, me interesa información sobre los tours de Colombia', default_en:'Hello, I am interested in information about Colombia tours', value_es:'', value_en:'' },
  // Footer
  { page:'global', section:'Footer', key:'footer_tagline', label:'Eslogan del pie de página', type:'textarea', default_es:'Tu agencia de confianza para descubrir la magia de Colombia.', default_en:'Your trusted agency to discover the magic of Colombia.', value_es:'', value_en:'' },
  { page:'global', section:'Footer', key:'footer_fb_url',  label:'URL de Facebook',           type:'text',     default_es:'https://facebook.com/mavicuretours',   default_en:'https://facebook.com/mavicuretours',   value_es:'', value_en:'' },
  { page:'global', section:'Footer', key:'footer_ig_url',  label:'URL de Instagram',          type:'text',     default_es:'https://instagram.com/mavicuretours',  default_en:'https://instagram.com/mavicuretours',  value_es:'', value_en:'' },

  // ══════════════ HOME ══════════════
  // Hero
  { page:'home', section:'Hero', key:'hero_image',    label:'Imagen de fondo',       type:'image_url', default_es:'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1920&q=90', default_en:'', value_es:'', value_en:'' },
  { page:'home', section:'Hero', key:'hero_title',    label:'Título principal',       type:'text',      default_es:'Descubre la Colombia real',                                               default_en:'Discover the real Colombia', value_es:'', value_en:'' },
  { page:'home', section:'Hero', key:'hero_slogan',   label:'Eslogan (texto cursivo)', type:'text',     default_es:'"Explora lo auténtico, siente lo nuestro en la tierra de muchas Aguas"',  default_en:'"Explore the authentic, feel what is ours in the land of many Waters"', value_es:'', value_en:'' },
  { page:'home', section:'Hero', key:'hero_cta_tours',label:'Botón "Ver Tours"',      type:'text',      default_es:'Ver tours',    default_en:'Explore Tours',  value_es:'', value_en:'' },
  { page:'home', section:'Hero', key:'hero_cta_book', label:'Botón "Reservar"',       type:'text',      default_es:'Reservar ahora', default_en:'Book a Tour', value_es:'', value_en:'' },
  // Featured Tours section
  { page:'home', section:'Sección: Tours Destacados', key:'featured_label',   label:'Etiqueta superior',  type:'text',     default_es:'Destinos',        default_en:'Destinations',       value_es:'', value_en:'' },
  { page:'home', section:'Sección: Tours Destacados', key:'featured_title',   label:'Título',             type:'text',     default_es:'Tours destacados', default_en:'Featured Tours',   value_es:'', value_en:'' },
  { page:'home', section:'Sección: Tours Destacados', key:'featured_subtitle',label:'Subtítulo',          type:'textarea', default_es:'Experiencias únicas diseñadas para descubrir la Colombia auténtica.', default_en:'Unique experiences designed to discover authentic Colombia.', value_es:'', value_en:'' },
  { page:'home', section:'Sección: Tours Destacados', key:'featured_viewall', label:'Botón "Ver todos"',  type:'text',     default_es:'Ver todos los tours',    default_en:'View all tours',         value_es:'', value_en:'' },
  // Why Us section
  { page:'home', section:'Sección: Por qué Mavicure', key:'whyus_label',   label:'Etiqueta superior', type:'text', default_es:'Por qué Mavicure',    default_en:'Why Mavicure',    value_es:'', value_en:'' },
  { page:'home', section:'Sección: Por qué Mavicure', key:'whyus_title',   label:'Título',            type:'text', default_es:'La diferencia Mavicure', default_en:'The Mavicure Difference', value_es:'', value_en:'' },
  { page:'home', section:'Sección: Por qué Mavicure', key:'whyus_subtitle',label:'Subtítulo',         type:'text', default_es:'Vamos más allá de los tours. Creamos recuerdos que permanecen contigo.', default_en:'We go beyond tours. We create memories that stay with you.', value_es:'', value_en:'' },
  // Why Us Cards
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card1_title', label:'Tarjeta 1 — Título', canHide:true, type:'text',     default_es:'Itinerarios a medida',    default_en:'Custom Itineraries',  value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card1_desc',  label:'Tarjeta 1 — Texto',  type:'textarea', default_es:'Cada viaje está diseñado según tus intereses, ritmo y presupuesto. Sin paquetes estándar.', default_en:'Every trip is tailored to your interests, pace, and budget. No cookie-cutter packages.', value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card2_title', label:'Tarjeta 2 — Título', canHide:true, type:'text',     default_es:'Seguridad primero',       default_en:'Safety First',        value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card2_desc',  label:'Tarjeta 2 — Texto',  type:'textarea', default_es:'Guías certificados, seguros de viaje y soporte de emergencia 24/7 en cada tour.', default_en:'Certified guides, travel insurance partnerships, and 24/7 emergency support on every tour.', value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card3_title', label:'Tarjeta 3 — Título', canHide:true, type:'text',     default_es:'Soporte 24/7',            default_en:'24/7 Support',        value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card3_desc',  label:'Tarjeta 3 — Texto',  type:'textarea', default_es:'Nuestro equipo local siempre está disponible — antes, durante y después de tu viaje.', default_en:'Our local team is always reachable — before, during, and after your journey.', value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card4_title', label:'Tarjeta 4 — Título', canHide:true, type:'text',     default_es:'Turismo consciente',      default_en:'Eco-Conscious',       value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card4_desc',  label:'Tarjeta 4 — Texto',  type:'textarea', default_es:'Viaje de bajo impacto que apoya comunidades indígenas y preserva los ecosistemas de Colombia.', default_en:"Low-impact travel that supports indigenous communities and preserves Colombia's ecosystems.", value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card5_title', label:'Tarjeta 5 — Título', canHide:true, type:'text',     default_es:'Precios transparentes',   default_en:'Transparent Pricing', value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card5_desc',  label:'Tarjeta 5 — Texto',  type:'textarea', default_es:'Sin cargos ocultos. Lo que ves es lo que pagas — con opciones de pago flexibles.', default_en:'No hidden fees. What you see is what you pay — with flexible payment options available.', value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card6_title', label:'Tarjeta 6 — Título', canHide:true, type:'text',     default_es:'Guías mejor valorados',   default_en:'Top-Rated Guides',    value_es:'', value_en:'' },
  { page:'home', section:'Tarjetas: Por qué Mavicure', key:'whyus_card6_desc',  label:'Tarjeta 6 — Texto',  type:'textarea', default_es:'Nuestros guías tienen un promedio de 4.9 estrellas. Son narradores, naturalistas y amigos.', default_en:"Our guides average a 4.9-star rating. They're storytellers, naturalists, and friends.", value_es:'', value_en:'' },
  // CTA section
  { page:'home', section:'Sección: Llamado a la Acción', key:'cta_title',    label:'Título',           type:'text',     default_es:'¿Listo para tu próxima aventura?',                            default_en:'Ready for your next adventure?',               value_es:'', value_en:'' },
  { page:'home', section:'Sección: Llamado a la Acción', key:'cta_subtitle', label:'Subtítulo',        type:'textarea', default_es:'Contáctanos hoy y diseñamos el viaje perfecto por Colombia.',  default_en:"Contact us today and we'll design the perfect Colombia trip for you.", value_es:'', value_en:'' },
  { page:'home', section:'Sección: Llamado a la Acción', key:'cta_btn1',     label:'Botón 1 (relleno)',type:'text',     default_es:'Hacer una reserva',                                           default_en:'Make a Booking',                               value_es:'', value_en:'' },
  { page:'home', section:'Sección: Llamado a la Acción', key:'cta_btn2',     label:'Botón 2 (borde)',  type:'text',     default_es:'Contáctanos',                                                 default_en:'Contact Us',                                   value_es:'', value_en:'' },

  // ══════════════ TOURS ══════════════
  { page:'tours', section:'Hero', key:'hero_image',    label:'Imagen de fondo',      type:'image_url', default_es:'', default_en:'', value_es:'', value_en:'' },
  { page:'tours', section:'Hero', key:'hero_title',    label:'Título de la página',  type:'text',      default_es:'Nuestros Tours', default_en:'Our Tours', value_es:'', value_en:'' },
  { page:'tours', section:'Hero', key:'hero_subtitle', label:'Subtítulo',            type:'text',      default_es:'Experiencias auténticas en Colombia', default_en:'Authentic experiences in Colombia', value_es:'', value_en:'' },
  { page:'tours', section:'Hero', key:'hero_badge',    label:'Texto badge (arriba)', type:'text',      default_es:'Explora Colombia', default_en:'Explore Colombia', value_es:'', value_en:'' },
  // Tours section header
  { page:'tours', section:'Sección: Listado de tours', key:'tours_label',    label:'Etiqueta superior', type:'text',     default_es:'Explora Colombia',           default_en:'Explore Colombia',           value_es:'', value_en:'' },
  { page:'tours', section:'Sección: Listado de tours', key:'tours_title',    label:'Título',            type:'text',     default_es:'Nuestros tours destacados',  default_en:'Our Featured Tours',         value_es:'', value_en:'' },
  { page:'tours', section:'Sección: Listado de tours', key:'tours_subtitle', label:'Subtítulo',         type:'textarea', default_es:'Experiencias a medida desde el Amazonas hasta el Caribe — cada tour liderado por expertos locales que aman Colombia tanto como tú lo harás.', default_en:'Handcrafted experiences from the Amazon to the Caribbean — each tour led by local experts who love Colombia as much as you will.', value_es:'', value_en:'' },

  // ══════════════ NOSOTROS ══════════════
  { page:'nosotros', section:'Hero', key:'hero_image',    label:'Imagen de fondo',      type:'image_url', default_es:'', default_en:'', value_es:'', value_en:'' },
  { page:'nosotros', section:'Hero', key:'hero_title',    label:'Título de la página',  type:'text',      default_es:'Quiénes Somos',  default_en:'About Us',     value_es:'', value_en:'' },
  { page:'nosotros', section:'Hero', key:'hero_subtitle', label:'Subtítulo',            type:'text',      default_es:'Colombianos que aman compartir su tierra', default_en:'Colombians who love sharing their land', value_es:'', value_en:'' },
  { page:'nosotros', section:'Hero', key:'hero_badge',    label:'Texto badge (arriba)', type:'text',      default_es:'Agencia de Turismo Operadora · RNT 218233', default_en:'Licensed Tour Operator · RNT 218233', value_es:'', value_en:'' },
  // About content
  { page:'nosotros', section:'Sección: Sobre nosotros', key:'about_label',  label:'Etiqueta superior', type:'text',     default_es:'Quiénes somos',   default_en:'Who We Are',   value_es:'', value_en:'' },
  { page:'nosotros', section:'Sección: Sobre nosotros', key:'about_title',  label:'Título',            type:'text',     default_es:'Nacidos en Colombia,\nhechos para exploradores', default_en:'Born in Colombia,\nMade for Explorers', value_es:'', value_en:'' },
  { page:'nosotros', section:'Sección: Sobre nosotros', key:'about_body',   label:'Texto principal',   type:'textarea', default_es:'Mavicure Travel Tours fue fundada por un grupo de aventureros colombianos que querían compartir la cruda y asombrosa belleza de su tierra natal con el mundo.', default_en:'Mavicure Travel Tours was founded by a group of Colombian adventurers who wanted to share the raw, breathtaking beauty of their homeland with the world.', value_es:'', value_en:'' },
  // About values
  { page:'nosotros', section:'Valores', key:'about_value1_title', label:'Valor 1 — Título', type:'text',     default_es:'Raíces Locales',    default_en:'Locally Rooted',    value_es:'', value_en:'' },
  { page:'nosotros', section:'Valores', key:'about_value1_desc',  label:'Valor 1 — Texto',  type:'textarea', default_es:'Somos colombianos que crecimos explorando estas tierras. Cada tour refleja nuestro profundo amor y respeto por nuestro país.', default_en:'We are Colombians who grew up exploring these lands. Every tour reflects our deep love and respect for our country.', value_es:'', value_en:'' },
  { page:'nosotros', section:'Valores', key:'about_value2_title', label:'Valor 2 — Título', type:'text',     default_es:'Guías Expertos',    default_en:'Expert Guides',     value_es:'', value_en:'' },
  { page:'nosotros', section:'Valores', key:'about_value2_desc',  label:'Valor 2 — Texto',  type:'textarea', default_es:'Todos nuestros guías están certificados, son bilingües y tienen formación en primeros auxilios.', default_en:'All our guides are certified, bilingual, and trained in first aid — ensuring your safety and enriching your experience.', value_es:'', value_en:'' },
  { page:'nosotros', section:'Valores', key:'about_value3_title', label:'Valor 3 — Título', type:'text',     default_es:'Turismo Sostenible', default_en:'Sustainable Travel', value_es:'', value_en:'' },
  { page:'nosotros', section:'Valores', key:'about_value3_desc',  label:'Valor 3 — Texto',  type:'textarea', default_es:'Nos asociamos con comunidades indígenas y eco-lodges, asegurando que el turismo beneficie a las personas locales y proteja la naturaleza.', default_en:'We partner with indigenous communities and eco-lodges, ensuring tourism benefits local people and protects nature.', value_es:'', value_en:'' },
  // About stats
  { page:'nosotros', section:'Estadísticas', key:'about_stat1_value', label:'Stat 1 — Número',   type:'text', default_es:'500+', default_en:'500+', value_es:'', value_en:'' },
  { page:'nosotros', section:'Estadísticas', key:'about_stat1_label', label:'Stat 1 — Etiqueta', type:'text', default_es:'Viajeros Felices',  default_en:'Happy Travelers',   value_es:'', value_en:'' },
  { page:'nosotros', section:'Estadísticas', key:'about_stat2_value', label:'Stat 2 — Número',   type:'text', default_es:'12+',   default_en:'12+',  value_es:'', value_en:'' },
  { page:'nosotros', section:'Estadísticas', key:'about_stat2_label', label:'Stat 2 — Etiqueta', type:'text', default_es:'Tours Disponibles',  default_en:'Tours Available',   value_es:'', value_en:'' },
  { page:'nosotros', section:'Estadísticas', key:'about_stat3_value', label:'Stat 3 — Número',   type:'text', default_es:'8',     default_en:'8',    value_es:'', value_en:'' },
  { page:'nosotros', section:'Estadísticas', key:'about_stat3_label', label:'Stat 3 — Etiqueta', type:'text', default_es:'Años de Experiencia', default_en:'Years Experience',  value_es:'', value_en:'' },
  { page:'nosotros', section:'Estadísticas', key:'about_stat4_value', label:'Stat 4 — Número',   type:'text', default_es:'4.9★',  default_en:'4.9★', value_es:'', value_en:'' },
  { page:'nosotros', section:'Estadísticas', key:'about_stat4_label', label:'Stat 4 — Etiqueta', type:'text', default_es:'Calificación Promedio', default_en:'Average Rating',  value_es:'', value_en:'' },
  // Nosotros images
  { page:'nosotros', section:'Imágenes: Nosotros', key:'about_main_image',    label:'Imagen #1 — Principal (fondo grande)',  type:'image_url', default_es:'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80', default_en:'', value_es:'', value_en:'' },
  { page:'nosotros', section:'Imágenes: Nosotros', key:'about_thumb_image',   label:'Imagen #2 — Miniatura (tarjeta)',       type:'image_url', default_es:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', default_en:'', value_es:'', value_en:'' },
  { page:'nosotros', section:'Imágenes: Nosotros', key:'about_thumb_caption', label:'Miniatura — Nombre del lugar',          type:'text',      default_es:'Tayrona Beach', default_en:'Tayrona Beach', value_es:'', value_en:'' },
  { page:'nosotros', section:'Imágenes: Nosotros', key:'about_thumb_sub',     label:'Miniatura — País / subtítulo',          type:'text',      default_es:'Colombia', default_en:'Colombia', value_es:'', value_en:'' },
  { page:'nosotros', section:'Imágenes: Nosotros', key:'about_badge_years',   label:'Badge experiencia — Número (ej: 8+)',   type:'text',      default_es:'8+', default_en:'8+', value_es:'', value_en:'' },

  // ══════════════ RESERVAR ══════════════
  { page:'reservar', section:'Hero', key:'hero_image',    label:'Imagen de fondo',      type:'image_url', default_es:'', default_en:'', value_es:'', value_en:'' },
  { page:'reservar', section:'Hero', key:'hero_title',    label:'Título de la página',  type:'text',      default_es:'Reserva tu Tour', default_en:'Book Your Tour', value_es:'', value_en:'' },
  { page:'reservar', section:'Hero', key:'hero_subtitle', label:'Subtítulo',            type:'text',      default_es:'Diseñamos el viaje perfecto para ti',  default_en:'We design the perfect trip for you', value_es:'', value_en:'' },
  // Booking section content
  { page:'reservar', section:'Sección: Formulario de Reserva', key:'booking_label',    label:'Etiqueta superior', type:'text',      default_es:'Reserva tu tour',  default_en:'Book Your Tour',  value_es:'', value_en:'' },
  { page:'reservar', section:'Sección: Formulario de Reserva', key:'booking_title',    label:'Título',            type:'text',      default_es:'¿Listo para tu\naventura colombiana?', default_en:'Ready for Your\nColombian Adventure?', value_es:'', value_en:'' },
  { page:'reservar', section:'Sección: Formulario de Reserva', key:'booking_subtitle', label:'Subtítulo',         type:'textarea',  default_es:'Completa el formulario y nuestro equipo te contactará en 24 horas con una cotización personalizada. Sin compromiso.', default_en:'Fill in the form and our team will get back to you within 24 hours with a personalized quote and itinerary. No commitment required.', value_es:'', value_en:'' },
  { page:'reservar', section:'Sección: Formulario de Reserva', key:'booking_image',    label:'Imagen #3',         type:'image_url', default_es:'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', default_en:'', value_es:'', value_en:'' },
  // Info cards
  { page:'reservar', section:'Tarjetas de información', key:'booking_card1_label', label:'Tarjeta 1 — Título', canHide:true, type:'text', default_es:'Tiempo de respuesta',     default_en:'Response time',         value_es:'', value_en:'' },
  { page:'reservar', section:'Tarjetas de información', key:'booking_card1_value', label:'Tarjeta 1 — Valor',  type:'text', default_es:'En menos de 24 horas',   default_en:'Within 24 hours',       value_es:'', value_en:'' },
  { page:'reservar', section:'Tarjetas de información', key:'booking_card2_label', label:'Tarjeta 2 — Título', canHide:true, type:'text', default_es:'Consulta gratuita',       default_en:'Free consultation',     value_es:'', value_en:'' },
  { page:'reservar', section:'Tarjetas de información', key:'booking_card2_value', label:'Tarjeta 2 — Valor',  type:'text', default_es:'Sin costo por consultar', default_en:'No booking fee to inquire', value_es:'', value_en:'' },
  { page:'reservar', section:'Tarjetas de información', key:'booking_card3_label', label:'Tarjeta 3 — Título', canHide:true, type:'text', default_es:'Reserva flexible',        default_en:'Flexible booking',      value_es:'', value_en:'' },
  { page:'reservar', section:'Tarjetas de información', key:'booking_card3_value', label:'Tarjeta 3 — Valor',  type:'text', default_es:'Cancela hasta 14 días antes', default_en:'Cancel up to 14 days before', value_es:'', value_en:'' },

  // ══════════════ CONTACTO ══════════════
  { page:'contacto', section:'Hero', key:'hero_image',    label:'Imagen de fondo',      type:'image_url', default_es:'', default_en:'', value_es:'', value_en:'' },
  { page:'contacto', section:'Hero', key:'hero_title',    label:'Título de la página',  type:'text',      default_es:'Contáctanos', default_en:'Contact Us', value_es:'', value_en:'' },
  { page:'contacto', section:'Hero', key:'hero_subtitle', label:'Subtítulo',            type:'text',      default_es:'Estamos aquí para ayudarte', default_en:"We're here to help", value_es:'', value_en:'' },
  // Contact section body
  { page:'contacto', section:'Sección: Contacto', key:'contact_section_title',    label:'Título principal',  type:'text',      default_es:'Hablemos de tu viaje soñado',         default_en:"Let's talk about your dream trip",                                                                                           value_es:'', value_en:'' },
  { page:'contacto', section:'Sección: Contacto', key:'contact_section_subtitle', label:'Texto descriptivo', type:'textarea',  default_es:'Nuestro equipo está listo para ayudarte a planear la experiencia colombiana perfecta. Escríbenos por cualquier canal.', default_en:'Our team is ready to help you plan the perfect Colombian experience. Reach us through any channel.', value_es:'', value_en:'' },
];

/* ─── Image compression ──────────────────────────────────── */
async function compressImage(file: File, maxWidth = 1400, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Compression failed')), 'image/jpeg', quality);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* ─── Image upload button ────────────────────────────────── */
function ImageUploadButton({ onUrl }: { onUrl: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const compressed = await compressImage(file).catch(() => file);
    const fd = new FormData();
    fd.append('file', compressed, file.name.replace(/\.[^.]+$/, '.jpg'));
    const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok && data.url) {
      onUrl(data.url);
    } else {
      setError(data.error || 'Error al subir');
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={handleFile} />
      <button
        type='button'
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className='flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-60'
      >
        {uploading ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Upload className='w-3.5 h-3.5' />}
        {uploading ? 'Subiendo...' : 'Subir imagen'}
      </button>
      {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
    </div>
  );
}

/* ─── Single field editor ────────────────────────────────── */
function FieldEditor({
  field, onUpdate, onSave, onHideToggle, saving, saved, initialSize, initialHidden,
}: {
  field: ContentField;
  onUpdate: (page: string, key: string, lang: 'es' | 'en', value: string) => void;
  onSave: (field: ContentField, fontSize: string) => void;
  onHideToggle?: (field: ContentField, hidden: boolean) => void;
  saving: boolean;
  saved: boolean;
  initialSize?: string;
  initialHidden?: boolean;
}) {
  const isImage = field.type === 'image_url';
  const isTextarea = field.type === 'textarea';
  const [localSize, setLocalSize] = useState(initialSize || '');
  const [localHidden, setLocalHidden] = useState(initialHidden || false);

  const esVal = field.value_es || '';
  const enVal = field.value_en || '';

  return (
    <div className='border border-gray-100 rounded-xl overflow-hidden bg-white'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100'>
        <div className='flex items-center gap-2'>
          {isImage ? <ImageIcon className='w-3.5 h-3.5 text-emerald-500' />
            : isTextarea ? <Edit3 className='w-3.5 h-3.5 text-blue-500' />
            : <Type className='w-3.5 h-3.5 text-gray-400' />}
          <span className={`text-xs font-semibold ${localHidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{field.label}</span>
        </div>
        <div className='flex items-center gap-1.5'>
          {field.canHide && (
            <button
              type='button'
              onClick={() => {
                const next = !localHidden;
                setLocalHidden(next);
                onHideToggle?.(field, next);
              }}
              title={localHidden ? 'Mostrar en página' : 'Ocultar de página'}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all ${
                localHidden
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {localHidden ? <EyeOff className='w-3 h-3' /> : <Eye className='w-3 h-3' />}
              {localHidden ? 'Oculto' : 'Visible'}
            </button>
          )}
          <button
            onClick={() => onSave(field, localSize)}
            disabled={saving}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              saved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {saving ? <Loader2 className='w-3 h-3 animate-spin' />
              : saved ? <CheckCircle className='w-3 h-3' />
              : <Save className='w-3 h-3' />}
            {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className={`p-4 space-y-3 ${localHidden ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        {isImage ? (
          <>
            {esVal && (
              <div className='relative rounded-lg overflow-hidden h-32 bg-gray-100'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={esVal} alt='preview' className='w-full h-full object-cover'
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <button
                  onClick={() => onUpdate(field.page, field.key, 'es', '')}
                  className='absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors'
                >
                  <X className='w-3 h-3' />
                </button>
              </div>
            )}
            {!esVal && field.default_es && (
              <div className='relative rounded-lg overflow-hidden h-32 bg-gray-100 opacity-40'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={field.default_es} alt='default preview' className='w-full h-full object-cover'
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='bg-black/60 text-white text-xs px-2 py-1 rounded'>Imagen por defecto</span>
                </div>
              </div>
            )}
            <div className='flex items-center gap-2'>
              <ImageUploadButton onUrl={url => onUpdate(field.page, field.key, 'es', url)} />
              <span className='text-xs text-gray-400'>o</span>
              <Input
                value={esVal}
                onChange={e => onUpdate(field.page, field.key, 'es', e.target.value)}
                placeholder={field.default_es || 'https://... (URL de imagen)'}
                className='flex-1 h-8 text-xs rounded-lg border-gray-200 font-mono'
              />
            </div>
          </>
        ) : (
          <>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label className='text-xs text-gray-400 flex items-center gap-1'>
                  <Globe className='w-3 h-3' /> Español
                </Label>
                {isTextarea ? (
                  <textarea
                    rows={3}
                    value={esVal}
                    onChange={e => onUpdate(field.page, field.key, 'es', e.target.value)}
                    className='w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none'
                    placeholder={field.default_es || 'Texto en español...'}
                  />
                ) : (
                  <Input
                    value={esVal}
                    onChange={e => onUpdate(field.page, field.key, 'es', e.target.value)}
                    className='h-8 text-xs rounded-lg border-gray-200'
                    placeholder={field.default_es || 'Español...'}
                  />
                )}
              </div>
              <div className='space-y-1'>
                <Label className='text-xs text-gray-400 flex items-center gap-1'>
                  <Globe className='w-3 h-3' /> English
                </Label>
                {isTextarea ? (
                  <textarea
                    rows={3}
                    value={enVal}
                    onChange={e => onUpdate(field.page, field.key, 'en', e.target.value)}
                    className='w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none'
                    placeholder={field.default_en || 'Text in English...'}
                  />
                ) : (
                  <Input
                    value={enVal}
                    onChange={e => onUpdate(field.page, field.key, 'en', e.target.value)}
                    className='h-8 text-xs rounded-lg border-gray-200'
                    placeholder={field.default_en || 'English...'}
                  />
                )}
              </div>
            </div>
            {/* Font size picker */}
            <div className='flex items-center gap-1.5 flex-wrap pt-1'>
              <span className='text-xs text-gray-400 mr-1'>Tamaño:</span>
              <button
                type='button'
                onClick={() => setLocalSize('')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  !localSize ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Auto
              </button>
              {FONT_SIZES.map(fs => (
                <button
                  key={fs.value}
                  type='button'
                  onClick={() => setLocalSize(fs.value)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    localSize === fs.value ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {fs.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function ContenidoPage() {
  const [activePage, setActivePage] = useState<string>('global');
  const [fields, setFields] = useState<ContentField[]>(SCHEMA.map(f => ({ ...f })));
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [extrasMap, setExtrasMap] = useState<Record<string, string>>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeMeta = PAGES.find(p => p.key === activePage)!;
  const pageFields = fields.filter(f => f.page === activePage);
  const sections = [...new Set(pageFields.map(f => f.section))];

  useEffect(() => {
    adminFetch('/api/admin/content')
      .then(r => r.ok ? r.json() : [])
      .then((data: Array<{page:string;key:string;id:string;value_es:string;value_en:string}>) => {
        if (data?.length) {
          setFields(prev => prev.map(f => {
            const row = data.find(d => d.page === f.page && d.key === f.key);
            return row ? { ...f, id: row.id, value_es: row.value_es || '', value_en: row.value_en || '' } : f;
          }));
          // Extract companion _size and _hidden values
          const extras: Record<string, string> = {};
          for (const row of data) {
            if (row.key.endsWith('_size')) {
              extras[`${row.page}:${row.key.slice(0, -5)}:size`] = row.value_es || '';
            } else if (row.key.endsWith('_hidden')) {
              extras[`${row.page}:${row.key.slice(0, -7)}:hidden`] = row.value_es || '';
            }
          }
          setExtrasMap(extras);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Reload iframe when page tab changes
  useEffect(() => {
    setIframeKey(k => k + 1);
  }, [activePage]);

  const updateField = useCallback((page: string, key: string, lang: 'es' | 'en', value: string) => {
    setFields(prev => prev.map(f =>
      f.page === page && f.key === key ? { ...f, [`value_${lang}`]: value } : f
    ));
  }, []);

  const saveField = useCallback(async (field: ContentField, fontSize: string) => {
    const uid = `${field.page}_${field.key}`;
    setSaving(uid);
    const payload = {
      page: field.page,
      key: field.key,
      section: field.section,
      value_es: field.value_es,
      value_en: field.value_en,
    };
    const res = await adminFetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.id) {
        setFields(prev => prev.map(f =>
          f.page === field.page && f.key === field.key ? { ...f, id: data.id } : f
        ));
      }
      // Save font size companion
      await adminFetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: field.page, key: `${field.key}_size`, section: field.section, value_es: fontSize, value_en: fontSize }),
      });
      setExtrasMap(prev => ({ ...prev, [`${field.page}:${field.key}:size`]: fontSize }));
      setIframeKey(k => k + 1);
    }
    setSaving(null);
    setSaved(uid);
    setTimeout(() => setSaved(null), 3000);
  }, []);

  const saveHide = useCallback(async (field: ContentField, hidden: boolean) => {
    const value = hidden ? '1' : '';
    setExtrasMap(prev => ({ ...prev, [`${field.page}:${field.key}:hidden`]: value }));
    await adminFetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: field.page, key: `${field.key}_hidden`, section: field.section, value_es: value, value_en: value }),
    });
    setIframeKey(k => k + 1);
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-6 h-6 animate-spin text-emerald-600' />
      </div>
    );
  }

  return (
    <div className='-m-4 sm:-m-6 lg:-m-8 flex flex-col lg:flex-row' style={{ height: 'calc(100vh - 0px)' }}>

      {/* ── LEFT PANEL ── */}
      <div className='w-full lg:w-[440px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-white'>

        {/* Panel header */}
        <div className='px-5 py-4 border-b border-gray-100 bg-gray-50'>
          <h2 className='font-bold text-gray-900 text-base'>Editor de contenido</h2>
          <p className='text-gray-400 text-xs mt-0.5'>Los campos muestran el texto por defecto. Escribe para personalizar y presiona Guardar.</p>
        </div>

        {/* Page tabs */}
        <div className='flex border-b border-gray-100 overflow-x-auto flex-shrink-0 scrollbar-none'>
          {PAGES.map(page => {
            const Icon = page.icon;
            const isActive = activePage === page.key;
            return (
              <button
                key={page.key}
                onClick={() => setActivePage(page.key)}
                className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className='w-3.5 h-3.5' />
                {page.label}
              </button>
            );
          })}
        </div>

        {/* Fields — scrollable */}
        <div className='flex-1 overflow-y-auto p-4 space-y-6'>
          {sections.map(section => (
            <div key={section}>
              <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2'>
                <span className='flex-1 border-t border-gray-100' />
                {section}
                <span className='flex-1 border-t border-gray-100' />
              </p>
              <div className='space-y-3'>
                {pageFields.filter(f => f.section === section).map(field => {
                  const uid = `${field.page}_${field.key}`;
                  return (
                    <FieldEditor
                      key={`${field.page}_${field.key}`}
                      field={field}
                      onUpdate={updateField}
                      onSave={saveField}
                      onHideToggle={saveHide}
                      saving={saving === uid}
                      saved={saved === uid}
                      initialSize={extrasMap[`${field.page}:${field.key}:size`] || ''}
                      initialHidden={extrasMap[`${field.page}:${field.key}:hidden`] === '1'}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Storage note */}
          <div className='bg-amber-50 border border-amber-200 rounded-xl p-3'>
            <p className='text-amber-800 text-xs font-semibold mb-1'>Para subir imágenes:</p>
            <p className='text-amber-700 text-xs'>Ve a tu panel de Supabase → Storage → crea un bucket llamado <code className='bg-amber-100 px-1 rounded'>media</code> y activa la opción Public. Luego podrás subir fotos directamente desde aquí.</p>
          </div>

          <div className='h-4' />
        </div>
      </div>

      {/* ── RIGHT PANEL — LIVE PREVIEW ── */}
      <div className='flex-1 flex flex-col min-w-0 bg-gray-100'>

        {/* Preview toolbar */}
        <div className='flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0'>
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            <div className='w-2.5 h-2.5 rounded-full bg-red-400' />
            <div className='w-2.5 h-2.5 rounded-full bg-yellow-400' />
            <div className='w-2.5 h-2.5 rounded-full bg-green-400' />
            <div className='flex-1 mx-3 bg-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-500 font-mono truncate'>
              {typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}{activeMeta.path}
            </div>
          </div>
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className='flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors font-medium'
          >
            <RefreshCw className='w-3.5 h-3.5' />
            Actualizar
          </button>
          <a
            href={activeMeta.path}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors font-medium'
          >
            <ExternalLink className='w-3.5 h-3.5' />
            Abrir
          </a>
        </div>

        {/* iframe */}
        <div className='flex-1 relative overflow-hidden'>
          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={activeMeta.path}
            className='w-full h-full border-0'
            title={`Preview ${activeMeta.label}`}
          />
        </div>
      </div>
    </div>
  );
}
