import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, ExternalLink } from "lucide-react";
import { listNotifications, markNotificationRead } from "../../api/projects.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

function notificationCta(n) {
  const d = n.data && typeof n.data === "object" ? n.data : null;
  if (!d) {
    return null;
  }
  if (n.type === "project_invite" && d.token) {
    return { to: `/invite?token=${encodeURIComponent(String(d.token))}`, label: "Accept invitation" };
  }
  if (d.projectId) {
    return { to: `/projects/${d.projectId}`, label: "Open project" };
  }
  return null;
}

export default function NotificationsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await listNotifications({ limit: 100 });
      setRows(data.notifications ?? []);
    } catch (e) {
      setError(e.response?.data?.error ?? "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onRead(id) {
    try {
      await markNotificationRead(id);
      await load();
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
            <Bell className="h-5 w-5" />
          </span>
          Notifications
        </h1>
        <p className="mt-2 text-sm text-slate-500">Invites and updates from your projects.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-10 w-10" />
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl bg-red-50/80 p-4 text-sm text-red-700 ring-1 ring-red-200/60">
          {error}
        </div>
      ) : null}

      {!loading && rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((n) => {
            const cta = notificationCta(n);
            return (
              <Card
                key={n.id}
                className={`ring-1 transition-all duration-200 hover:shadow-md ${
                  n.readAt
                    ? "opacity-60 ring-slate-200/30"
                    : "ring-amber-200/40 bg-gradient-to-r from-amber-50/30 to-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-900">{n.title}</h2>
                      <Badge tone="muted">{n.type}</Badge>
                      {!n.readAt ? <Badge tone="warn">Unread</Badge> : null}
                    </div>
                    {n.body ? <p className="mt-1.5 text-sm text-slate-500">{n.body}</p> : null}
                    <p className="mt-2 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                    {cta ? (
                      <Link
                        to={cta.to}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-600"
                      >
                        {cta.label}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                  {!n.readAt ? (
                    <Button type="button" variant="secondary" size="sm" onClick={() => onRead(n.id)}>
                      <Check className="h-3.5 w-3.5" />
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      {!loading && rows.length === 0 ? (
        <Card className="border-dashed border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 text-center ring-0">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm text-slate-500">You&apos;re all caught up.</p>
        </Card>
      ) : null}
    </div>
  );
}
