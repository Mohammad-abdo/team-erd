import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Save, UserRound } from "lucide-react";
import { patchMe } from "../../api/users.js";
import { useSessionStore } from "../../store/useSessionStore.js";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function AccountPage() {
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setAvatar(user?.avatar ?? "");
  }, [user]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { data } = await patchMe({
        name: name.trim(),
        avatar: avatar.trim() === "" ? null : avatar.trim(),
      });
      setUser(data.user);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.error ?? "Could not update profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
            <UserRound className="h-5 w-5" />
          </span>
          Account
        </h1>
        <p className="mt-2 text-sm text-slate-500">Update how you appear to teammates.</p>
      </div>

      <Card className="ring-1 ring-slate-200/40">
        <CardHeader title="Profile" description={user?.email} />
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            id="aname"
            label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="aavatar"
            label="Avatar URL"
            type="url"
            placeholder="https://..."
            value={avatar ?? ""}
            onChange={(e) => setAvatar(e.target.value)}
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
          <Button type="submit" disabled={busy}>
            <Save className="h-4 w-4" />
            {busy ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
