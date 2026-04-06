import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const STORAGE_KEY = "dbforge-locale";

function readStoredLocale() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "ar" || v === "en") {
      return v;
    }
  } catch {
    /* ignore */
  }
  return "en";
}

function applyDocumentLanguage(lng) {
  const lang = lng?.startsWith("ar") ? "ar" : "en";
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

function persistLocale(lng) {
  try {
    localStorage.setItem(STORAGE_KEY, lng.startsWith("ar") ? "ar" : "en");
  } catch {
    /* ignore */
  }
}

i18n.on("languageChanged", (lng) => {
  applyDocumentLanguage(lng);
  persistLocale(lng);
});

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: readStoredLocale(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

applyDocumentLanguage(i18n.language);

export default i18n;
