const variants = {
  primary:
    "bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/25 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none",
  secondary:
    "border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm hover:bg-slate-50 hover:border-slate-300/80 hover:text-slate-900 active:scale-[0.98] disabled:opacity-50",
  ghost:
    "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:scale-[0.98] disabled:opacity-50",
  danger:
    "bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/25 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-sm rounded-xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    />
  );
}
