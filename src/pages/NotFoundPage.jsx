import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Ghost } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-teal-50 ring-1 ring-slate-200/60">
        <Ghost className="h-9 w-9 text-teal-600" />
      </div>
      <p className="mt-6 text-6xl font-extrabold tracking-tight text-slate-900">{t("notFound.code")}</p>
      <h1 className="mt-3 text-xl font-bold text-slate-900">{t("notFound.title")}</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">{t("notFound.body")}</p>
      <Link to="/" className="mt-8 inline-block">
        <Button type="button">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("notFound.cta")}
        </Button>
      </Link>
    </div>
  );
}
