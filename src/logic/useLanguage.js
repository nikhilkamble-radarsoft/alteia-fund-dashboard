import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import enUS from "antd/locale/en_US";
import arEG from "antd/locale/ar_EG";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return {
    locale: isRTL ? arEG : enUS,
    direction: isRTL ? "rtl" : "ltr",
    isRTL,
    currentLang: i18n.language,
    changeLanguage,
  };
};
