import { Search, Target, Wrench, Rocket, Users, TrendingUp, CheckCircle, Shield, Zap, Heart, Scaling } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();
  
  const iconMap = [Zap, Target, Search, TrendingUp, Rocket, Users];
  const evolutionPhases = (t?.about?.evolutionPhases || []).map((phase: any, index: number) => ({
    ...phase,
    icon: iconMap[index],
    color: index % 3 === 0 ? 'accent' : index % 3 === 1 ? 'purple' : 'cyan'
  }));

  const philosophy = [
    {
      icon: Zap,
      title: 'Practical & Actionable',
      description: 'We build AI that solves real problems and delivers measurable results from day one.',
      color: 'accent'
    },
    {
      icon: Shield,
      title: 'Secure & Ethical',
      description: 'Every solution prioritizes data privacy, security, and ethical AI practices from the ground up.',
      color: 'purple'
    },
    {
      icon: Target,
      title: 'Business-Aligned',
      description: 'Our AI strategies are designed around your specific KPIs and business objectives.',
      color: 'cyan'
    },
    {
      icon: Scaling,
      title: 'Scalable',
      description: 'Built to grow with your business, from proof-of-concept to enterprise-wide deployment.',
      color: 'accent'
    },
    {
      icon: Heart,
      title: 'Human-Centric',
      description: 'AI that enhances human capabilities and decision-making rather than replacing people.',
      color: 'purple'
    }
  ];

  return (
    <section id="about" className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-32 right-16 w-60 h-60 bg-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-cyan/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center px-6 py-3 rounded-full text-accent text-sm font-medium mb-8 bg-accent/10 backdrop-blur-sm">
            {t?.about?.badge}
          </div>
          
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
            {t?.about?.title}{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              {t?.about?.titleAccent}
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            {t?.about?.subtitle}
          </p>
        </div>

        {/* Brand Story Section */}
        <div className="max-w-5xl mx-auto mb-20 animate-fade-in">
          <div className="glass rounded-3xl p-12 border border-glass-border">
            <div className="text-center mb-10">
              <span className="inline-block text-sm font-semibold px-4 py-2 rounded-full bg-purple/10 text-purple mb-4">
                {t?.brand?.archetype?.split(' / ')[0] || 'Sage'}
              </span>
              <p className="text-sm text-muted-foreground italic">
                {t?.brand?.archetype?.split(' / ')[1] || 'We act on data-driven insight'}
              </p>
            </div>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 text-center max-w-3xl mx-auto">
              {t?.brand?.story}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background/50 rounded-2xl p-6 border border-border/30">
                <h4 className="font-semibold text-lg mb-3 text-accent">{t?.brand?.missionLabel || 'Mission'}</h4>
                <p className="text-muted-foreground leading-relaxed">{t?.brand?.mission}</p>
              </div>
              <div className="bg-background/50 rounded-2xl p-6 border border-border/30">
                <h4 className="font-semibold text-lg mb-3 text-purple">{t?.brand?.visionLabel || 'Vision'}</h4>
                <p className="text-muted-foreground leading-relaxed">{t?.brand?.vision}</p>
              </div>
            </div>
            <div className="mt-6 bg-cyan/5 rounded-2xl p-6 border border-cyan/20">
              <h4 className="font-semibold text-lg mb-3 text-cyan">{t?.brand?.approachLabel || 'Our Approach'}</h4>
              <p className="text-muted-foreground leading-relaxed">{t?.brand?.positioning}</p>
            </div>
          </div>
        </div>

        {/* Evolution Journey */}
        <div className="max-w-7xl mx-auto mb-20">
          <div className="space-y-16">
            {evolutionPhases.map((phase, index) => (
              <div
                key={phase.phase}
                className={`group relative animate-slide-up ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex flex-col md:flex items-center gap-12`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Content Card */}
                <div className="flex-1 relative">
                  <div className="glass rounded-3xl p-10 hover:shadow-glow transition-all duration-500 group-hover:scale-105 border border-glass-border/50">
                    {/* Phase Header */}
                    <div className="mb-6">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full bg-${phase.color}/10 border border-${phase.color}/20 text-${phase.color} text-sm font-medium mb-4`}>
                        {phase.phase} • {phase.year}
                      </div>
                      <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-${phase.color} transition-colors duration-300">
                        {phase.title}
                      </h3>
                      <p className={`text-sm text-${phase.color}/70 italic mb-4`}>
                        {phase.metaphor}
                      </p>
                    </div>

                    <div className="flex items-start gap-6">
                      <div className={`w-20 h-20 bg-gradient-to-br from-${phase.color}/20 to-${phase.color}/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0 border border-${phase.color}/20`}>
                        <phase.icon className={`h-10 w-10 text-${phase.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                          {phase.description}
                        </p>
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">{t?.about?.keyBreakthroughs}</h4>
                          {phase.achievements.map((achievement, idx) => (
                            <div key={idx} className="flex items-start gap-4 group/item">
                              <div className={`w-6 h-6 bg-${phase.color}/20 rounded-lg flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform duration-200`}>
                                <div className={`w-2 h-2 bg-${phase.color} rounded-full`} />
                              </div>
                              <span className="text-foreground leading-relaxed group-hover/item:text-${phase.color} transition-colors duration-200">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Neural Network Connector */}
                <div className="hidden md:flex flex-col items-center relative">
                  <div className={`w-6 h-6 bg-${phase.color} rounded-full shadow-lg relative z-10 border-2 border-background`}>
                    <div className={`absolute inset-0 bg-${phase.color} rounded-full animate-pulse opacity-50`} />
                  </div>
                  {index < evolutionPhases.length - 1 && (
                    <div className="relative">
                      <div className={`w-1 h-24 bg-gradient-to-b from-${phase.color} to-${evolutionPhases[index + 1].color} mt-2 opacity-30`} />
                      <div className={`absolute top-2 left-0 w-1 h-6 bg-${phase.color} animate-pulse`} />
                    </div>
                  )}
                </div>

                {/* Mobile Phase Indicator */}
                <div className="md:hidden">
                  <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-${phase.color}/20 to-${phase.color}/10 border border-${phase.color}/30 text-${phase.color} font-medium`}>
                    {phase.phase}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="max-w-6xl mx-auto mb-20 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full text-cyan text-sm font-medium mb-8 bg-cyan/10 backdrop-blur-sm">
              {t?.about?.philosophyBadge}
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
              {t?.about?.philosophyTitle}{' '}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                {t?.about?.philosophyTitleAccent}
              </span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t?.about?.philosophySubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 [&>*]:lg:col-span-2 [&>*:nth-child(4)]:lg:col-start-2 [&>*:nth-child(5)]:lg:col-start-4">
            {philosophy.map((principle, index) => (
              <div
                key={principle.title}
                className="group relative glass rounded-2xl p-8 hover:shadow-glow transition-all duration-500 cursor-pointer hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-${principle.color}/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <principle.icon className={`h-8 w-8 text-${principle.color}`} />
                </div>
                <h4 className={`text-xl font-display font-bold mb-4 group-hover:text-${principle.color} transition-colors duration-300`}>
                  {t?.aiPhilosophy?.principles?.[index]?.title || principle.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  {t?.aiPhilosophy?.principles?.[index]?.description || principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Stats */}
        <div className="max-w-4xl mx-auto text-center animate-fade-in" style={{ animationDelay: '1.4s' }}>
          <div className="glass rounded-3xl p-12 border border-glass-border">
            <h3 className="text-2xl font-display font-bold mb-8 bg-gradient-accent bg-clip-text text-transparent">
              {t?.about?.statsTitle}
            </h3>
            
            <div className="grid grid-cols-3 gap-8 mb-8">
              {(t?.about?.stats || []).map((s: any, i: number) => (
                <div key={i} className="text-center group">
                  <div className={`text-4xl font-display font-bold ${i === 0 ? 'text-accent' : i === 1 ? 'text-purple' : 'text-cyan'} mb-2 group-hover:scale-110 transition-transform duration-300`}>{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {t?.about?.statsSubtitle}
             </p>
           </div>
         </div>
       </div>
     </section>
   );
 };

 export default About;