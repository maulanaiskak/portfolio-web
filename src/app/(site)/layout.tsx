import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Ambient from '@/components/layout/Ambient';
import MotionProvider from '@/components/layout/MotionProvider';
import { publishedSections } from '@/lib/api';
import { visibleNav } from '@/lib/site';

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nav = visibleNav(await publishedSections());

  return (
    <MotionProvider>
      <Ambient />
      <Navigation items={nav} />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
      <Footer items={nav} />
    </MotionProvider>
  );
}
