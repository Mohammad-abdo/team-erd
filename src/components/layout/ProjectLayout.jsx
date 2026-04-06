import { useEffect, useState, useCallback } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";
import { getProject } from "../../api/projects.js";
import { useProjectRealtime } from "../../hooks/useProjectRealtime.js";
import { Badge } from "../ui/Badge.jsx";
import { Card } from "../ui/Card.jsx";
import { Spinner } from "../ui/Spinner.jsx";
import { useSessionStore } from "../../store/useSessionStore.js";
import { ProjectPresenceBar } from "../project/ProjectPresenceBar.jsx";

export function ProjectLayout() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const { pathname } = useLocation();
  const isWhiteboard = /\/projects\/[^/]+\/whiteboard\/?$/.test(pathname);
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [peers, setPeers] = useState(() => new Map());
  const user = useSessionStore((s) => s.user);

  const onPresencePeer = useCallback(
    (p) => {
      if (!p?.userId || p.userId === user?.id) {
        return;
      }
      setPeers((prev) => new Map(prev).set(p.userId, { userId: p.userId, name: p.name, avatar: p.avatar }));
    },
    [user?.id],
  );

  const onPresenceLeft = useCallback((p) => {
    if (!p?.userId) {
      return;
    }
    setPeers((prev) => {
      const next = new Map(prev);
      next.delete(p.userId);
      return next;
    });
  }, []);

  useProjectRealtime(projectId, { onPresencePeer, onPresenceLeft });

  useEffect(() => {
    setPeers(new Map());
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getProject(projectId);
        if (!cancelled) {
          setProject(data.project);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.error ?? t("project.layout.loadError"));
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
  }, [projectId, t]);

  useEffect(() => {
    const bump = async () => {
      try {
        const { data } = await getProject(projectId);
        setProject(data.project);
      } catch {
        /* ignore */
      }
    };
    const onMem = (e) => {
      if (e.detail?.projectId === projectId) {
        bump();
      }
    };
    const onProj = (e) => {
      if (e.detail?.projectId === projectId) {
        bump();
      }
    };
    window.addEventListener("dbforge:members-updated", onMem);
    window.addEventListener("dbforge:project-updated", onProj);
    return () => {
      window.removeEventListener("dbforge:members-updated", onMem);
      window.removeEventListener("dbforge:project-updated", onProj);
    };
  }, [projectId]);

  if (loading) {
    return (
      <div
        className={
          isWhiteboard
            ? "flex min-h-0 flex-1 items-center justify-center bg-zinc-950"
            : "flex min-h-[40vh] items-center justify-center"
        }
      >
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <Card className="max-w-lg border-red-200/60 bg-red-50/50 ring-1 ring-red-200/40">
        <p className="text-sm font-medium text-red-700">{error ?? t("project.layout.notFound")}</p>
        <Link
          to="/"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-600"
        >
          <Home className="h-3.5 w-3.5" />
          {t("project.layout.backDashboard")}
        </Link>
      </Card>
    );
  }

  if (isWhiteboard) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Outlet context={{ project, setProject }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div className="border-b border-slate-200/60 pb-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
          <Link to="/" className="transition-colors hover:text-teal-700">
            {t("nav.dashboard")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 rtl:rotate-180" />
          <span className="font-semibold text-slate-800">{project.name}</span>
        </nav>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">{project.name}</h1>
            {project.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 lg:text-base">{project.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="muted">{project.visibility}</Badge>
            {project.myRole ? (
              <Badge tone="success">
                {t("project.layout.youRole", {
                  role: t(`roles.${project.myRole}`, { defaultValue: project.myRole }),
                })}
              </Badge>
            ) : null}
            <span className="text-xs text-slate-400">
              {t("project.layout.membersSlug", { count: project.memberCount, slug: project.slug })}
            </span>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-3 backdrop-blur-sm">
          <ProjectPresenceBar peers={peers} selfName={user?.name} />
        </div>
      </div>

      <Outlet context={{ project, setProject }} />
    </div>
  );
}
