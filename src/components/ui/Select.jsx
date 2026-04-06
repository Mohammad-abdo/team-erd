export function Select({ id, label, error, children, className = "", ...props }) {
  return (
    <div className="block space-y-1.5">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={`w-full rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-900/[0.02] backdrop-blur-sm outline-none transition-all duration-200 hover:border-slate-300/80 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/15 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
