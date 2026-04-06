import { Handle, Position } from "@xyflow/react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

function accent(color) {
  return color && /^#[0-9A-Fa-f]{6}$/.test(color.trim()) ? color.trim() : "#0d9488";
}

function rgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function TableNode({ data, selected }) {
  const t = data.table;
  const pid = data.projectId;
  const ac = accent(t.color);
  const cols = t.columns ?? [];
  const pkCount = cols.filter(c => c.isPk).length;
  const fkCount = cols.filter(c => c.isFk).length;

  return (
    <div style={{
      width: 260,
      borderRadius: 12,
      background: "#ffffff",
      border: selected ? `2px solid ${ac}` : "1.5px solid #e2e8f0",
      boxShadow: selected
        ? `0 0 0 3px ${rgba(ac, 0.18)}, 0 8px 32px rgba(0,0,0,0.13)`
        : "0 2px 12px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.06)",
      transition: "box-shadow 0.2s, border-color 0.2s",
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "visible",
    }}>

      {/* Table-level handles */}
      <Handle id="table-in" type="target" position={Position.Left}
        style={{ width: 12, height: 12, borderRadius: "50%", background: ac, border: "2.5px solid #fff", top: "50%", left: -6, boxShadow: `0 0 0 2px ${rgba(ac,0.25)}` }} />
      <Handle id="table-out" type="source" position={Position.Right}
        style={{ width: 12, height: 12, borderRadius: "50%", background: ac, border: "2.5px solid #fff", top: "50%", right: -6, boxShadow: `0 0 0 2px ${rgba(ac,0.25)}` }} />

      {/* ── Header ── */}
      <div style={{
        borderRadius: "11px 11px 0 0",
        background: rgba(ac, 0.07),
        borderBottom: `2px solid ${ac}`,
        padding: "12px 14px 9px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: ac,
          borderRadius: "11px 11px 0 0",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: ac, flexShrink: 0 }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {t.label || t.name}
            </p>
            {t.label && (
              <p style={{ margin: 0, fontSize: 10, color: "#64748b", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</p>
            )}
          </div>
        </div>

        {/* stats */}
        <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: rgba(ac, 0.12), color: ac }}>
            {cols.length} cols
          </span>
          {pkCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "#fef3c7", color: "#92400e" }}>
              {pkCount} PK
            </span>
          )}
          {fkCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "#e0f2fe", color: "#0369a1" }}>
              {fkCount} FK
            </span>
          )}
        </div>
      </div>

      {/* ── Columns ── */}
      {cols.length > 0 ? (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {cols.map((c, ci) => (
            <li key={c.id} style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px 5px 14px",
              background: ci % 2 === 1 ? "#f8fafc" : "#ffffff",
              borderBottom: ci < cols.length - 1 ? "1px solid #f1f5f9" : "none",
            }}>
              {/* left handle */}
              <Handle id={`in-${c.id}`} type="target" position={Position.Left} isConnectable={false}
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: c.isFk ? "#0284c7" : "#cbd5e1",
                  border: `1.5px solid ${c.isFk ? "#7dd3fc" : "#e2e8f0"}`,
                  left: -3.5, top: "50%", transform: "translateY(-50%)",
                }} />

              {/* PK / FK badges */}
              {(c.isPk || c.isFk) && (
                <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                  {c.isPk && <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>PK</span>}
                  {c.isFk && <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>FK</span>}
                </div>
              )}

              {/* name */}
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: c.isPk ? "#92400e" : "#1e293b" }}>
                {c.name}
              </span>

              {/* type */}
              <span style={{ flexShrink: 0, fontFamily: "monospace", fontSize: 10, color: "#94a3b8", marginLeft: 4 }}>
                {c.dataType}
              </span>

              {/* NN / UQ flags */}
              {(!c.isNullable || c.isUnique) && (
                <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                  {!c.isNullable && <span style={{ fontSize: 8, fontWeight: 700, color: "#ef4444" }}>NN</span>}
                  {c.isUnique   && <span style={{ fontSize: 8, fontWeight: 700, color: "#8b5cf6" }}>UQ</span>}
                </div>
              )}

              {/* right handle */}
              <Handle id={`out-${c.id}`} type="source" position={Position.Right} isConnectable={false}
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: c.isFk ? "#0284c7" : "#cbd5e1",
                  border: `1.5px solid ${c.isFk ? "#7dd3fc" : "#e2e8f0"}`,
                  right: -3.5, top: "50%", transform: "translateY(-50%)",
                }} />
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ padding: "14px", textAlign: "center", color: "#94a3b8", fontSize: 11 }}>
          No columns yet
        </div>
      )}

      {/* ── Footer ── */}
      {pid && (
        <div style={{ borderTop: "1px solid #f1f5f9", borderRadius: "0 0 11px 11px" }}>
          <Link
            to={`/projects/${pid}/comments?table=${encodeURIComponent(t.id)}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "6px 14px", fontSize: 11, fontWeight: 500,
              color: "#94a3b8", textDecoration: "none",
              borderRadius: "0 0 11px 11px",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = rgba(ac, 0.07); e.currentTarget.style.color = ac; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            <MessageSquare style={{ width: 11, height: 11 }} />
            Discuss
          </Link>
        </div>
      )}
    </div>
  );
}
