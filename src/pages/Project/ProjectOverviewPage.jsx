import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  Database,
  FileBarChart,
  FileUp,
  Loader2,
  MessageSquare,
  Upload,
  Users,
} from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import {
  getErdTables,
  getErdRelations,
  getApiGroups,
  listMembers,
  importErdSchema,
  importApiDocs,
} from "../../api/projects.js";
import { detectAndParse } from "../../utils/schemaParsers.js";

const TILE_COLORS = [
  "from-teal-500 to-cyan-500",
  "from-blue-500 to-indigo-500",
  "from-purple-500 to-violet-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-green-500",
];

export default function ProjectOverviewPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const { project } = useOutletContext();

  const [stats, setStats] = useState({ tables: 0, relations: 0, apiGroups: 0, apiRoutes: 0, members: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [clearExisting, setClearExisting] = useState(false);
  const fileRef = useRef(null);

  const canEdit = project?.myRole === "LEADER" || project?.myRole === "EDITOR";

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [tRes, rRes, aRes, mRes] = await Promise.all([
        getErdTables(projectId),
        getErdRelations(projectId),
        getApiGroups(projectId),
        listMembers(projectId),
      ]);
      const tables = tRes.data.tables ?? [];
      const relations = rRes.data.relations ?? [];
      const apiGroups = aRes.data.groups ?? [];
      const apiRoutes = apiGroups.reduce((sum, g) => sum + (g.routes?.length ?? 0), 0);
      const members = mRes.data.members?.length ?? mRes.data.length ?? 0;
      setStats({ tables: tables.length, relations: relations.length, apiGroups: apiGroups.length, apiRoutes, members });
    } catch {}
    finally { setStatsLoading(false); }
  }, [projectId]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const base = `/projects/${projectId}`;

  const tiles = useMemo(() => [
    { to: `${base}/whiteboard`, titleKey: "project.overview.tiles.whiteboardTitle", descKey: "project.overview.tiles.whiteboardDesc", icon: Database, stat: `${stats.tables} tables \u00b7 ${stats.relations} relations` },
    { to: `${base}/api`, titleKey: "project.overview.tiles.apiTitle", descKey: "project.overview.tiles.apiDesc", icon: BookOpen, stat: `${stats.apiGroups} groups \u00b7 ${stats.apiRoutes} routes` },
    { to: `${base}/team`, titleKey: "project.overview.tiles.teamTitle", descKey: "project.overview.tiles.teamDesc", icon: Users, stat: `${stats.members} members` },
    { to: `${base}/comments`, titleKey: "project.overview.tiles.commentsTitle", descKey: "project.overview.tiles.commentsDesc", icon: MessageSquare },
    { to: `${base}/report`, titleKey: "project.overview.tiles.reportTitle", descKey: "project.overview.tiles.reportDesc", icon: FileBarChart },
  ], [base, stats]);

  function onFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(""); setImportResult(null); setParsedPreview(null);

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      const result = detectAndParse(content, file.name);
      if (result.type === "unknown") {
        setImportError(result.error || "Unsupported file format.");
        return;
      }
      setParsedPreview(result);
    };
    reader.readAsText(file);
  }

  async function doImport() {
    if (!parsedPreview) return;
    setImportBusy(true); setImportError(""); setImportResult(null);
    try {
      if (parsedPreview.type === "sql" || parsedPreview.type === "prisma") {
        const { tables, relations } = parsedPreview.data;
        const res = await importErdSchema(projectId, { tables, relations, clearExisting });
        setImportResult(`Imported ${res.data.tablesCreated} tables and ${res.data.relationsCreated} relations.`);
      } else if (parsedPreview.type === "openapi") {
        const { groups } = parsedPreview.data;
        const res = await importApiDocs(projectId, { groups, clearExisting });
        setImportResult(`Imported ${res.data.groupsCreated} API groups and ${res.data.routesCreated} routes.`);
      }
      setParsedPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      loadStats();
    } catch (err) {
      setImportError(err.response?.data?.error ?? "Import failed.");
    } finally { setImportBusy(false); }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="overflow-hidden ring-1 ring-slate-200/40">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <CardHeader title={t("project.overview.title")} description={t("project.overview.subtitle")} />
          {canEdit ? (
            <Button size="sm" variant="secondary" onClick={() => setImportOpen(!importOpen)}>
              <Upload className="h-4 w-4" />
              {importOpen ? "Close Import" : "Import Schema / API"}
            </Button>
          ) : null}
        </div>

        {importOpen && canEdit ? (
          <div className="mb-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-teal-50/20 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
                <FileUp className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Import from file</h3>
                <p className="text-xs text-slate-500">Upload SQL, Prisma schema, or OpenAPI/Swagger JSON</p>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-300/80 bg-white/60 p-6 text-center">
              <input ref={fileRef} type="file" accept=".sql,.prisma,.json,.txt" onChange={onFileSelect} className="mx-auto block max-w-xs text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700" />
              <p className="mt-2 text-xs text-slate-400">Supported: .sql, .prisma, .json (OpenAPI/Swagger)</p>
            </div>

            {parsedPreview ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-white/80 p-4 ring-1 ring-slate-200/60">
                  <h4 className="text-sm font-bold text-slate-800">
                    Preview:
                    <span className="ml-2 rounded bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800 uppercase">{parsedPreview.type}</span>
                  </h4>
                  {(parsedPreview.type === "sql" || parsedPreview.type === "prisma") ? (
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-2xl font-extrabold text-slate-900">{parsedPreview.data.tables.length}</p>
                        <p className="text-xs text-slate-500">Tables to import</p>
                        <ul className="mt-2 max-h-32 overflow-y-auto space-y-0.5">
                          {parsedPreview.data.tables.map((t) => (
                            <li key={t.name} className="text-xs text-slate-700">
                              <code className="font-mono">{t.name}</code>
                              <span className="text-slate-400 ml-1">({t.columns.length} cols)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-2xl font-extrabold text-slate-900">{parsedPreview.data.relations.length}</p>
                        <p className="text-xs text-slate-500">Relations detected</p>
                        <ul className="mt-2 max-h-32 overflow-y-auto space-y-0.5">
                          {parsedPreview.data.relations.map((r, i) => (
                            <li key={i} className="text-xs text-slate-700 font-mono">
                              {r.fromTable}.{r.fromColumn} &rarr; {r.toTable}.{r.toColumn}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                  {parsedPreview.type === "openapi" ? (
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-2xl font-extrabold text-slate-900">{parsedPreview.data.groups.length}</p>
                        <p className="text-xs text-slate-500">API groups</p>
                        <ul className="mt-2 max-h-32 overflow-y-auto space-y-0.5">
                          {parsedPreview.data.groups.map((g) => (
                            <li key={g.name} className="text-xs text-slate-700">
                              <span className="font-semibold">{g.name}</span>
                              <span className="text-slate-400 ml-1">({g.routes.length} routes)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-2xl font-extrabold text-slate-900">{parsedPreview.data.groups.reduce((s, g) => s + g.routes.length, 0)}</p>
                        <p className="text-xs text-slate-500">Total routes</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={clearExisting} onChange={(e) => setClearExisting(e.target.checked)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/30" />
                  Clear existing {parsedPreview.type === "openapi" ? "API docs" : "ERD tables"} before import
                </label>

                <div className="flex gap-2">
                  <Button onClick={doImport} disabled={importBusy}>
                    {importBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {importBusy ? "Importing\u2026" : "Import Now"}
                  </Button>
                  <Button variant="secondary" onClick={() => { setParsedPreview(null); if (fileRef.current) fileRef.current.value = ""; }}>Cancel</Button>
                </div>
              </div>
            ) : null}

            {importError ? (
              <div className="flex items-center gap-2 rounded-xl bg-red-50/80 p-3 text-sm text-red-700 ring-1 ring-red-200/60">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {importError}
              </div>
            ) : null}
            {importResult ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200/60">
                <Check className="h-4 w-4 shrink-0" />
                {importResult}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {tiles.map(({ to, titleKey, descKey, icon: Icon, stat }, i) => (
            <Link
              key={to}
              to={to}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200/60 hover:shadow-xl hover:shadow-teal-900/[0.06]"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${TILE_COLORS[i % TILE_COLORS.length]} text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-base font-bold tracking-tight text-slate-900">{t(titleKey)}</span>
              </div>
              {stat && !statsLoading ? (
                <p className="mt-2 text-xs font-semibold tabular-nums text-teal-700">{stat}</p>
              ) : null}
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{t(descKey)}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                {t("project.overview.open")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="ring-1 ring-slate-200/40">
          <CardHeader
            title={t("project.overview.detailsTitle")}
            action={<Link to={`${base}/settings`}><Button variant="secondary" size="sm" type="button">{t("nav.settings")}</Button></Link>}
          />
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50/80 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("project.overview.slug")}</dt>
              <dd className="mt-1 font-mono text-slate-900">{project.slug}</dd>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("project.overview.visibility")}</dt>
              <dd className="mt-1 text-slate-900">{project.visibility}</dd>
            </div>
            <div className="sm:col-span-2 rounded-xl bg-slate-50/80 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("project.overview.description")}</dt>
              <dd className="mt-1 text-slate-900">{project.description || t("project.overview.dash")}</dd>
            </div>
          </dl>
        </Card>

        <Card className="ring-1 ring-slate-200/40">
          <CardHeader
            title={t("project.overview.activityTitle")}
            description={t("project.overview.activityDesc")}
            action={<Link to={`${base}/activity`}><Button variant="secondary" size="sm" type="button">{t("project.overview.viewAll")}</Button></Link>}
          />
          <Link
            to={`${base}/activity`}
            className="group flex items-center gap-4 rounded-2xl border border-dashed border-slate-200/80 bg-gradient-to-br from-slate-50/60 to-teal-50/20 p-6 text-slate-600 transition-all duration-200 hover:border-teal-200/60 hover:bg-teal-50/30 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{t("project.overview.feedTitle")}</p>
              <p className="mt-0.5 text-sm text-slate-500">{t("project.overview.feedDesc")}</p>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
}
