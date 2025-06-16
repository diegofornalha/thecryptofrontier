'use client';
import React, { createContext, useContext } from 'react';
const LocaleContext = createContext({
    locale: 'en'
});
export function LocaleProvider({ children, locale }) {
    return (<LocaleContext.Provider value={{ locale }}>
      {children}
    </LocaleContext.Provider>);
}
export function useLocale() {
    return useContext(LocaleContext);
}
