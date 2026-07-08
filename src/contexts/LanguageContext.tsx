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
const STORAGE_KEY = 'lang';

const getLangFromPath = (path: string): Language =>
  (path === '/en' || path.startsWith('/en/')) ? 'en' : 'fa';

const consumeQueryParamLang = (): Language | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const qp = params.get('lang');
    if (qp === 'fa' || qp === 'en') {
      localStorage.setItem(STORAGE_KEY, qp);
      params.delete('lang');
      const qs = params.toString();
      const newUrl = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      return qp;
    }
  } catch {
    /* ignore */
  }
  return null;
};

const resolveInitialLang = (): Language => {
  if (typeof window === 'undefined') return defaultLanguage;
  const qp = consumeQueryParamLang();
  if (qp) return qp;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fa' || stored === 'en') return stored;
  } catch {
    /* ignore */
  }
  return getLangFromPath(window.location.pathname);
};

const defaultContext: LanguageContextType = {
  language: defaultLanguage,
  setLanguage: () => {},
  isRTL: true,
  t: translations.fa,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const initialLang = resolveInitialLang();
  const [language, setLanguageState] = useState<Language>(initialLang);
  const [t, setT] = useState<any>(translations[initialLang] || translations.fa);

  useEffect(() => {
    const handleLocationChange = () => {
      const qp = consumeQueryParamLang();
      if (qp) {
        if (qp !== language) {
          setLanguageState(qp);
          setT(translations[qp]);
        }
        return;
      }
      const lang = getLangFromPath(window.location.pathname);
      if (lang !== language) {
        setLanguageState(lang);
        setT(translations[lang]);
      }
    };

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    // @ts-ignore
    history.pushState = function (...args) {
      const ret = originalPushState.apply(this, args as any);
      window.dispatchEvent(new Event('popstate'));
      return ret;
    } as any;
    // @ts-ignore
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
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
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

export const useLanguage = () => useContext(LanguageContext);
