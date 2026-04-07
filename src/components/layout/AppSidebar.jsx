import { useEffect, useState } from "react";
import { Link, NavLink, useMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Bell,
  BookOpen,
  Boxes,
  FileBarChart,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MailPlus,
  Menu,
  MessageSquare,
  PenTool,
  Settings2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { getProject } from "../../api/projects.js";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher.jsx";

const itemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-white shadow-sm shadow-teal-900/10 ring-1 ring-white/[0.08]"
      : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
  }`;

const subItemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
    isActive
      ? "bg-teal-500/15 text-teal-300 shadow-sm shadow-teal-900/10 ring-1 ring-teal-400/20"
      : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
  }`;

function ProjectWorkspaceNav({ onItemClick }) {
  const { t } = useTranslation();
  const match = useMatch("/projects/:projectId/*");
  const projectId = match?.params?.projectId;
  const [title, setTitle] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setTitle(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getProject(projectId);
        if (!cancelled) {
          setTitle(data.project?.name ?? t("common.project"));
        }
      } catch {
        if (!cancelled) {
          setTitle(t("common.project"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, t]);

  if (!projectId) {
    return null;
  }

  const base = `/projects/${projectId}`;
  const close = () => onItemClick?.();

  return (
    <div className="mt-6 border-t border-white/[0.06] pt-5">
      <p className="px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">
        {t("nav.thisProject")}
      </p>
      <p className="mt-1.5 truncate px-3 text-sm font-semibold text-white" title={title ?? ""}>
        {title ?? t("common.loading")}
      </p>
      <nav className="mt-3 flex flex-col gap-0.5" onClick={close}>
        <NavLink to={base} end className={subItemClass}>
          <LayoutDashboard className="h-4 w-4 shrink-0 opacity-80" />
          {t("nav.overview")}
        </NavLink>
        <NavLink to={`${base}/whiteboard`} className={subItemClass}>
          <PenTool className="h-4 w-4 shrink-0 opacity-80" />
          {t("nav.whiteboard")}
        </NavLink>
        <NavLink to={`${base}/api`} className={subItemClass}>
          <BookOpen className="h-4 w-4 shrink-0 opacity-80" />
          {t("nav.apiDocs")}
        </NavLink>
        <NavLink to={`${base}/team`} className={subItemClass}>
          <Users className="h-4 w-4 shrink-0 opacity-80" />
          {t("nav.teamInvites")}
        </NavLink>
        <NavLink to={`${base}/comments`} className={subItemClass}>
          <MessageSquare className="h-4 w-4 shrink-0 opacity-80" />
          {t("nav.comments")}
        </NavLink>
        <NavLink to={`${base}/activity`} className={subItemClass}>
          <Activity className="h-4 w-4 shrink-0 opacity-80" />
          {t("nav.activity")}
        </NavLink>
        <NavLink to={`${base}/report`} className={subItemClass}>
          <FileBarChart className="h-4 w-4 shrink-0 opacity-80" />
          {t("nav.projectReport")}
        </NavLink>
        <NavLink to={`${base}/settings`} className={subItemClass}>
          <Settings2 className="h-4 w-4 shrink-0 opacity-80" />
          {t("nav.settings")}
        </NavLink>
      </nav>
    </div>
  );
}

function AppSidebar({ user, onLogout, mobileOpen, onCloseMobile }) {
  const { t } = useTranslation();

  const sidebarInner = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] px-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-900/30">
          <Boxes className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <Link
            to="/"
            className="block truncate text-base font-bold tracking-tight text-white transition-colors hover:text-teal-200"
            onClick={onCloseMobile}
          >
            {t("common.appName")}
          </Link>
          <p className="truncate text-[11px] font-medium text-zinc-500">{t("common.tagline")}</p>
        </div>
        <div className="hidden shrink-0 lg:block">
          <LanguageSwitcher variant="dark" />
        </div>
        <button
          type="button"
          className="ms-auto rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
          onClick={onCloseMobile}
          aria-label={t("nav.closeMenu")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-5">
        <div className="mb-4 flex justify-center px-1 lg:hidden">
          <LanguageSwitcher variant="dark" />
        </div>
        <p className="px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">
          {t("nav.main")}
        </p>
        <nav className="mt-2.5 flex flex-col gap-0.5" onClick={onCloseMobile}>
          <NavLink to="/" end className={itemClass}>
            <LayoutDashboard className="h-4 w-4 shrink-0 opacity-80" />
            {t("nav.dashboard")}
          </NavLink>
          <NavLink to="/projects" end className={itemClass}>
            <FolderKanban className="h-4 w-4 shrink-0 opacity-80" />
            {t("nav.projects")}
          </NavLink>
          <NavLink to="/reports" className={itemClass}>
            <FileBarChart className="h-4 w-4 shrink-0 opacity-80" />
            {t("nav.reports")}
          </NavLink>
          <NavLink to="/invite" className={itemClass}>
            <MailPlus className="h-4 w-4 shrink-0 opacity-80" />
            {t("nav.acceptInvite")}
          </NavLink>
          <NavLink to="/notifications" className={itemClass}>
            <Bell className="h-4 w-4 shrink-0 opacity-80" />
            {t("nav.notifications")}
          </NavLink>
          <NavLink to="/account" className={itemClass}>
            <UserRound className="h-4 w-4 shrink-0 opacity-80" />
            {t("nav.account")}
          </NavLink>
        </nav>

        <ProjectWorkspaceNav onItemClick={onCloseMobile} />
      </div>

      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <div className="mb-2.5 rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-xs">
          <span className="block truncate font-semibold text-zinc-200">{user?.name}</span>
          <span className="mt-0.5 block truncate text-zinc-500">{user?.email}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            onCloseMobile?.();
            onLogout();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-sm font-medium text-zinc-300 transition-all duration-200 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logOut")}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
        onClick={onCloseMobile}
      />

      <aside
        className={`flex w-[min(100vw-3rem,18rem)] shrink-0 flex-col border-e border-white/[0.06] bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out max-lg:fixed max-lg:inset-y-0 max-lg:start-0 max-lg:z-50 max-lg:min-h-dvh lg:static lg:z-auto lg:h-full lg:w-64 xl:w-72 ${
          mobileOpen
            ? "max-lg:translate-x-0"
            : "max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full"
        }`}
      >
        {sidebarInner}
      </aside>
    </>
  );
}

function MobileTopBar({ onOpenMenu }) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200/60 bg-white/70 px-4 shadow-sm shadow-slate-900/[0.02] backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-xl p-2 text-slate-600 transition-all hover:bg-slate-100/80 active:scale-95"
        aria-label={t("nav.openMenu")}
      >
        <Menu className="h-6 w-6" />
      </button>
      <span className="text-lg font-bold tracking-tight text-slate-900">{t("common.appName")}</span>
      <div className="ms-auto">
        <LanguageSwitcher />
      </div>
    </header>
  );
}

export { AppSidebar, MobileTopBar };
