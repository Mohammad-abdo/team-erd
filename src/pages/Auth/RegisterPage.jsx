import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPlus } from "lucide-react";
import { getAccessToken, setTokens } from "../../lib/authStorage.js";
import { register } from "../../api/auth.js";
import { useSessionStore } from "../../store/useSessionStore.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useSessionStore((s) => s.setUser);
  const [name, setName] = useState("");
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
      const { data } = await register({ name, email, password });
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error ?? t("auth.register.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200/50 shadow-2xl shadow-teal-900/[0.08] ring-1 ring-slate-200/40">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{t("auth.register.title")}</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t("auth.register.subtitle")}</p>

      <form className="mt-7 space-y-4" onSubmit={onSubmit}>
        <Input
          id="name"
          label={t("auth.register.name")}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          id="email"
          label={t("auth.register.email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label={t("auth.register.password")}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <p className="text-xs text-slate-400">{t("auth.register.hint")}</p>
        {error ? (
          <div className="rounded-xl bg-red-50/80 p-3 text-sm text-red-700 ring-1 ring-red-200/60">
            {error}
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          <UserPlus className="h-4 w-4" />
          {loading ? t("auth.register.submitting") : t("auth.register.submit")}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200/80" />
        <span>{t("auth.register.hasAccount")}</span>
        <span className="h-px flex-1 bg-slate-200/80" />
      </div>

      <p className="mt-4 text-center">
        <Link
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
          to="/auth/login"
        >
          {t("auth.register.signIn")}
        </Link>
      </p>
    </Card>
  );
}
