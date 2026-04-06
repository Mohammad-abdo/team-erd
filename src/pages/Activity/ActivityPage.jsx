import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Activity } from "lucide-react";
import { getActivityFeed } from "../../api/projects.js";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

const ACTION_TONES = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "danger",
};

export default function ActivityPage() {
  const { projectId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getActivityFeed(projectId, { limit: 80 });
        if (!cancelled) {
          setItems(data.items ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.error ?? "Failed to load activity");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
            <Activity className="h-5 w-5" />
          </span>
          Activity feed
        </h1>
        <p className="mt-2 text-sm text-slate-500">Recent creates, updates, and deletes across this project.</p>
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

      {!loading && items.length > 0 ? (
        <ol className="relative space-y-3 border-s-2 border-slate-200/80 ps-6">
          {items.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -start-[calc(1.5rem+5px)] mt-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-500 shadow-sm" />
              <Card className="py-4 ring-1 ring-slate-200/40 transition-all duration-200 hover:shadow-md">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge tone={ACTION_TONES[item.action] ?? "muted"}>{item.action}</Badge>
                  <span className="font-medium text-slate-700">{item.entityType}</span>
                  <code className="rounded-md bg-slate-100/80 px-1.5 py-0.5 text-xs text-slate-600">{item.entityId}</code>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  {item.user?.name ?? "System"} &middot; {new Date(item.createdAt).toLocaleString()}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      ) : null}

      {!loading && items.length === 0 ? (
        <Card className="border-dashed border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 text-center ring-0">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Activity className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm text-slate-500">No activity recorded yet.</p>
        </Card>
      ) : null}
    </div>
  );
}
