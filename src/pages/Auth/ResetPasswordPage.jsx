import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { resetPassword } from "../../api/auth.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await resetPassword({ token: token.trim(), password });
      setMessage(data.message ?? t("auth.reset.passwordUpdated"));
      setTimeout(() => navigate("/auth/login", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.error ?? t("auth.reset.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200/50 shadow-2xl shadow-teal-900/[0.08] ring-1 ring-slate-200/40">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-200/60">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{t("auth.reset.title")}</h1>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{t("auth.reset.subtitle")}</p>

      <form className="mt-7 space-y-4" onSubmit={onSubmit}>
        <Input
          id="token"
          label={t("auth.reset.token")}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          autoComplete="off"
        />
        <Input
          id="password"
          label={t("auth.reset.newPassword")}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.reset.saving") : t("auth.reset.submit")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link className="font-semibold text-slate-900 underline-offset-4 transition-colors hover:text-teal-700 hover:underline" to="/auth/login">
          {t("auth.reset.signIn")}
        </Link>
      </p>
    </Card>
  );
}
