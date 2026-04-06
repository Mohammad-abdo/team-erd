import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  Ban,
  ChevronRight,
  Filter,
  FolderKanban,
  PauseCircle,
  Plus,
  Search,
  Sprout,
  Users,
  X,
} from "lucide-react";
import { createProject, listProjects } from "../../api/projects.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

const STAGES = ["growing", "in_progress", "waiting", "stopped"];

const STAGE_META = {
  growing: { fill: "#059669", icon: Sprout },
  in_progress: { fill: "#2563eb", icon: ChevronRight },
  waiting: { fill: "#d97706", icon: PauseCircle },
  stopped: { fill: "#64748b", icon: Ban },
};

export default function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith("ar") ? ar : enUS;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await listProjects();
      setProjects(data.projects ?? []);
    } catch (e) {
      setError(e.response?.data?.error ?? t("projectsPage.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!modalOpen) {
      return undefined;
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const stage = p.healthStage && STAGE_META[p.healthStage] ? p.healthStage : "in_progress";
      if (filterStage !== "all" && stage !== filterStage) {
        return false;
      }
      if (filterVisibility !== "all" && p.visibility !== filterVisibility) {
        return false;
      }
      if (!q) {
        return true;
      }
      const nameMatch = (p.name ?? "").toLowerCase().includes(q);
      const slugMatch = (p.slug ?? "").toLowerCase().includes(q);
      const descMatch = (p.description ?? "").toLowerCase().includes(q);
      return nameMatch || slugMatch || descMatch;
    });
  }, [projects, search, filterStage, filterVisibility]);

  async function onCreate(e) {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    setCreating(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
      });
      setName("");
      setDescription("");
      setVisibility("PRIVATE");
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.error ?? t("projectsPage.createError"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {t("projectsPage.title")}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
            {t("projectsPage.subtitle")}
          </p>
        </div>
        <Button type="button" className="w-full sm:w-auto" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("projectsPage.addProject")}
        </Button>
      </div>

      <Card className="ring-1 ring-slate-200/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="proj-search" className="sr-only">
              {t("projectsPage.searchLabel")}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="proj-search"
                className="w-full rounded-xl border border-slate-200/80 bg-white/60 py-2.5 pe-3.5 ps-10 text-sm text-slate-900 shadow-sm backdrop-blur-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300/80 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/15"
                placeholder={t("projectsPage.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Select
              id="filter-stage"
              label={t("projectsPage.filterStage")}
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="min-w-44"
            >
              <option value="all">{t("projectsPage.allStages")}</option>
              {STAGES.map((key) => (
                <option key={key} value={key}>
                  {t(`dashboard.stage.${key}`)}
                </option>
              ))}
            </Select>
            <Select
              id="filter-vis"
              label={t("projectsPage.filterVisibility")}
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="min-w-44"
            >
              <option value="all">{t("projectsPage.allVisibility")}</option>
              <option value="PRIVATE">{t("dashboard.private")}</option>
              <option value="PUBLIC">{t("dashboard.public")}</option>
            </Select>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Filter className="h-3.5 w-3.5 shrink-0" />
          {t("projectsPage.resultsCount", { count: filtered.length, total: projects.length })}
        </p>
      </Card>

      {error ? (
        <div className="rounded-xl bg-red-50/80 p-4 text-sm text-red-700 ring-1 ring-red-200/60">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      ) : null}

      {!loading && projects.length === 0 ? (
        <Card className="border-dashed border-slate-200/80 bg-gradient-to-br from-white to-teal-50/20 text-center ring-0">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 ring-1 ring-teal-100/80">
            <FolderKanban className="h-7 w-7 text-teal-600" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">{t("projectsPage.emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t("projectsPage.emptyBody")}</p>
          <Button type="button" className="mt-7" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("projectsPage.addProject")}
          </Button>
        </Card>
      ) : null}

      {!loading && projects.length > 0 && filtered.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-slate-500">{t("projectsPage.noMatches")}</p>
        </Card>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const stage = p.healthStage ?? "in_progress";
            const meta = STAGE_META[stage] ?? STAGE_META.in_progress;
            const StageIcon = meta.icon;
            const c = p.counts ?? { tables: 0, relations: 0, apiRoutes: 0, comments: 0 };
            let lastLabel = "";
            try {
              if (p.lastActivityAt) {
                lastLabel = formatDistanceToNow(new Date(p.lastActivityAt), {
                  addSuffix: true,
                  locale: dateLocale,
                });
              }
            } catch {
              lastLabel = "";
            }
            return (
              <li key={p.id}>
                <Link to={`/projects/${p.id}`} className="group block h-full">
                  <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200/60 hover:shadow-xl hover:shadow-teal-900/[0.06]">
                    <div
                      className="absolute inset-x-0 top-0 h-1 opacity-80"
                      style={{ background: `linear-gradient(90deg, ${meta.fill}, ${meta.fill}60)` }}
                    />
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
                          style={{ backgroundColor: meta.fill }}
                        >
                          <StageIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 transition-colors group-hover:text-teal-800">
                            {p.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {p.description || t("dashboard.noDescription")}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge tone="muted">{p.visibility}</Badge>
                        <span
                          className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                          style={{ backgroundColor: meta.fill }}
                        >
                          {t(`dashboard.stage.${stage}`, { defaultValue: stage })}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 font-mono text-[11px] text-slate-400">/{p.slug}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t("dashboard.countsShort", {
                        tables: c.tables,
                        routes: c.apiRoutes,
                        rels: c.relations,
                      })}
                    </p>
                    {lastLabel ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {t("dashboard.lastActivity")}: {lastLabel}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100/80 pt-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {t("dashboard.members", { count: p.memberCount })}
                      </span>
                      {p.myRole ? (
                        <Badge tone="success">{t(`roles.${p.myRole}`, { defaultValue: p.myRole })}</Badge>
                      ) : null}
                      <span className="ms-auto inline-flex items-center gap-0.5 text-teal-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {t("projectsPage.openProject")}
                        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-project-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-label={t("projectsPage.closeModal")}
            onClick={() => !creating && setModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md animate-scale-in rounded-2xl border border-slate-200/50 bg-white/95 p-7 shadow-2xl shadow-slate-900/15 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="new-project-title" className="text-xl font-extrabold tracking-tight text-slate-900">
                  {t("projectsPage.modalTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{t("projectsPage.modalSubtitle")}</p>
              </div>
              <button
                type="button"
                className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-50"
                disabled={creating}
                onClick={() => setModalOpen(false)}
                aria-label={t("projectsPage.closeModal")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={onCreate}>
              <Input
                id="modal-pname"
                label={t("dashboard.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <Input
                id="modal-pdesc"
                label={t("dashboard.description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Select
                id="modal-pvis"
                label={t("dashboard.visibility")}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="PRIVATE">{t("dashboard.private")}</option>
                <option value="PUBLIC">{t("dashboard.public")}</option>
              </Select>
              <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={creating}
                  onClick={() => setModalOpen(false)}
                >
                  {t("projectsPage.cancel")}
                </Button>
                <Button type="submit" className="w-full sm:w-auto" disabled={creating}>
                  <Plus className="h-4 w-4" />
                  {creating ? t("dashboard.creating") : t("dashboard.create")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
