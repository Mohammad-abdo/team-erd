import { useTranslation } from "react-i18next";

/**
 * Shows other users currently connected to the same project room (Socket.io presence).
 */
export function ProjectPresenceBar({ peers, selfName }) {
  const { t } = useTranslation();
  const list = Array.from(peers.values());
  if (list.length === 0) {
    const you = selfName
      ? t("presence.youSuffix", { name: selfName })
      : "";
    return <p className="text-xs text-slate-500">{t("presence.alone", { you })}</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500">{t("presence.alsoHere")}</span>
      {list.map((p) => (
        <span
          key={p.userId}
          className="inline-flex max-w-[10rem] items-center gap-1.5 truncate rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-800 shadow-sm"
          title={p.name}
        >
          {p.avatar ? (
            <img src={p.avatar} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800">
              {p.name?.slice(0, 1)?.toUpperCase() ?? "?"}
            </span>
          )}
          <span className="truncate">{p.name}</span>
        </span>
      ))}
    </div>
  );
}
