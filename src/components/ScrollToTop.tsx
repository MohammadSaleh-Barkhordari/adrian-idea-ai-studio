import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
          <Button
            onClick={scrollToTop}
            size="lg"
            className="w-12 h-12 rounded-full bg-gradient-accent hover:shadow-glow-accent transition-all duration-300 hover:scale-110 shadow-lg"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-6 w-6 text-white" />
          </Button>
        </div>
      )}
    </>
  );
};

export default ScrollToTop;