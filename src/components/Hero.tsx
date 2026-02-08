import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { language, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const langPrefix = language === 'en' ? '/en' : '';

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90" />
      
      {/* Floating Elements - Hidden on small mobile for performance */}
      <div className="absolute top-20 left-10 w-16 sm:w-20 h-16 sm:h-20 bg-accent/10 rounded-full blur-xl animate-float hidden sm:block" />
      <div className="absolute bottom-32 right-16 w-24 sm:w-32 h-24 sm:h-32 bg-purple/10 rounded-full blur-xl animate-float hidden sm:block" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-12 sm:w-16 h-12 sm:h-16 bg-cyan/20 rounded-full blur-lg animate-float hidden md:block" style={{ animationDelay: '4s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full glass text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            {t?.hero?.badge || 'AI-Powered Growth Solutions'}
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-tight mb-4 sm:mb-6">
            {t?.hero?.title || 'Secure, Production-Ready AI'}{' '}
            <br className="hidden md:block" />
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              {t?.hero?.titleAccent || 'That Delivers Real Results'}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-3 sm:mb-4 max-w-3xl mx-auto leading-relaxed px-2">
            {t?.hero?.subtitle || 'We build practical, secure AI solutions that turn your data into measurable business results.'}
          </p>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground/80 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            {t?.hero?.subtitle2 || 'From concept to production, we partner with you to deliver sustainable, trustworthy growth.'}
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 min-h-[48px] hover:scale-105"
              onClick={() => navigate(`${langPrefix}/about`)}
            >
              <Play className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t?.hero?.cta || 'Learn Our Story'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;