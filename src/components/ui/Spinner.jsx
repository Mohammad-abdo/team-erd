export function Spinner({ className = "h-5 w-5" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-[2.5px] border-slate-200 border-t-teal-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
