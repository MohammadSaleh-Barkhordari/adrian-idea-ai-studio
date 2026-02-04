import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    const currentPath = location.pathname;
    
    if (language === 'fa') {
      // Switch to English - only add /en if not already there
      const newPath = currentPath.startsWith('/en') 
        ? currentPath 
        : (currentPath === '/' ? '/en' : `/en${currentPath}`);
      navigate(newPath);
    } else {
      // Switch to Persian - remove /en prefix
      const newPath = currentPath.replace(/^\/en/, '') || '/';
      navigate(newPath);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'fa' ? 'EN' : 'فا'}</span>
    </Button>
  );
};

export default LanguageSwitcher;
