import Navigation from '@/components/Navigation';
import CaseStudies from '@/components/CaseStudies';
import Footer from '@/components/Footer';
import MouseTrail from '@/components/MouseTrail';
import useSmoothScroll from '@/hooks/useSmoothScroll';

const CaseStudiesPage = () => {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <MouseTrail />
      <Navigation />
      <main className="relative z-10 pt-20">
        <CaseStudies />
      </main>
      <Footer />
    </div>
  );
};

export default CaseStudiesPage;