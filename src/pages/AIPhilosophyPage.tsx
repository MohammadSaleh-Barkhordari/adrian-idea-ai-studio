import Navigation from '@/components/Navigation';
import AIPhilosophy from '@/components/AIPhilosophy';
import Footer from '@/components/Footer';
import MouseTrail from '@/components/MouseTrail';
import useSmoothScroll from '@/hooks/useSmoothScroll';

const AIPhilosophyPage = () => {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <MouseTrail />
      <Navigation />
      <main className="relative z-10 pt-20">
        <AIPhilosophy />
      </main>
      <Footer />
    </div>
  );
};

export default AIPhilosophyPage;