import { useEffect, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

const MouseTrail = () => {
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  useEffect(() => {
    let animationId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newPoint: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now(),
      };

      setTrail(prevTrail => {
        const newTrail = [newPoint, ...prevTrail.slice(0, 19)]; // Keep last 20 points
        return newTrail;
      });
    };

    const animateTrail = () => {
      setTrail(prevTrail => 
        prevTrail.filter(point => Date.now() - point.id < 800) // Remove points older than 800ms
      );
      animationId = requestAnimationFrame(animateTrail);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animationId = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trail.map((point, index) => {
        const age = Date.now() - point.id;
        const opacity = Math.max(0, 1 - age / 800);
        const scale = Math.max(0.1, 1 - index * 0.05);
        const size = Math.max(4, 16 - index * 0.8);
        
        return (
          <div
            key={point.id}
            className="absolute rounded-full bg-gradient-accent blur-sm animate-pulse"
            style={{
              left: point.x - size / 2,
              top: point.y - size / 2,
              width: size,
              height: size,
              opacity: opacity * 0.6,
              transform: `scale(${scale})`,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
              boxShadow: `0 0 ${size * 2}px hsl(var(--accent) / ${opacity * 0.3})`,
            }}
          />
        );
      })}
    </div>
  );
};

export default MouseTrail;