export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-sm shadow-slate-900/[0.03] backdrop-blur-md transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
