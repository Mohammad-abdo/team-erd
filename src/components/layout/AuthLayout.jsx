import { Link, Outlet } from "react-router-dom";
import { Boxes } from "lucide-react";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher.jsx";

export function AuthLayout() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 100% -10%, rgba(13, 148, 136, 0.12), transparent 55%), radial-gradient(ellipse 80% 50% at 0% 100%, rgba(99, 102, 241, 0.07), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(6, 182, 212, 0.05), transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />

      <div className="absolute end-4 top-4 z-10 sm:end-6 sm:top-6">
        <LanguageSwitcher />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <Link
          to="/"
          className="group mb-10 flex items-center justify-center gap-3 text-slate-900 transition-opacity hover:opacity-90"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-xl shadow-teal-600/25 transition-transform duration-300 group-hover:scale-105">
            <Boxes className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">DBForge</span>
        </Link>
        <div className="animate-slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
