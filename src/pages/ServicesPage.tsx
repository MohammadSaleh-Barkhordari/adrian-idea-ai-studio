import Navigation from '@/components/Navigation';
import Services from '@/components/Services';
import Footer from '@/components/Footer';
import MouseTrail from '@/components/MouseTrail';
import useSmoothScroll from '@/hooks/useSmoothScroll';

const ServicesPage = () => {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <MouseTrail />
      <Navigation />
      <main className="relative z-10 pt-20">
        <Services />
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;