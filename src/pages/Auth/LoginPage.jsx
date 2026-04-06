import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn } from "lucide-react";
import { getAccessToken, setTokens } from "../../lib/authStorage.js";
import { login } from "../../api/auth.js";
import { useSessionStore } from "../../store/useSessionStore.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useSessionStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (getAccessToken()) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await login({ email, password });
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error ?? t("auth.signIn.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200/50 shadow-2xl shadow-teal-900/[0.08] ring-1 ring-slate-200/40">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{t("auth.signIn.title")}</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t("auth.signIn.subtitle")}</p>

      <form className="mt-7 space-y-4" onSubmit={onSubmit}>
        <Input
          id="email"
          label={t("auth.signIn.email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label={t("auth.signIn.password")}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? (
          <div className="rounded-xl bg-red-50/80 p-3 text-sm text-red-700 ring-1 ring-red-200/60">
            {error}
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          <LogIn className="h-4 w-4" />
          {loading ? t("auth.signIn.submitting") : t("auth.signIn.submit")}
        </Button>
      </form>

      <p className="mt-3 text-center text-sm">
        <Link
          className="font-semibold text-teal-700 underline-offset-4 transition-colors hover:text-teal-600 hover:underline"
          to="/auth/forgot-password"
        >
          {t("auth.signIn.forgot")}
        </Link>
      </p>

      <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200/80" />
        <span>{t("auth.signIn.noAccount")}</span>
        <span className="h-px flex-1 bg-slate-200/80" />
      </div>

      <p className="mt-4 text-center">
        <Link
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
          to="/auth/register"
        >
          {t("auth.signIn.createOne")}
        </Link>
      </p>
    </Card>
  );
}
