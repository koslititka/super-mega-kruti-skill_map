import { createContext, useContext, useState } from 'react';
import ru from '../i18n/ru';
import en from '../i18n/en';

type Locale = 'ru' | 'en';
type Dict = typeof ru;

const dict: Record<Locale, Dict> = { ru, en };

interface LocaleContextValue {
  locale: Locale;
  t: Dict;
  toggle: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(
    (localStorage.getItem('locale') as Locale) || 'ru'
  );

  const toggle = () => {
    const next: Locale = locale === 'ru' ? 'en' : 'ru';
    setLocale(next);
    localStorage.setItem('locale', next);
  };

  return (
    <LocaleContext.Provider value={{ locale, t: dict[locale], toggle }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
};
