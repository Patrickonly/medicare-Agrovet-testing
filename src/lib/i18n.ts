import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "sw", label: "Kiswahili", dir: "ltr" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const resources = {
  en: {
    translation: {
      common: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        loading: "Loading…",
        search: "Search",
        export: "Export",
        currency: "Currency",
        language: "Language",
      },
      nav: {
        dashboard: "Dashboard",
        patients: "Patients",
        pharmacy: "Pharmacy",
        finance: "Finance",
        hr: "HR & Payroll",
        assets: "Assets",
        settings: "Settings",
      },
    },
  },
  fr: {
    translation: {
      common: {
        save: "Enregistrer", cancel: "Annuler", delete: "Supprimer", edit: "Modifier",
        loading: "Chargement…", search: "Rechercher", export: "Exporter",
        currency: "Devise", language: "Langue",
      },
      nav: { dashboard: "Tableau de bord", patients: "Patients", pharmacy: "Pharmacie", finance: "Finance", hr: "RH & Paie", assets: "Actifs", settings: "Paramètres" },
    },
  },
  es: {
    translation: {
      common: {
        save: "Guardar", cancel: "Cancelar", delete: "Eliminar", edit: "Editar",
        loading: "Cargando…", search: "Buscar", export: "Exportar",
        currency: "Moneda", language: "Idioma",
      },
      nav: { dashboard: "Panel", patients: "Pacientes", pharmacy: "Farmacia", finance: "Finanzas", hr: "RR. HH. y Nómina", assets: "Activos", settings: "Ajustes" },
    },
  },
  ar: {
    translation: {
      common: {
        save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل",
        loading: "جارٍ التحميل…", search: "بحث", export: "تصدير",
        currency: "العملة", language: "اللغة",
      },
      nav: { dashboard: "لوحة التحكم", patients: "المرضى", pharmacy: "الصيدلية", finance: "المالية", hr: "الموارد البشرية", assets: "الأصول", settings: "الإعدادات" },
    },
  },
  sw: {
    translation: {
      common: {
        save: "Hifadhi", cancel: "Ghairi", delete: "Futa", edit: "Hariri",
        loading: "Inapakia…", search: "Tafuta", export: "Hamisha",
        currency: "Sarafu", language: "Lugha",
      },
      nav: { dashboard: "Dashibodi", patients: "Wagonjwa", pharmacy: "Famasia", finance: "Fedha", hr: "HR na Mishahara", assets: "Mali", settings: "Mipangilio" },
    },
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
      interpolation: { escapeValue: false },
      detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
    });
}

export function setAppLanguage(code: SupportedLanguage) {
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  if (!meta) return;
  i18n.changeLanguage(code);
  if (typeof document !== "undefined") {
    document.documentElement.lang = code;
    document.documentElement.dir = meta.dir;
  }
}

export default i18n;
