import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileBarChart, RefreshCw } from "lucide-react";
import reportApi from "../../api/report.js";
import { Button } from "../../components/ui/Button.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import "../Project/projectReportEldokan.css";

function errMessage(err, fallback) {
  return err?.response?.data?.error ?? err?.message ?? fallback;
}

export default function AllProjectsReportPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportApi.getPortfolio();
      setData(res);
    } catch (e) {
      setError(errMessage(e, t("report.portfolio.loadError")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Spinner className="h-10 w-10" />
        <p className="text-sm text-slate-600">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="dbforge-report-app">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            <FileBarChart className="h-8 w-8 text-[#1e4d8c]" />
            {t("report.portfolio.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {t("report.portfolio.subtitle")}
          </p>
        </div>
        <Button variant="secondary" type="button" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!data?.projects?.length ? (
        <div className="dbforge-report-ov-card text-sm text-slate-600">{t("report.portfolio.empty")}</div>
      ) : (
        <div className="space-y-8">
          {data.projects.map((row) => (
            <div key={row.project.id} className="dbforge-report-ov-card">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">{row.project.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    /{row.project.slug} · {row.project.visibility} ·{" "}
                    {t(`roles.${row.myRole}`, { defaultValue: row.myRole })}
                  </p>
                </div>
                <Link to={`/projects/${row.project.id}/report`}>
                  <Button type="button" size="sm">
                    {t("report.portfolio.open")}
                  </Button>
                </Link>
              </div>

              <div className="dbforge-report-stat-row !mb-0">
                <div className="dbforge-report-stat">
                  <div className="num">{row.statistics.tables}</div>
                  <div className="lbl">{t("report.project.stats.tables")}</div>
                </div>
                <div className="dbforge-report-stat">
                  <div className="num">{row.statistics.columns}</div>
                  <div className="lbl">{t("report.project.stats.columns")}</div>
                </div>
                <div className="dbforge-report-stat">
                  <div className="num">{row.statistics.relations}</div>
                  <div className="lbl">{t("report.project.stats.relations")}</div>
                </div>
                <div className="dbforge-report-stat">
                  <div className="num">{row.statistics.apiRoutes}</div>
                  <div className="lbl">{t("report.project.stats.apiRoutes")}</div>
                </div>
                <div className="dbforge-report-stat">
                  <div className="num">{row.statistics.members}</div>
                  <div className="lbl">{t("report.project.stats.members")}</div>
                </div>
                <div className="dbforge-report-stat">
                  <div className="num">{row.statistics.tableGroupCount}</div>
                  <div className="lbl">{t("report.project.sections.domains")}</div>
                </div>
              </div>
            </div>
          ))}

          <p className="text-xs text-slate-400">
            {t("report.portfolio.generated")}{" "}
            {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "—"}
          </p>
        </div>
      )}
    </div>
  );
}
