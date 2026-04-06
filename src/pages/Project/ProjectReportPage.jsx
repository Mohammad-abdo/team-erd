import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Database,
  GitBranch,
  Users,
  LayoutGrid,
  Download,
  RefreshCw,
  X,
  Search,
  Code2,
  Lock,
  Unlock,
  FileText,
} from "lucide-react";
import reportApi from "../../api/report.js";
import { Button } from "../../components/ui/Button.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import "./projectReportEldokan.css";

const COLORS = {
  blue: { bg: "#1b5ea5" },
  teal: { bg: "#0c705e" },
  amber: { bg: "#8f5b0f" },
  purple: { bg: "#564ab7" },
  coral: { bg: "#a8441f" },
  green: { bg: "#427317" },
  pink: { bg: "#9f3b60" },
  gray: { bg: "#62625b" },
};

const METHOD_BADGE = {
  GET: "dbforge-report-badge-green",
  POST: "dbforge-report-badge-blue",
  PUT: "dbforge-report-badge-amber",
  PATCH: "dbforge-report-badge-purple",
  DELETE: "dbforge-report-badge-coral",
};

const ROLE_BADGE = {
  LEADER: "dbforge-report-badge-blue",
  EDITOR: "dbforge-report-badge-green",
  VIEWER: "dbforge-report-badge-amber",
  COMMENTER: "dbforge-report-badge-purple",
};

function tableGroupKey(t) {
  return t.group || "uncategorized";
}

function errMessage(err, fallback) {
  return err?.response?.data?.error ?? err?.message ?? fallback;
}

export default function ProjectReportPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [filterGroup, setFilterGroup] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportBusy, setExportBusy] = useState(false);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportApi.getFullReport(projectId, "json");
      setReport(data);
    } catch (err) {
      setError(errMessage(err, t("report.project.loadError")));
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const groups = useMemo(() => {
    if (!report?.tables?.length) {
      return [];
    }
    return [...new Set(report.tables.map(tableGroupKey))].sort();
  }, [report?.tables]);

  const q = searchQuery.trim().toLowerCase();

  const filteredTables = useMemo(() => {
    if (!report?.tables) {
      return [];
    }
    return report.tables.filter((table) => {
      if (filterGroup !== "all" && tableGroupKey(table) !== filterGroup) {
        return false;
      }
      if (q && !table.name.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [report?.tables, filterGroup, q]);

  const filteredRelations = useMemo(() => {
    if (!report?.relations || !report?.tables) {
      return [];
    }
    const byId = new Map(report.tables.map((tb) => [tb.id, tb]));
    return report.relations.filter((rel) => {
      if (filterGroup !== "all") {
        const fromT = byId.get(rel.fromTableId);
        const toT = byId.get(rel.toTableId);
        const fg = (tb) => tableGroupKey(tb || {});
        if (fg(fromT) !== filterGroup && fg(toT) !== filterGroup) {
          return false;
        }
      }
      if (q) {
        const mf = rel.fromTable.toLowerCase().includes(q);
        const mt = rel.toTable.toLowerCase().includes(q);
        return mf || mt;
      }
      return true;
    });
  }, [report?.relations, report?.tables, filterGroup, q]);

  async function onExportMarkdown() {
    try {
      setExportBusy(true);
      const data = await reportApi.getFullReport(projectId, "markdown");
      const md = data.markdown ?? "";
      const slug = report?.project?.slug ?? "project";
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${slug}-dbforge-report.md`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      setError(errMessage(err, t("report.project.exportError")));
    } finally {
      setExportBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Spinner className="h-10 w-10" />
        <p className="text-sm text-slate-600">{t("report.project.loading")}</p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="dbforge-report-ov-card mx-auto max-w-md text-center">
        <h2 className="text-lg font-bold text-red-700">{t("report.project.errorTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button type="button" className="mt-4" onClick={loadReport}>
          <RefreshCw className="h-4 w-4" />
          {t("report.project.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="dbforge-report-app">
      <div className="dbforge-report-tabbar">
        {[
          { id: "overview", icon: LayoutGrid, label: t("report.project.tabs.overview") },
          { id: "erd", icon: Database, label: t("report.project.tabs.erd") },
          { id: "relations", icon: GitBranch, label: t("report.project.tabs.relations") },
          { id: "api", icon: Code2, label: t("report.project.tabs.api") },
          { id: "team", icon: Users, label: t("report.project.tabs.team") },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            className={`dbforge-report-tab ${activeTab === id ? "dbforge-report-tab--active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" />
            {label}
          </button>
        ))}
        <span className="flex-1" />
        <Button variant="secondary" size="sm" type="button" onClick={loadReport}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          disabled={exportBusy}
          onClick={onExportMarkdown}
        >
          <Download className="h-4 w-4" />
          {exportBusy ? t("report.project.exporting") : t("report.project.exportMd")}
        </Button>
      </div>

      <div className="dbforge-report-body">
        {activeTab === "overview" && report ? (
          <OverviewTab report={report} t={t} onSelectTable={setSelectedTable} />
        ) : null}
        {activeTab === "erd" && report ? (
          <ErdTab
            tables={filteredTables}
            groups={groups}
            filterGroup={filterGroup}
            setFilterGroup={setFilterGroup}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectTable={setSelectedTable}
            onOpenRelations={() => {
              setActiveTab("relations");
            }}
            t={t}
          />
        ) : null}
        {activeTab === "relations" && report ? (
          <RelationsTab
            relations={filteredRelations}
            groups={groups}
            filterGroup={filterGroup}
            setFilterGroup={setFilterGroup}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            t={t}
          />
        ) : null}
        {activeTab === "api" && report ? <ApiTab api={report.apiDocumentation} t={t} /> : null}
        {activeTab === "team" && report ? <TeamTab team={report.team} t={t} /> : null}
      </div>

      {selectedTable ? (
        <TableDetailPanel table={selectedTable} onClose={() => setSelectedTable(null)} t={t} />
      ) : null}
    </div>
  );
}

function OverviewTab({ report, t, onSelectTable }) {
  const { statistics, project, tableGroups, team } = report;

  return (
    <div className="dbforge-report-fade-in">
      <div className="dbforge-report-stat-row">
        <div className="dbforge-report-stat">
          <div className="num">{statistics.tables}</div>
          <div className="lbl">{t("report.project.stats.tables")}</div>
        </div>
        <div className="dbforge-report-stat">
          <div className="num">{statistics.columns}</div>
          <div className="lbl">{t("report.project.stats.columns")}</div>
        </div>
        <div className="dbforge-report-stat">
          <div className="num">{statistics.relations}</div>
          <div className="lbl">{t("report.project.stats.relations")}</div>
        </div>
        <div className="dbforge-report-stat">
          <div className="num">{statistics.apiRoutes}</div>
          <div className="lbl">{t("report.project.stats.apiRoutes")}</div>
        </div>
        <div className="dbforge-report-stat">
          <div className="num">{statistics.members}</div>
          <div className="lbl">{t("report.project.stats.members")}</div>
        </div>
        <div className="dbforge-report-stat">
          <div className="num">{statistics.comments}</div>
          <div className="lbl">{t("report.project.stats.comments")}</div>
        </div>
      </div>

      <p className="dbforge-report-intro">
        <strong>{project.name}</strong>
        {project.description ? ` — ${project.description}` : null}
        <br />
        {t("report.project.introNote", { slug: project.slug, visibility: project.visibility })}
      </p>

      {tableGroups?.length > 0 ? (
        <>
          <div className="dbforge-report-section-title">{t("report.project.sections.domains")}</div>
          <div className="dbforge-report-ov-grid">
            {tableGroups.map((group) => (
              <div key={group.name} className="dbforge-report-ov-card">
                <h3>
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: COLORS[group.colors?.[0]]?.bg ?? COLORS.gray.bg,
                    }}
                  />
                  {group.name}
                </h3>
                <p>
                  {t("report.project.groupMeta", {
                    tables: group.tables.length,
                    columns: group.totalColumns,
                  })}
                </p>
                <div className="dbforge-report-tech-list">
                  {group.tables.map((name) => (
                    <span key={name} className="dbforge-report-tech-chip">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="dbforge-report-section-title">{t("report.project.sections.sampleTables")}</div>
      <div className="dbforge-report-ov-grid">
        {report.tables.slice(0, 12).map((table) => (
          <button
            key={table.id}
            type="button"
            className="dbforge-report-ov-card w-full text-start"
            onClick={() => onSelectTable?.(table)}
          >
            <h3>
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[table.color]?.bg ?? COLORS.gray.bg }}
              />
              {table.name}
            </h3>
            <p className="text-xs text-slate-500">
              {t("report.project.tableMeta", {
                cols: table.columns.length,
                rels: table.relations.from.length + table.relations.to.length,
              })}
            </p>
          </button>
        ))}
      </div>

      {team?.roles?.length > 0 ? (
        <>
          <div className="dbforge-report-section-title">{t("report.project.sections.roles")}</div>
          <div className="dbforge-report-roles-grid">
            {team.roles.map((roleRow) => (
              <div key={roleRow.role} className="dbforge-report-role-card">
                <div className="role-title">
                  <span className={`dbforge-report-badge ${ROLE_BADGE[roleRow.role] ?? "dbforge-report-badge-teal"}`}>
                    {t(`roles.${roleRow.role}`, { defaultValue: roleRow.role })}
                  </span>{" "}
                  · {roleRow.count}
                </div>
                <ul>
                  {roleRow.users.slice(0, 6).map((u) => (
                    <li key={u.id}>• {u.name}</li>
                  ))}
                  {roleRow.users.length > 6 ? (
                    <li>… +{roleRow.users.length - 6}</li>
                  ) : null}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <p className="mt-4 text-xs text-slate-400">
        {t("report.project.generated")}{" "}
        {new Date(report.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}

function ErdTab({
  tables,
  groups,
  filterGroup,
  setFilterGroup,
  searchQuery,
  setSearchQuery,
  onSelectTable,
  onOpenRelations,
  t,
}) {
  return (
    <div className="dbforge-report-fade-in space-y-4">
      <div className="dbforge-report-toolbar">
        <div className="dbforge-report-filter-row">
          <span className="dbforge-report-toolbar-label">{t("report.project.filterGroup")}</span>
          <button
            type="button"
            className={`dbforge-report-filter-btn ${filterGroup === "all" ? "dbforge-report-filter-btn--active" : ""}`}
            onClick={() => setFilterGroup("all")}
          >
            {t("report.project.all")}
          </button>
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              className={`dbforge-report-filter-btn ${filterGroup === g ? "dbforge-report-filter-btn--active" : ""}`}
              onClick={() => setFilterGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="dbforge-report-relations-search">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="search"
            className="dbforge-report-relations-input max-w-none flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("report.project.searchTables")}
          />
          <span className="text-xs font-bold text-slate-400">
            {tables.length} {t("report.project.tablesCount")}
          </span>
        </div>
      </div>

      <div className="dbforge-report-link-relations">
        <p className="text-xs font-semibold text-slate-600">{t("report.project.relationsHint")}</p>
        <button type="button" className="dbforge-report-btn-relations" onClick={onOpenRelations}>
          {t("report.project.openRelations")}
        </button>
      </div>

      <div className="dbforge-report-erd-wrap">
        <div className="dbforge-report-tbl-grid">
          {tables.map((table) => (
            <div
              key={table.id}
              className="dbforge-report-tbl-card"
              role="button"
              tabIndex={0}
              onClick={() => onSelectTable(table)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectTable(table);
                }
              }}
            >
              <div
                className="px-3 py-2 text-xs font-extrabold text-white"
                style={{ backgroundColor: COLORS[table.color]?.bg ?? COLORS.gray.bg }}
              >
                {table.name}
              </div>
              <div className="p-2">
                {table.columns.slice(0, 5).map((col, idx) => (
                  <div
                    key={col.id || idx}
                    className="flex items-center gap-2 border-t border-slate-100 py-1 text-xs first:border-0"
                  >
                    <span className="flex-1 truncate font-semibold text-slate-700">{col.name}</span>
                    <span className="text-[10px] text-slate-400">{col.dataType}</span>
                    {col.isPk ? (
                      <span className="rounded bg-amber-100 px-1 text-[9px] font-bold text-amber-800">
                        PK
                      </span>
                    ) : null}
                    {col.isFk && !col.isPk ? (
                      <span className="rounded bg-blue-100 px-1 text-[9px] font-bold text-blue-800">
                        FK
                      </span>
                    ) : null}
                  </div>
                ))}
                {table.columns.length > 5 ? (
                  <div className="pt-1 text-xs text-slate-400">+{table.columns.length - 5}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RelationsTab({
  relations,
  groups,
  filterGroup,
  setFilterGroup,
  searchQuery,
  setSearchQuery,
  t,
}) {
  return (
    <div className="dbforge-report-fade-in space-y-4">
      <div className="dbforge-report-toolbar">
        <div className="dbforge-report-filter-row">
          <span className="dbforge-report-toolbar-label">{t("report.project.filterGroup")}</span>
          <button
            type="button"
            className={`dbforge-report-filter-btn ${filterGroup === "all" ? "dbforge-report-filter-btn--active" : ""}`}
            onClick={() => setFilterGroup("all")}
          >
            {t("report.project.all")}
          </button>
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              className={`dbforge-report-filter-btn ${filterGroup === g ? "dbforge-report-filter-btn--active" : ""}`}
              onClick={() => setFilterGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="dbforge-report-relations-search">
          <span className="dbforge-report-toolbar-label !min-w-0">{t("report.project.searchLabel")}</span>
          <input
            type="search"
            className="dbforge-report-relations-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("report.project.searchRelations")}
          />
          <span className="text-xs font-bold text-slate-400">
            {relations.length} {t("report.project.relationsCount")}
          </span>
        </div>
      </div>

      <div className="dbforge-report-relations-body">
        <div className="dbforge-report-relations-grid">
          {relations.map((rel) => (
            <div key={rel.id} className="dbforge-report-erd-chip flex-wrap">
              <code>{rel.fromTable}</code>
              <span className="text-slate-400">→</span>
              <code>{rel.toTable}</code>
              <span
                className={`dbforge-report-badge ${
                  rel.type === "ONE_TO_ONE"
                    ? "dbforge-report-badge-green"
                    : rel.type === "MANY_TO_MANY"
                      ? "dbforge-report-badge-coral"
                      : "dbforge-report-badge-blue"
                }`}
              >
                {rel.type === "ONE_TO_ONE" ? "1:1" : rel.type === "MANY_TO_MANY" ? "N:M" : "1:N"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApiTab({ api, t }) {
  if (!api) {
    return <p className="text-sm text-slate-600">{t("report.project.noApi")}</p>;
  }

  return (
    <div className="dbforge-report-fade-in space-y-6">
      <div className="dbforge-report-stat-row">
        <div className="dbforge-report-stat">
          <div className="num">{api.summary?.total ?? 0}</div>
          <div className="lbl">{t("report.project.apiTotal")}</div>
        </div>
        <div className="dbforge-report-stat">
          <div className="num">{api.summary?.byMethod?.GET ?? 0}</div>
          <div className="lbl">GET</div>
        </div>
        <div className="dbforge-report-stat">
          <div className="num">{api.summary?.byMethod?.POST ?? 0}</div>
          <div className="lbl">POST</div>
        </div>
        <div className="dbforge-report-stat">
          <div className="num">{api.summary?.byStatus?.STABLE ?? 0}</div>
          <div className="lbl">{t("report.project.apiStable")}</div>
        </div>
      </div>

      <div className="dbforge-report-api-grid">
        {api.groups?.map((group) => (
          <div key={group.id} className="dbforge-report-ov-card">
            <h3>{group.name}</h3>
            {group.prefix ? (
              <p className="mb-2 font-mono text-xs text-slate-500">{group.prefix}</p>
            ) : null}
            {group.description ? <p className="mb-2 text-xs text-slate-500">{group.description}</p> : null}
            <div className="space-y-2">
              {group.routes.map((route) => (
                <div key={route.id} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                  <span className={`dbforge-report-badge ${METHOD_BADGE[route.method] ?? "dbforge-report-badge-teal"}`}>
                    {route.method}
                  </span>
                  <code className="flex-1 truncate text-xs text-slate-800">{route.path}</code>
                  {route.authRequired ? (
                    <Lock className="h-3 w-3 shrink-0 text-slate-400" />
                  ) : (
                    <Unlock className="h-3 w-3 shrink-0 text-emerald-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamTab({ team, t }) {
  if (!team) {
    return <p className="text-sm text-slate-600">{t("report.project.noTeam")}</p>;
  }

  return (
    <div className="dbforge-report-fade-in space-y-6">
      <div className="dbforge-report-stat-row">
        {team.roles?.map((role) => (
          <div key={role.role} className="dbforge-report-stat">
            <div className="num">{role.count}</div>
            <div className="lbl">{t(`roles.${role.role}`, { defaultValue: role.role })}</div>
          </div>
        ))}
      </div>

      <div className="dbforge-report-section-title">{t("report.project.members")}</div>
      <div className="dbforge-report-ov-grid">
        {team.members?.map((member) => (
          <div key={member.id} className="dbforge-report-ov-card flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1e4d8c] to-[#0d6b6b] text-sm font-bold text-white">
              {member.user.name?.charAt(0) || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-800">{member.user.name}</h4>
              <p className="truncate text-xs text-slate-500">{member.user.email}</p>
              <span className={`dbforge-report-badge mt-1 ${ROLE_BADGE[member.role] ?? "dbforge-report-badge-teal"}`}>
                {t(`roles.${member.role}`, { defaultValue: member.role })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableDetailPanel({ table, onClose, t }) {
  if (!table) {
    return null;
  }

  return (
    <div className="dbforge-report-detail-panel">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold text-slate-800">{table.name}</h2>
        <button
          type="button"
          className="rounded-full p-2 hover:bg-slate-100"
          onClick={onClose}
          aria-label={t("report.project.close")}
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="dbforge-report-section-title !mt-0">{t("report.project.columns")}</h4>
          {table.columns.map((col) => (
            <div key={col.id} className="border-t border-slate-100 py-2 first:border-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{col.name}</span>
                {col.isPk ? (
                  <span className="dbforge-report-badge dbforge-report-badge-amber">PK</span>
                ) : null}
                {col.isFk ? (
                  <span className="dbforge-report-badge dbforge-report-badge-blue">FK</span>
                ) : null}
                {!col.isNullable ? (
                  <span className="dbforge-report-badge dbforge-report-badge-coral">NOT NULL</span>
                ) : null}
              </div>
              <span className="text-xs text-slate-400">{col.dataType}</span>
            </div>
          ))}
        </div>

        <div>
          <h4 className="dbforge-report-section-title">{t("report.project.relationsBlock")}</h4>
          {table.relations?.from?.length > 0 ? (
            <div className="mb-3">
              <p className="mb-1 text-xs text-slate-500">{t("report.project.relOutgoing")}</p>
              {table.relations.from.map((rel) => (
                <div key={rel.id} className="py-1 text-sm">
                  → {rel.toTable}{" "}
                  <span className="dbforge-report-badge dbforge-report-badge-blue text-[10px]">{rel.type}</span>
                </div>
              ))}
            </div>
          ) : null}
          {table.relations?.to?.length > 0 ? (
            <div>
              <p className="mb-1 text-xs text-slate-500">{t("report.project.relIncoming")}</p>
              {table.relations.to.map((rel) => (
                <div key={rel.id} className="py-1 text-sm">
                  ← {rel.fromTable}{" "}
                  <span className="dbforge-report-badge dbforge-report-badge-blue text-[10px]">{rel.type}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
