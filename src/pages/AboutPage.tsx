import Navigation from '@/components/Navigation';
import About from '@/components/About';
import Footer from '@/components/Footer';
import MouseTrail from '@/components/MouseTrail';
import useSmoothScroll from '@/hooks/useSmoothScroll';

const AboutPage = () => {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <MouseTrail />
      <Navigation />
      <main className="relative z-10 pt-20">
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;