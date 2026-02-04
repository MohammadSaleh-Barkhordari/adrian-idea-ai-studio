import { Github, Linkedin, Twitter, Mail, Phone } from 'lucide-react';
import { TelegramIcon, WhatsAppIcon, InstagramIcon } from './SocialIcons';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language, t, isRTL } = useLanguage();
  const langPrefix = language === 'en' ? '/en' : '';

  const socialLinks = [
    {
      name: 'Instagram',
      icon: InstagramIcon,
      href: 'https://instagram.com/adrianidea',
      color: 'hover:text-pink-500'
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      href: 'https://t.me/adrianidea',
      color: 'hover:text-blue-400'
    },
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      href: 'https://wa.me/989125633479',
      color: 'hover:text-green-500'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://linkedin.com/company/adrianidea',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Email',
      icon: Mail,
      href: 'mailto:contact@adrianidea.ir',
      color: 'hover:text-accent'
    },
    {
      name: 'Phone',
      icon: Phone,
      href: 'tel:00989125633479',
      color: 'hover:text-purple'
    }
  ];

  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to={langPrefix || '/'} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 mb-4`}>
            <img 
              src="/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png" 
              alt={`${t?.companyName || 'Adrian Idea'} Logo`}
              className="w-8 h-8 object-contain"
              width="32"
              height="32"
              loading="lazy"
            />
            <span className="text-xl font-display font-bold">{t?.companyName || 'Adrian Idea'}</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              {t?.footer?.tagline || 'Transforming businesses with intelligent AI solutions'}
            </p>
            
            {/* Social Links */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`w-11 h-11 glass rounded-lg flex items-center justify-center border border-glass-border hover:border-accent/30 hover:shadow-glow transition-all duration-300 ${social.color}`}
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold mb-4">{t?.footer?.quickLinks || 'Quick Links'}</h3>
            <ul className="space-y-3">
              <li>
                <Link to={`${langPrefix}/about`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.nav?.about || 'About Us'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/services`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.nav?.services || 'Services'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/case-studies`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.nav?.caseStudies || 'Case Studies'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/ai-philosophy`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.nav?.aiPhilosophy || 'AI Philosophy'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/blog`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.nav?.blog || 'Blog'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/contact`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.nav?.contact || 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold mb-4">{t?.footer?.legal || 'Legal'}</h3>
            <ul className="space-y-3">
              <li>
                <Link to={`${langPrefix}/privacy-policy`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.footer?.privacyPolicy || 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/terms-of-service`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.footer?.termsOfService || 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/cookie-policy`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.footer?.cookiePolicy || 'Cookie Policy'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/data-processing`} className="text-muted-foreground hover:text-accent transition-colors duration-300">
                  {t?.footer?.dataProcessing || 'Data Processing'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © {currentYear} {t?.companyName || 'Adrian Idea'}. {t?.footer?.rights || 'All rights reserved.'}
            </p>
            
            <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{t?.footer?.madeWith || 'Made with'}</span>
              <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
              <span>{t?.footer?.forPracticalAI || 'for practical AI solutions'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;