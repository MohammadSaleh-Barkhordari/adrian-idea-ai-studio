import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/translations';

type Language = 'fa' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: any;
}

const defaultLanguage: Language = 'fa';
const defaultContext: LanguageContextType = {
  language: defaultLanguage,
  setLanguage: () => {},
  isRTL: true,
  t: translations.fa
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const getLangFromPath = (path: string): Language => (path.startsWith('/en') || path.includes('/en/') ? 'en' : 'fa');
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const initialLang = getLangFromPath(initialPath);
  const [language, setLanguageState] = useState<Language>(initialLang);
  const [t, setT] = useState<any>(translations[initialLang] || translations.fa);

  useEffect(() => {
    const handleLocationChange = () => {
      const lang = getLangFromPath(window.location.pathname);
      if (lang !== language) {
        setLanguageState(lang);
        setT(translations[lang]);
      }
    };

    // Patch history methods to detect SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    // @ts-ignore - extending history methods
    history.pushState = function (...args) {
      const ret = originalPushState.apply(this, args as any);
      window.dispatchEvent(new Event('popstate'));
      return ret;
    } as any;
    // @ts-ignore - extending history methods
    history.replaceState = function (...args) {
      const ret = originalReplaceState.apply(this, args as any);
      window.dispatchEvent(new Event('popstate'));
      return ret;
    } as any;

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [language]);

  useEffect(() => {
    // Set document direction and lang attribute
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setT(translations[lang]);
  };

  const isRTL = language === 'fa';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  return context;
};
