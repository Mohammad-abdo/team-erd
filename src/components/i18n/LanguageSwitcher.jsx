import { useTranslation } from "react-i18next";

export function LanguageSwitcher({ className = "", variant = "default" }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  const base =
    variant === "dark"
      ? "border-white/[0.08] bg-white/[0.04] text-zinc-300"
      : "border-slate-200/80 bg-white/70 text-slate-600 shadow-sm shadow-slate-900/[0.03] backdrop-blur-sm";

  const activeClass =
    variant === "dark"
      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-900/20"
      : "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/20";

  const inactiveClass =
    variant === "dark"
      ? "hover:bg-white/[0.06] hover:text-white"
      : "hover:bg-slate-50 hover:text-slate-900";

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-xl border p-0.5 transition-colors ${base} ${className}`}
      role="group"
      aria-label={t("common.language")}
    >
      <button
        type="button"
        onClick={() => i18n.changeLanguage("en")}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-200 ${
          !isAr ? activeClass : inactiveClass
        }`}
        aria-pressed={!isAr}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("ar")}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-200 ${
          isAr ? activeClass : inactiveClass
        }`}
        aria-pressed={isAr}
      >
        عربي
      </button>
    </div>
  );
}
