import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, MailPlus } from "lucide-react";
import { acceptInvitation } from "../../api/projects.js";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function InviteAcceptPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { data } = await acceptInvitation({ token: token.trim() });
      setMessage(
        data.alreadyMember
          ? "You were already a member \u2014 opening the project."
          : "Invitation accepted \u2014 opening the project.",
      );
      setTimeout(() => {
        navigate(`/projects/${data.projectId}`, { replace: true });
      }, 600);
    } catch (err) {
      setError(err.response?.data?.error ?? "Could not accept invitation");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-12 animate-fade-in">
      <Card className="ring-1 ring-slate-200/40">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
            <MailPlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Accept invitation</h2>
            <p className="text-sm text-slate-500">Paste the token from your invite email.</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            id="token"
            label="Invitation token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            autoComplete="off"
          />
          {error ? (
            <div className="rounded-xl bg-red-50/80 p-3 text-sm text-red-700 ring-1 ring-red-200/60">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200/60">
              <Check className="h-4 w-4 shrink-0" />
              {message}
            </div>
          ) : null}
          <Button type="submit" className="w-full" disabled={busy}>
            <MailPlus className="h-4 w-4" />
            {busy ? "Joining..." : "Join project"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
