import { Brain, Target, Rocket, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Methodology = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const langPrefix = language === 'en' ? '/en' : '';
  
  const steps = [
    {
      icon: Target,
      title: t?.methodology?.steps?.[0]?.title || 'Discovery',
      description: t?.methodology?.steps?.[0]?.description || 'Deep dive into your business processes, pain points, and opportunities for AI enhancement.',
    },
    {
      icon: Brain,
      title: t?.methodology?.steps?.[1]?.title || 'Design',
      description: t?.methodology?.steps?.[1]?.description || 'Craft a tailored AI strategy aligned with your specific goals and technical requirements.',
    },
    {
      icon: Rocket,
      title: t?.methodology?.steps?.[2]?.title || 'Development',
      description: t?.methodology?.steps?.[2]?.description || 'Build robust, scalable AI solutions using cutting-edge technologies and best practices.',
    },
    {
      icon: BarChart3,
      title: t?.methodology?.steps?.[3]?.title || 'Deployment',
      description: t?.methodology?.steps?.[3]?.description || 'Seamlessly integrate AI into your existing systems with minimal disruption.',
    },
    {
      icon: Target,
      title: t?.methodology?.steps?.[4]?.title || 'Training',
      description: t?.methodology?.steps?.[4]?.description || 'Empower your team to effectively leverage the AI tools and understand the insights.',
    },
    {
      icon: BarChart3,
      title: t?.methodology?.steps?.[5]?.title || 'Optimization',
      description: t?.methodology?.steps?.[5]?.description || 'Continuously refine and enhance performance based on real-world usage and feedback.',
    }
  ];

  return (
    <section id="methodology" className="relative py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-golden/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-golden/10 border border-golden/20 text-golden text-sm font-medium mb-6">
            {t?.methodology?.badge || 'Our Methodology'}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            {t?.methodology?.title || 'Six Steps to'}{' '}
            <span className="bg-gradient-golden bg-clip-text text-transparent">
              {t?.methodology?.titleAccent || 'AI Excellence'}
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t?.methodology?.subtitle || 'Our proven framework transforms complex business challenges into intelligent, scalable solutions.'}
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group glass rounded-2xl p-8 border border-glass-border hover:shadow-glow hover:border-golden/30 transition-all duration-500 animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Step Number & Icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-golden to-golden rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-medium text-golden bg-golden/10 px-3 py-1 rounded-full">
                  {language === 'fa' ? `گام ${index + 1}` : `Step ${index + 1}`}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-semibold mb-4 group-hover:text-golden transition-colors duration-300">
                {step.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <button 
            className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-accent hover:shadow-glow-accent transition-all duration-300 font-medium"
            onClick={() => navigate(`${langPrefix}/contact`)}
          >
            {t?.methodology?.cta || 'Start Your AI Journey'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Methodology;