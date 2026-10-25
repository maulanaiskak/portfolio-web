import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Ambient from '@/components/layout/Ambient';
import MotionProvider from '@/components/layout/MotionProvider';

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <MotionProvider>
      <Ambient />
      <Navigation />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
      <Footer />
    </MotionProvider>
  );
}
