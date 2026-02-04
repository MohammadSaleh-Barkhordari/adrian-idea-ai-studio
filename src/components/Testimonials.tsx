import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO, TechFlow Solutions',
      company: 'E-commerce Platform',
      content: 'Adrian Idea transformed our recommendation engine, resulting in a 35% increase in revenue and 28% better customer retention. Their approach is methodical, practical, and delivers real results.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Operations Director',
      company: 'Manufacturing Corp',
      content: 'The predictive maintenance system they built reduced our downtime by 65% and saved us $2.3M in the first year. Outstanding expertise and support throughout the entire process.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Dr. Amelia Watson',
      role: 'Head of Risk Management',
      company: 'FinTech Innovations',
      content: 'Their fraud detection model improved our accuracy by 89% while processing transactions 10x faster. Adrian Idea understands both the technical and business sides perfectly.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    }
  ];

  return (
    <section id="testimonials" className="">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-sm font-medium mb-6">
            Client Success Stories
          </div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            What Our{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Clients Say
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. Here's what industry leaders say about 
            their experience working with Adrian Idea.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="glass rounded-2xl p-8 border border-glass-border hover:shadow-glow hover:border-accent/30 transition-all duration-500 animate-slide-up relative"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Quote className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4 pt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-accent">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="text-muted-foreground mb-6">
            Ready to join our success stories? Let's discuss your AI transformation.
          </p>
          <button 
            className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-accent hover:shadow-glow-accent transition-all duration-300 font-medium"
            onClick={() => window.location.href = '/contact'}
          >
            Start Your Success Story
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;