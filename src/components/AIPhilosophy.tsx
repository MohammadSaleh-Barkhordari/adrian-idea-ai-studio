import { CheckCircle2, Shield, Target, Scaling, Heart, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AIPhilosophy = () => {
  const { t } = useLanguage();
  
  const iconMap = [Zap, Shield, Target, Scaling, Heart];
  const principles = (t?.aiPhilosophy?.principles || []).map((principle: any, index: number) => ({
    ...principle,
    icon: iconMap[index],
    color: index % 3 === 0 ? 'text-accent' : index % 3 === 1 ? 'text-purple' : 'text-cyan',
    bgColor: index % 3 === 0 ? 'bg-accent/20' : index % 3 === 1 ? 'bg-purple/20' : 'bg-cyan/20'
  }));

  return (
    <section id="philosophy" className="relative overflow-hidden">
      {/* Dynamic background elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-32 right-16 w-60 h-60 bg-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-cyan/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center px-6 py-3 rounded-full text-cyan text-sm font-medium mb-8 bg-cyan/10 backdrop-blur-sm">
            {t?.aiPhilosophy?.badge}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
            {t?.aiPhilosophy?.title}{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              {t?.aiPhilosophy?.titleAccent}
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t?.aiPhilosophy?.subtitle}
          </p>
        </div>

        {/* Interactive Principles Grid */}
        <div className="max-w-4xl mx-auto space-y-6 mb-20">
          {principles.map((principle, index) => (
            <div
              key={principle.title}
              className="group relative overflow-hidden animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                principle.color === 'text-accent' 
                  ? 'from-accent/20 via-cyan/10 to-purple/5' 
                  : principle.color === 'text-purple' 
                  ? 'from-purple/20 via-accent/10 to-cyan/5' 
                  : 'from-cyan/20 via-purple/10 to-accent/5'
              } opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl transform rotate-1 group-hover:rotate-0`} />
              
              {/* Main Card */}
              <div className="relative bg-background/50 backdrop-blur-xl rounded-3xl p-12 hover:shadow-2xl transition-all duration-700 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex items-start gap-8">
                  {/* Icon with pulsing effect */}
                  <div className={`w-24 h-24 ${principle.bgColor} rounded-3xl flex items-center justify-center group-hover:scale-125 transition-all duration-500 relative flex-shrink-0`}>
                    <principle.icon className={`h-12 w-12 ${principle.color} group-hover:animate-pulse`} />
                    <div className={`absolute inset-0 ${principle.bgColor} rounded-3xl animate-ping opacity-25 group-hover:opacity-50`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                     <h3 className={`text-2xl font-display font-bold mb-4 group-hover:${principle.color} transition-all duration-500 transform group-hover:scale-105`}>
                       {principle.title}
                     </h3>
                     
                     <p className="text-muted-foreground leading-relaxed text-base mb-4 group-hover:text-foreground transition-colors duration-300">
                      {principle.description}
                    </p>

                     {/* Interactive indicator */}
                     <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                       <CheckCircle2 className={`h-6 w-6 ${principle.color} mr-3 animate-bounce`} />
                     </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity duration-500">
                  <div className={`w-12 h-12 ${principle.color.replace('text-', 'bg-')} rounded-full animate-pulse`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Philosophy Statement */}
        <div className="max-w-6xl mx-auto animate-fade-in mb-20" style={{ animationDelay: '0.8s' }}>
          <div className="relative bg-background/40 backdrop-blur-2xl rounded-4xl p-16 text-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-purple/5 to-cyan/5" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]" />
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-8 bg-gradient-accent bg-clip-text text-transparent">
                {t?.aiPhilosophy?.philosophyTitle}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-12 max-w-4xl mx-auto">
                {t?.aiPhilosophy?.philosophySubtitle}
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                <div className="group text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/30 transition-colors duration-300">
                    <CheckCircle2 className="h-8 w-8 text-accent" />
                  </div>
                  <span className="font-bold text-accent block">{t?.aiPhilosophy?.pillars?.ethicalByDesign?.title}</span>
                  <span className="text-sm text-muted-foreground">{t?.aiPhilosophy?.pillars?.ethicalByDesign?.subtitle}</span>
                </div>
                <div className="group text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple/30 transition-colors duration-300">
                    <CheckCircle2 className="h-8 w-8 text-purple" />
                  </div>
                  <span className="font-bold text-purple block">{t?.aiPhilosophy?.pillars?.businessFirst?.title}</span>
                  <span className="text-sm text-muted-foreground">{t?.aiPhilosophy?.pillars?.businessFirst?.subtitle}</span>
                </div>
                <div className="group text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-cyan/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan/30 transition-colors duration-300">
                    <CheckCircle2 className="h-8 w-8 text-cyan" />
                  </div>
                  <span className="font-bold text-cyan block">{t?.aiPhilosophy?.pillars?.measurableImpact?.title}</span>
                  <span className="text-sm text-muted-foreground">{t?.aiPhilosophy?.pillars?.measurableImpact?.subtitle}</span>
                </div>
                <div className="group text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-accent/30 group-hover:to-purple/30 transition-all duration-300">
                    <Shield className="h-8 w-8 text-accent" />
                  </div>
                  <span className="font-bold text-accent block">{t?.aiPhilosophy?.pillars?.dataProtection?.title}</span>
                  <span className="text-sm text-muted-foreground">{t?.aiPhilosophy?.pillars?.dataProtection?.subtitle}</span>
                </div>
              </div>
              
              {/* Enhanced Data Protection Section */}
              <div className="mt-12 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-accent/5 via-purple/5 to-cyan/5 rounded-2xl p-8 border border-accent/20">
                  <h4 className="text-xl font-display font-bold mb-6 text-center bg-gradient-accent bg-clip-text text-transparent">
                    {t?.aiPhilosophy?.dataProtectionTitle}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    {(t?.aiPhilosophy?.dataProtection || []).map((item: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <Shield className={`h-5 w-5 ${index % 3 === 0 ? 'text-accent' : index % 3 === 1 ? 'text-purple' : 'text-cyan'} mt-0.5 flex-shrink-0`} />
                        <div>
                          <span className="font-semibold text-foreground block">{item.title}</span>
                          <span className="text-muted-foreground">{item.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Approach Section */}
        <div className="max-w-4xl mx-auto mb-20 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-6">
              {t?.aiPhilosophy?.approachTitle?.split(' ')[0]}{' '}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                {t?.aiPhilosophy?.approachTitle?.split(' ').slice(1).join(' ')}
              </span>
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t?.aiPhilosophy?.approachSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {(t?.aiPhilosophy?.approach || []).map((item: any, index: number) => (
              <div key={index} className="bg-background/50 backdrop-blur-sm rounded-2xl p-8 border border-background/20">
                <h4 className={`text-xl font-display font-bold mb-4 ${index % 3 === 0 ? 'text-accent' : index % 3 === 1 ? 'text-purple' : 'text-cyan'}`}>
                  {item.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why This Matters Section */}
        <div className="max-w-6xl mx-auto mb-20 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="bg-gradient-to-br from-background/60 via-muted/10 to-background/60 backdrop-blur-xl rounded-3xl p-12 border border-background/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple/5 to-transparent rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-6">
                  {t?.aiPhilosophy?.whyMattersTitle?.split(' ')[0]}{' '}
                  <span className="bg-gradient-accent bg-clip-text text-transparent">
                    {t?.aiPhilosophy?.whyMattersTitle?.split(' ').slice(1).join(' ')}
                  </span>
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  {t?.aiPhilosophy?.whyMattersSubtitle}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {(t?.aiPhilosophy?.whyMatters || []).map((item: any, index: number) => {
                  const icons = [Target, Shield, Heart];
                  const Icon = icons[index];
                  const colors = ['accent', 'purple', 'cyan'];
                  const color = colors[index];
                  return (
                    <div key={index} className="text-center">
                      <div className={`w-20 h-20 bg-gradient-to-br from-${color}/20 to-${color}/10 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <Icon className={`h-10 w-10 text-${color}`} />
                      </div>
                      <h4 className="text-lg font-display font-bold mb-3">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Our Commitment Section */}
        <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '1.4s' }}>
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-8">
              {t?.aiPhilosophy?.commitmentTitle?.split(' ').slice(0, -2).join(' ')}{' '}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                {t?.aiPhilosophy?.commitmentTitle?.split(' ').slice(-2, -1).join(' ')}
              </span>{' '}
              {t?.aiPhilosophy?.commitmentTitle?.split(' ').slice(-1).join(' ')}
            </h3>
            
            <div className="bg-background/30 backdrop-blur-sm rounded-2xl p-10 border border-background/20">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {t?.companyName && `${t?.aiPhilosophy?.philosophySubtitle}`}
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                {(t?.aiPhilosophy?.commitment || []).slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${index === 0 ? 'text-accent' : index === 1 ? 'text-purple' : 'text-cyan'}`} />
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIPhilosophy;