import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CaseStudies = () => {
  const { t } = useLanguage();
  
  const cases = t?.caseStudies?.cases || [
    {
      title: 'Rubby',
      industry: 'Toys & 3D Printing',
      description: 'Transform children\'s paintings into real 3D printed toys. Complete platform from image upload, texture mapping, material selection, to final printing and delivery.',
      gradient: 'from-cyan/20 to-accent/20'
    },
    {
      title: 'InstAI',
      industry: 'Marketing & Analytics',
      description: 'Advanced data analysis platform that analyzes Instagram brand accounts through hashtags, comments, posts, and engagement metrics to deliver client satisfaction insights.',
      gradient: 'from-purple/20 to-cyan/20'
    },
    {
      title: 'Contract Organiser',
      industry: 'Motor Industry',
      description: 'Smart contract management platform streamlining the entire contract lifecycle from creation to payment reminders, with automated contract generation based on company policies.',
      gradient: 'from-accent/20 to-purple/20'
    },
    {
      title: 'Online Appointment',
      industry: 'Medical/Dental',
      description: 'Comprehensive dental clinic platform for appointment booking, test result uploads, and consultation scheduling based on patient inquiries and optimal time management.',
      gradient: 'from-purple/20 to-cyan/20'
    },
    {
      title: 'ReNoWait',
      industry: 'Construction & Interior Design',
      description: 'AI-powered interior design platform that analyzes room photos to detect dimensions, suggest design improvements, recommend materials, and find affordable purchasing options.',
      gradient: 'from-cyan/20 to-accent/20'
    },
    {
      title: 'Parts Supply Chain Management',
      industry: 'Car Industry',
      description: 'Comprehensive automotive parts supply chain platform optimizing inventory management, supplier coordination, demand forecasting, and logistics for seamless parts distribution.',
      gradient: 'from-accent/20 to-purple/20'
    },
    {
      title: 'EV Data Management',
      industry: 'EV Car Industry',
      description: 'Advanced electric vehicle data analytics platform managing battery performance, charging patterns, vehicle diagnostics, and fleet optimization for enhanced EV operations.',
      gradient: 'from-purple/20 to-cyan/20'
    }
  ];

  return (
    <section id="case-studies" className="relative overflow-hidden">
      {/* Engaging Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
      
      {/* Animated floating shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-accent/20 to-purple/15 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple/20 to-cyan/15 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-cyan/20 to-accent/15 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-accent/15 to-purple/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      {/* Geometric patterns */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 border border-accent/10 rounded-full animate-spin" style={{ animationDuration: '60s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-purple/10 rounded-full animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
      </div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple/10 border border-purple/20 text-purple text-sm font-medium mb-6">
            {t?.caseStudies?.badge || 'Case Studies'}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            {t?.caseStudies?.title || 'Proven'}{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              {t?.caseStudies?.titleAccent || 'Results'}
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t?.caseStudies?.subtitle || 'Real businesses, real challenges, real results. See how our AI solutions have delivered measurable impact across different industries.'}
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {cases.map((caseStudy, index) => (
            <div
              key={caseStudy.title}
              className="group glass rounded-2xl p-8 border border-glass-border hover:shadow-glow hover:border-accent/30 transition-all duration-500 cursor-pointer animate-slide-up hover:scale-105 relative"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium mb-4">
                  {caseStudy.industry}
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 group-hover:text-accent transition-colors duration-300">
                  {caseStudy.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {caseStudy.description}
                </p>
              </div>

              {/* Hover Indicator */}
              <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-accent text-sm font-medium">{t?.caseStudies?.detailedCaseStudy || 'Detailed Case Study'}</span>
                <ArrowRight className="h-4 w-4 text-accent group-hover:translate-x-1 transition-transform duration-300" />
              </div>

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${caseStudy.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10`} />
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="glass rounded-3xl p-12 border border-glass-border max-w-2xl mx-auto relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-purple/5 to-cyan/10 animate-pulse" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-medium mb-6">
                {t?.caseStudies?.comingSoonBadge || 'Coming Soon'}
              </div>
              
              <h3 className="text-3xl font-display font-bold mb-4">
                {t?.caseStudies?.comingSoonTitle || 'More Success Stories'}{' '}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  {t?.caseStudies?.comingSoonTitleAccent || 'Loading...'}
                </span>
              </h3>
              
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                {t?.caseStudies?.comingSoonText || 'We\'re constantly creating innovative solutions for businesses across industries. New case studies launching soon as we help more companies transform their operations.'}
              </p>
              
              <div className="flex items-center justify-center gap-2 text-accent">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;