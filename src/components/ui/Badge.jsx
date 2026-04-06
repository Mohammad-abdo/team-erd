const styles = {
  default: "bg-slate-100/80 text-slate-700 ring-slate-200/60",
  success: "bg-emerald-50/80 text-emerald-800 ring-emerald-200/60",
  warn: "bg-amber-50/80 text-amber-900 ring-amber-200/60",
  muted: "bg-slate-50/80 text-slate-500 ring-slate-200/50",
  info: "bg-sky-50/80 text-sky-800 ring-sky-200/60",
  danger: "bg-red-50/80 text-red-800 ring-red-200/60",
};

export function Badge({ children, tone = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ring-inset backdrop-blur-sm ${styles[tone] ?? styles.default} ${className}`}
    >
      {children}
    </span>
  );
}
