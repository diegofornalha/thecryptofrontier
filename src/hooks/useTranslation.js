import { useLocale } from '@/contexts/LocaleContext';
import br from '@/locales/br.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
const translations = {
    br,
    en,
    es
};
export function useTranslation() {
    const { locale } = useLocale();
    const t = translations[locale] || translations.en;
    // Função helper para acessar traduções aninhadas
    const translate = (key) => {
        const keys = key.split('.');
        let value = t;
        for (const k of keys) {
            value = value === null || value === void 0 ? void 0 : value[k];
        }
        return value || key;
    };
    return {
        t,
        translate,
        locale
    };
}
