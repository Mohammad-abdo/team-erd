import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, ChevronRight, FileBarChart, FolderKanban, Sprout, Users, PauseCircle, Ban } from "lucide-react";
import { listProjects } from "../../api/projects.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";

const STAGES = ["growing", "in_progress", "waiting", "stopped"];

const STAGE_META = {
  growing: { fill: "#059669", bg: "from-emerald-50 to-emerald-100/50", icon: Sprout },
  in_progress: { fill: "#2563eb", bg: "from-blue-50 to-blue-100/50", icon: ChevronRight },
  waiting: { fill: "#d97706", bg: "from-amber-50 to-amber-100/50", icon: PauseCircle },
  stopped: { fill: "#64748b", bg: "from-slate-50 to-slate-100/50", icon: Ban },
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await listProjects();
      setProjects(data.projects ?? []);
    } catch (e) {
      setError(e.response?.data?.error ?? t("dashboard.loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageCounts = useMemo(() => {
    const acc = { growing: 0, in_progress: 0, waiting: 0, stopped: 0 };
    for (const p of projects) {
      const s = p.healthStage && acc[p.healthStage] !== undefined ? p.healthStage : "in_progress";
      acc[s] += 1;
    }
    return acc;
  }, [projects]);

  const chartData = useMemo(
    () =>
      STAGES.map((key) => ({
        key,
        name: t(`dashboard.stage.${key}`),
        count: stageCounts[key],
        fill: STAGE_META[key].fill,
      })),
    [stageCounts, t],
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {t("dashboard.title")}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link to="/projects" className="w-full sm:w-auto">
            <Button type="button" className="w-full sm:w-auto">
              <FolderKanban className="h-4 w-4" />
              {t("dashboard.browseProjects")}
            </Button>
          </Link>
          <Link to="/reports" className="w-full sm:w-auto">
            <Button variant="secondary" type="button" className="w-full sm:w-auto">
              <FileBarChart className="h-4 w-4" />
              {t("dashboard.reportsLink")}
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl bg-red-50/80 p-4 text-sm text-red-700 ring-1 ring-red-200/60">
          {error}
        </div>
      ) : null}

      {!loading && projects.length === 0 ? (
        <Card className="border-dashed border-slate-200/80 bg-gradient-to-br from-white to-teal-50/20 text-center ring-0">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 ring-1 ring-teal-100/80">
            <FolderKanban className="h-7 w-7 text-teal-600" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">{t("dashboard.emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t("dashboard.emptyBody")}</p>
          <Link to="/projects" className="mt-7 inline-block">
            <Button type="button">
              <FolderKanban className="h-4 w-4" />
              {t("dashboard.browseProjects")}
            </Button>
          </Link>
        </Card>
      ) : null}

      {!loading && projects.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {STAGES.map((key) => {
              const Icon = STAGE_META[key].icon;
              const count = stageCounts[key];
              return (
                <div
                  key={key}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${STAGE_META[key].bg} p-5 ring-1 ring-slate-200/40 transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
                      style={{ backgroundColor: STAGE_META[key].fill }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-extrabold tabular-nums" style={{ color: STAGE_META[key].fill }}>
                      {count}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    {t(`dashboard.stage.${key}`)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t(`dashboard.stageHint.${key}`)}
                  </p>
                </div>
              );
            })}
          </div>

          <Card className="overflow-hidden ring-1 ring-slate-200/40">
            <CardHeader title={t("dashboard.pipelineTitle")} description={t("dashboard.pipelineSubtitle")} />
            <div className="w-full" style={{ height: 224, minHeight: 224 }}>
              <ResponsiveContainer width="100%" height={224} minWidth={0}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: "#475569" }} interval={0} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "8px 14px", fontSize: 13 }}
                    formatter={(v) => [v, t("dashboard.chartTitle")]}
                    cursor={{ fill: "rgba(13, 148, 136, 0.04)" }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={28}>
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="group relative overflow-hidden rounded-2xl border border-dashed border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-teal-50/20 p-6 transition-all hover:border-teal-200/60 hover:shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-900">{t("dashboard.infoTitle")}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{t("dashboard.infoBody")}</p>
            </div>
            <Link to="/projects" className="mt-4 block shrink-0 sm:mt-0">
              <Button variant="secondary" type="button" className="w-full sm:w-auto">
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                {t("dashboard.manageProjects")}
              </Button>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
