import Navigation from '@/components/Navigation';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import MouseTrail from '@/components/MouseTrail';
import useSmoothScroll from '@/hooks/useSmoothScroll';

const ContactPage = () => {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <MouseTrail />
      <Navigation />
      <main className="relative z-10 pt-20">
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;