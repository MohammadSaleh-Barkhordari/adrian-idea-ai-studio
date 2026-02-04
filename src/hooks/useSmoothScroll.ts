import { useEffect } from 'react';

const useSmoothScroll = () => {
  useEffect(() => {
    // Add smooth scroll behavior and mobile momentum
    const addScrollMomentum = () => {
      const style = document.body.style as any;
      style.webkitOverflowScrolling = 'touch';
      document.documentElement.style.scrollBehavior = 'smooth';
    };

    addScrollMomentum();
  }, []);
};

export default useSmoothScroll;