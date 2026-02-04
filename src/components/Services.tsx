import { Search, Target, Wrench, Rocket, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const Services = () => {
  const { t } = useLanguage();
  
  const serviceIcons = [Search, Target, Wrench, Rocket, Users, TrendingUp];
  const services = t?.services?.services || [];

return (
    <section id="services" className="">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            {t?.services?.badge}
          </div>
          
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            {t?.services?.title}{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              {t?.services?.titleAccent}
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            {t?.services?.subtitle}
          </p>
        </div>

        {/* Services Grid - Bento Layout */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {services.map((service: any, index: number) => {
            const IconComponent = serviceIcons[index];
            return (
              <div
                key={service.title}
                className="group relative overflow-hidden animate-slide-up flex"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background gradient for each card */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-purple/5 to-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                {/* Main Card */}
                <div className="relative bg-background/30 backdrop-blur-sm rounded-2xl p-8 hover:shadow-glow transition-all duration-500 w-full flex flex-col">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-accent" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-display font-semibold mb-4 group-hover:text-accent transition-colors duration-300 whitespace-nowrap">
                    {service.title}
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                    
                    {/* Detailed Service Information */}
                    <div className="space-y-3 pt-4 border-t border-muted/20">
                      <h4 className="font-semibold text-sm text-accent">{t?.services?.whatsIncluded}</h4>
                      <div className="space-y-2">
                        {service.details?.map((detail: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="glass rounded-3xl p-12 max-w-4xl mx-auto border border-glass-border">
            <h3 className="text-3xl font-display font-bold mb-6">
              {t?.services?.ctaTitle}{' '}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                {t?.services?.ctaTitleAccent}
              </span>
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t?.services?.ctaSubtitle}
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-accent text-white hover:shadow-glow-accent transition-all duration-300 text-lg px-8 py-6"
              onClick={() => window.location.href = '/contact'}
            >
              {t?.services?.ctaButton}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;