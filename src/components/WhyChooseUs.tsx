import { Shield, Zap, Users, Trophy, Clock, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const WhyChooseUs = () => {
  const { t, isRTL } = useLanguage();
  
  const advantages = [
    {
      icon: Target,
      title: t?.whyChooseUs?.advantages?.[0]?.title || 'Results-Driven Approach',
      description: t?.whyChooseUs?.advantages?.[0]?.description || 'Every solution is designed to deliver measurable ROI and tangible business outcomes from day one.',
      stat: t?.whyChooseUs?.advantages?.[0]?.stat || '250% avg. growth'
    },
    {
      icon: Clock,
      title: t?.whyChooseUs?.advantages?.[1]?.title || 'Rapid Implementation',
      description: t?.whyChooseUs?.advantages?.[1]?.description || 'From concept to deployment in weeks, not months. Get your AI solution up and running fast.',
      stat: t?.whyChooseUs?.advantages?.[1]?.stat || '2-4 week deployment'
    },
    {
      icon: Shield,
      title: t?.whyChooseUs?.advantages?.[2]?.title || 'Enterprise Security',
      description: t?.whyChooseUs?.advantages?.[2]?.description || 'Bank-grade security protocols and compliance standards protect your data at every step.',
      stat: t?.whyChooseUs?.advantages?.[2]?.stat || '100% secure'
    },
    {
      icon: Users,
      title: t?.whyChooseUs?.advantages?.[3]?.title || 'Human-Centric AI',
      description: t?.whyChooseUs?.advantages?.[3]?.description || 'Technology that augments your team\'s capabilities rather than replacing them.',
      stat: t?.whyChooseUs?.advantages?.[3]?.stat || '98% user adoption'
    },
    {
      icon: Trophy,
      title: t?.whyChooseUs?.advantages?.[4]?.title || 'Proven Expertise',
      description: t?.whyChooseUs?.advantages?.[4]?.description || 'Successfully deployed AI solutions across 7+ industries with a 100% success rate.',
      stat: t?.whyChooseUs?.advantages?.[4]?.stat || '7+ industries'
    },
    {
      icon: Zap,
      title: t?.whyChooseUs?.advantages?.[5]?.title || 'Cutting-Edge Tech',
      description: t?.whyChooseUs?.advantages?.[5]?.description || 'Leveraging the latest in AI, machine learning, and automation technologies.',
      stat: t?.whyChooseUs?.advantages?.[5]?.stat || 'Latest AI models'
    }
  ];

  return (
    <section id="why-choose-us" className="bg-muted/30">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          {t?.whyChooseUs?.badge && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-golden/10 border border-golden/20 text-golden text-sm font-medium mb-6">
              {t.whyChooseUs.badge}
            </div>
          )}
          
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            {t?.whyChooseUs?.title || 'Why Choose Adrian Idea'}
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t?.whyChooseUs?.subtitle || 'The Smart Choice for AI Success'}
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {advantages.map((advantage, index) => (
            <div
              key={advantage.title}
              className="group glass rounded-2xl p-8 border border-glass-border hover:shadow-glow hover:border-golden/30 transition-all duration-500 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon & Stat */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-golden to-golden rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <advantage.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                  <div className="text-sm text-muted-foreground">{t?.whyChooseUs?.achievement || 'Achievement'}</div>
                  <div className="text-lg font-bold text-golden">{advantage.stat}</div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-semibold mb-4 group-hover:text-golden transition-colors duration-300">
                {advantage.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {advantage.description}
              </p>

              {/* Hover Effect Indicator */}
              <div className="mt-6 flex items-center text-golden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">{t?.whyChooseUs?.learnMore || 'Learn more'}</span>
                <div className={`${isRTL ? 'mr-2' : 'ml-2'} w-1 h-1 bg-golden rounded-full animate-pulse`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;