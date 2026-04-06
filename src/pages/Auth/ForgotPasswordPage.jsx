import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KeyRound } from "lucide-react";
import { forgotPassword } from "../../api/auth.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devToken, setDevToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevToken("");
    setLoading(true);
    try {
      const { data } = await forgotPassword({ email });
      setMessage(data.message ?? t("auth.forgot.checkEmail"));
      if (data.devResetToken) {
        setDevToken(data.devResetToken);
      }
    } catch (err) {
      setError(err.response?.data?.error ?? t("auth.forgot.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200/50 shadow-2xl shadow-teal-900/[0.08] ring-1 ring-slate-200/40">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200/60">
          <KeyRound className="h-5 w-5" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{t("auth.forgot.title")}</h1>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{t("auth.forgot.subtitle")}</p>

      <form className="mt-7 space-y-4" onSubmit={onSubmit}>
        <Input
          id="email"
          label={t("auth.forgot.email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error ? (
          <div className="rounded-xl bg-red-50/80 p-3 text-sm text-red-700 ring-1 ring-red-200/60">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-xl bg-emerald-50/80 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200/60">
            {message}
          </div>
        ) : null}
        {devToken ? (
          <div className="rounded-xl bg-amber-50/80 p-3 text-xs text-amber-950 ring-1 ring-amber-200/60">
            <p className="font-semibold">{t("auth.forgot.devToken")}</p>
            <p className="mt-1 break-all font-mono">{devToken}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => navigate(`/auth/reset-password?token=${encodeURIComponent(devToken)}`)}
            >
              {t("auth.forgot.continueReset")}
            </Button>
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.forgot.sending") : t("auth.forgot.send")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link className="font-semibold text-slate-900 underline-offset-4 transition-colors hover:text-teal-700 hover:underline" to="/auth/login">
          {t("auth.forgot.back")}
        </Link>
      </p>
    </Card>
  );
}
