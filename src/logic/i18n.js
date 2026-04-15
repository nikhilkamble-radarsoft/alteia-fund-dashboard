import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(
    resourcesToBackend((language, namespace) => import(`../locales/${language}/${namespace}.json`)),
  )
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    ns: ["common", "table", "form"], // Your logical file splits
    defaultNS: "common",

    // Performance: Wait for translations to load before rendering?
    // False = allow partial rendering (better UX)
    react: {
      useSuspense: true,
    },

    interpolation: { escapeValue: false }, // React handles escaping
  });

export default i18n;
