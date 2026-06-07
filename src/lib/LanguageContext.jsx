import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '@/i18n';
import { base44 } from '@/api/base44Client';

const LanguageContext = createContext();

const LS_KEY = 'lang';
const VALID_LANGS = ['he', 'en'];

function readStorage() {
  const v = localStorage.getItem(LS_KEY);
  return VALID_LANGS.includes(v) ? v : 'he';
}

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(readStorage);

  // On mount: if user is logged in, prefer their DB lang
  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (user?.lang && VALID_LANGS.includes(user.lang)) {
          applyLang(user.lang);
        }
      })
      .catch(() => {/* not logged in, use localStorage */});
  }, []);

  const applyLang = useCallback((newLang) => {
    if (!VALID_LANGS.includes(newLang)) return;
    setLangState(newLang);
    localStorage.setItem(LS_KEY, newLang);
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }, []);

  // Apply on initial render
  useEffect(() => {
    applyLang(lang);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLang = useCallback(async (newLang) => {
    applyLang(newLang);
    // Persist to DB if logged in
    try {
      await base44.auth.me(); // confirms logged in
      await fetch('/api/users/me/lang', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: newLang }),
      });
    } catch {
      // not logged in — localStorage is enough
    }
  }, [applyLang]);

  const dir = lang === 'he' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};
