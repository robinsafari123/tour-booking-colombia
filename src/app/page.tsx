export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import WhyUsSection from '@/components/WhyUsSection';
import HomeCTA from '@/components/HomeCTA';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import type { PageContent } from '@/lib/use-page-content';

async function getHomeContent(): Promise<PageContent> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('page_content')
      .select('key, value_es, value_en')
      .eq('page', 'home');

    const content: PageContent = {};
    for (const row of data || []) {
      content[row.key] = { es: row.value_es || '', en: row.value_en || '' };
    }
    return content;
  } catch {
    return {};
  }
}

export default async function Home() {
  const homeContent = await getHomeContent();

  return (
    <main>
      <Navbar />
      <HeroSection initialContent={homeContent} />
      <WhyUsSection />
      <HomeCTA />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
