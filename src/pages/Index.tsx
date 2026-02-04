import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import WhyChooseUs from '@/components/WhyChooseUs';
import Methodology from '@/components/Methodology';
import BlogPreview from '@/components/BlogPreview';
import Footer from '@/components/Footer';
import MouseTrail from '@/components/MouseTrail';
import useSmoothScroll from '@/hooks/useSmoothScroll';

const Index = () => {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <MouseTrail />
      <Navigation />
      <main className="relative z-10">
        <Hero />
        <WhyChooseUs />
        <Methodology />
        <BlogPreview />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
