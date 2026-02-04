import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: t?.contact?.messageSent || "Message sent successfully!",
      description: t?.contact?.messageSentDesc || "We'll get back to you within 24 hours.",
    });
    
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-accent text-sm font-medium mb-6">
            {t?.contact?.badge}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            {t?.contact?.title}{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              {t?.contact?.titleAccent}
            </span>{' '}
            {t?.contact?.titleEnd}
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t?.contact?.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="animate-slide-up">
            <div className="bg-background/30 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-display font-semibold mb-6">
                {t?.contact?.formTitle}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t?.contact?.firstName}</label>
                    <Input 
                      placeholder={t?.contact?.firstName}
                      required 
                      className="bg-background/50 backdrop-blur-sm focus:bg-background/70 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t?.contact?.lastName}</label>
                    <Input 
                      placeholder={t?.contact?.lastName}
                      required 
                      className="bg-background/50 backdrop-blur-sm focus:bg-background/70 transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">{t?.contact?.email}</label>
                  <Input 
                    type="email" 
                    placeholder={t?.contact?.email}
                    required 
                    className="bg-background/50 backdrop-blur-sm focus:bg-background/70 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">{t?.contact?.company}</label>
                  <Input 
                    placeholder={t?.contact?.company} 
                    className="bg-background/50 backdrop-blur-sm focus:bg-background/70 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">{t?.contact?.projectDetails}</label>
                  <Textarea 
                    placeholder={t?.contact?.projectPlaceholder} 
                    rows={4} 
                    required 
                    className="bg-background/50 backdrop-blur-sm focus:bg-background/70 transition-all duration-300 resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-accent text-white hover:shadow-glow-accent transition-all duration-300"
                >
                  {isSubmitting ? t?.contact?.sending : t?.contact?.sendButton}
                  {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className="bg-background/30 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold mb-2">{t?.contact?.emailUs}</h4>
                    <p className="text-muted-foreground mb-2">{t?.contact?.emailDesc}</p>
                    <a href="mailto:contact@adrianidea.ir" className="text-accent hover:underline font-medium">
                      contact@adrianidea.ir
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-background/30 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-purple" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold mb-2">{t?.contact?.callUs}</h4>
                    <p className="text-muted-foreground mb-2">{t?.contact?.callDesc}</p>
                    <a href="tel:00989125633479" className="text-purple hover:underline font-medium">
                      {t?.contact?.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-background/30 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-cyan" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold mb-2">{t?.contact?.visitUs}</h4>
                    <p className="text-muted-foreground mb-2">{t?.contact?.visitDesc}</p>
                    <p className="text-cyan font-medium whitespace-pre-line">
                      {t?.contact?.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="p-6 bg-gradient-subtle rounded-2xl border border-accent/20">
                <h4 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                  {t?.contact?.responseTitle}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t?.contact?.responseDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map Section */}
        <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-semibold mb-4">{t?.contact?.mapTitle}</h3>
            <p className="text-muted-foreground">
              {t?.contact?.mapDesc}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.0572939891657!2d51.4231873!3d35.8041626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e00491ff3dcd1%3A0xf0b3697a0b2ff445!2sTajrish%20Square%2C%20Tehran%2C%20Iran!5e0!3m2!1sen!2s!4v1704963600000!5m2!1sen!2s"
              width="100%" 
              height="400" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title={`${t?.companyName} Office Location`}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;