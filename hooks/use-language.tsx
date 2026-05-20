import React, { createContext, useContext, useState, useEffect } from "react";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Cineverse+",
      trending: "Trending Now",
      popularMovies: "Popular Movies",
      popularTV: "TV Shows",
      topRated: "Top Rated",
      anime: "Anime & Animation",
      search: "Search",
      searchPlaceholder: "Movies, TV shows, actors...",
      profile: "Profile",
      settings: "Settings",
      watchlist: "My Watchlist",
      favorites: "Favorites",
      logout: "Sign Out",
      watchNow: "Watch Now",
      moreInfo: "More Info",
      cast: "Cast",
      moreLikeThis: "More Like This",
      language: "Language",
      history: "Recently Watched",
    },
  },
  fr: {
    translation: {
      welcome: "Bienvenue sur Cineverse+",
      trending: "En Vogue",
      popularMovies: "Films Populaires",
      popularTV: "Séries TV",
      topRated: "Mieux Notés",
      anime: "Anime & Animation",
      search: "Rechercher",
      searchPlaceholder: "Films, séries, acteurs...",
      profile: "Profil",
      settings: "Paramètres",
      watchlist: "Ma Liste",
      favorites: "Favoris",
      logout: "Déconnexion",
      watchNow: "Regarder",
      moreInfo: "Plus d'infos",
      cast: "Casting",
      moreLikeThis: "Titres Similaires",
      language: "Langue",
      history: "Vus Récemment",
    },
  },
  ar: {
    translation: {
      welcome: "مرحباً بكم في Cineverse+",
      trending: "الأكثر رواجاً",
      popularMovies: "أفلام مشهورة",
      popularTV: "مسلسلات تلفزيونية",
      topRated: "الأعلى تقييماً",
      anime: "أنيمي ورسوم متحركة",
      search: "بحث",
      searchPlaceholder: "أفلام، مسلسلات، ممثلون...",
      profile: "الملف الشخصي",
      settings: "الإعدادات",
      watchlist: "قائمتي",
      favorites: "المفضلة",
      logout: "تسجيل الخروج",
      watchNow: "شاهد الآن",
      moreInfo: "المزيد من المعلومات",
      cast: "طاقم العمل",
      moreLikeThis: "المزيد مثل هذا",
      language: "اللغة",
      history: "شوهد مؤخراً",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

type Language = "en" | "fr" | "ar";

interface LanguageContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();
  const [locale, setLocaleState] = useState<Language>("en");

  useEffect(() => {
    const loadLocale = async () => {
      const savedLocale = await AsyncStorage.getItem("user-locale");
      if (savedLocale) {
        setLocaleState(savedLocale as Language);
        i18nInstance.changeLanguage(savedLocale);
      } else {
        const locales = Localization.getLocales();
        const deviceLocale = locales[0]?.languageCode as Language;
        if (deviceLocale && resources[deviceLocale as Language]) {
          setLocaleState(deviceLocale);
          i18nInstance.changeLanguage(deviceLocale);
        }
      }
    };
    loadLocale();
  }, [i18nInstance]);

  const setLocale = async (newLocale: Language) => {
    setLocaleState(newLocale);
    i18nInstance.changeLanguage(newLocale);
    await AsyncStorage.setItem("user-locale", newLocale);
  };

  const isRTL = locale === "ar";

  const t = (key: string) => i18nInstance.t(key);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
