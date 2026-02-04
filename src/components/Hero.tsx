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
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-accent/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-purple/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-cyan/20 rounded-full blur-lg animate-float" style={{ animationDelay: '4s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full glass text-sm font-medium mb-8">
            {t?.hero?.badge || 'AI-Powered Growth Solutions'}
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            {t?.hero?.title || 'Secure, Production-Ready AI'}{' '}
            <br className="hidden md:block" />
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              {t?.hero?.titleAccent || 'That Delivers Real Results'}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
            {t?.hero?.subtitle || 'We build practical, secure AI solutions that turn your data into measurable business results.'}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t?.hero?.subtitle2 || 'From concept to production, we partner with you to deliver sustainable, trustworthy growth.'}
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent text-lg px-8 py-6 hover:scale-105"
              onClick={() => navigate(`${langPrefix}/about`)}
            >
              <Play className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t?.hero?.cta || 'Learn Our Story'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;