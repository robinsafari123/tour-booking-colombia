import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import CartWidget from "@/components/CartWidget";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mavicure Travel Tours — Aventuras Auténticas en Colombia",
  description: "Reserva tours inmersivos por Colombia — desde el Amazonas hasta la costa Caribe. Guías locales expertos, turismo responsable, experiencias inolvidables.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Mavicure Travel Tours — Aventuras Auténticas en Colombia",
    description: "Reserva tours inmersivos por Colombia — desde el Amazonas hasta la costa Caribe. Guías locales expertos, turismo responsable, experiencias inolvidables.",
    url: "https://mavicure-travel.vercel.app",
    siteName: "Mavicure Travel Tours",
    images: [{ url: "/og-image.png", width: 1080, height: 1080, alt: "Mavicure Travel Tours" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mavicure Travel Tours — Aventuras Auténticas en Colombia",
    description: "Reserva tours inmersivos por Colombia — desde el Amazonas hasta la costa Caribe.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
          <CartWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
