import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  Background,
  BackgroundVariant,
  Controls,
  EdgeLabelRenderer,
  getSmoothStepPath,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  Home,
  Key,
  LayoutPanelLeft,
  Link2,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Save,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import {
  createErdColumn,
  createErdRelation,
  createErdTable,
  deleteErdColumn,
  deleteErdRelation,
  deleteErdTable,
  getErdRelations,
  getErdTables,
  updateErdColumn,
  updateErdTable,
} from "../../api/projects.js";
import { Button } from "../../components/ui/Button.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { TableNode } from "./TableNode.jsx";
import {
  ERD_DATA_TYPE_CUSTOM,
  ERD_DATA_TYPES,
  resolveColumnDataType,
} from "../../constants/erdDataTypes.js";
import { useWhiteboardFocusStore } from "../../store/useWhiteboardFocusStore.js";

/* ─── Relation metadata ─────────────────────────────────────────────────── */
const RELATION_META = {
  ONE_TO_ONE:  { stroke: "#0284c7", label: "1 : 1",  dash: "5 3" },
  ONE_TO_MANY: { stroke: "#0d9488", label: "1 : N",  dash: "7 3" },
  MANY_TO_MANY:{ stroke: "#7c3aed", label: "N : M",  dash: "9 4" },
};
function relMeta(type) { return RELATION_META[type] ?? { stroke: "#94a3b8", label: type, dash: "4 3" }; }

const RELATION_TYPES = [
  { value: "ONE_TO_ONE",   label: "1:1 — One to One"   },
  { value: "ONE_TO_MANY",  label: "1:N — One to Many"  },
  { value: "MANY_TO_MANY", label: "N:M — Many to Many" },
];

/* ─── Arrow polygon helper ───────────────────────────────────────────────
   Draws a filled triangle arrowhead at point (tx,ty) arriving from direction
   given by handle position (the path always arrives axis-aligned).          */
function ArrowHead({ tx, ty, pos, color, size = 10 }) {
  const h = size * 0.5;
  // tip at (tx,ty), base perpendicular, pointing INTO the node
  const pts =
    pos === "left"   ? `${tx},${ty} ${tx+size},${ty-h} ${tx+size},${ty+h}` :
    pos === "right"  ? `${tx},${ty} ${tx-size},${ty-h} ${tx-size},${ty+h}` :
    pos === "top"    ? `${tx},${ty} ${tx-h},${ty+size} ${tx+h},${ty+size}` :
  /* bottom */         `${tx},${ty} ${tx-h},${ty-size} ${tx+h},${ty-size}`;
  return <polygon points={pts} fill={color} stroke="none" />;
}

/* source arrow points AWAY from the node (opposite direction) */
function ArrowTail({ sx, sy, pos, color, size = 8 }) {
  const h = size * 0.5;
  const pts =
    pos === "right"  ? `${sx},${sy} ${sx+size},${sy-h} ${sx+size},${sy+h}` :
    pos === "left"   ? `${sx},${sy} ${sx-size},${sy-h} ${sx-size},${sy+h}` :
    pos === "bottom" ? `${sx},${sy} ${sx-h},${sy+size} ${sx+h},${sy+size}` :
  /* top */            `${sx},${sy} ${sx-h},${sy-size} ${sx+h},${sy-size}`;
  return <polygon points={pts} fill={color} stroke="none" />;
}

/* ─── Custom edge ────────────────────────────────────────────────────────── */
function RelationEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, selected,
}) {
  const color = data?.color ?? "#64748b";
  const dash  = data?.dash  ?? "0";
  const label = data?.label ?? "";
  const sw    = selected ? 3 : 2;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 14,
  });

  return (
    <>
      {/* invisible wider hit area */}
      <path d={edgePath} fill="none" stroke="transparent" strokeWidth={14} />

      {/* edge line — no markers, just stroke */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={dash}
        strokeLinecap="round"
      />

      {/* arrowhead at TARGET — tip at (targetX, targetY) */}
      <ArrowHead tx={targetX} ty={targetY} pos={targetPosition} color={color} size={10} />

      {/* arrowhead at SOURCE — pointing outward */}
      <ArrowTail sx={sourceX} sy={sourceY} pos={sourcePosition} color={color} size={8} />

      {/* label badge */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
              fontSize: 11, fontWeight: 700, color,
              background: "rgba(255,255,255,0.96)",
              border: `1.5px solid ${color}`,
              borderRadius: 5, padding: "1px 7px", lineHeight: 1.6,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = { table: TableNode };
const edgeTypes = { relation: RelationEdge };

/* ─── Auto-fit ──────────────────────────────────────────────────────────── */
function AutoFitView({ tables, projectId }) {
  const { fitView } = useReactFlow();
  const fitted = useRef(false);
  useEffect(() => { fitted.current = false; }, [projectId]);
  useEffect(() => {
    if (!tables.length || fitted.current) return;
    fitted.current = true;
    const id = requestAnimationFrame(() => fitView({ padding: 0.14, duration: 300 }));
    return () => cancelAnimationFrame(id);
  }, [tables, fitView]);
  return null;
}

function layoutGrid(i) {
  return { x: 60 + (i % 5) * 280, y: 60 + Math.floor(i / 5) * 340 };
}

function resolveHandles(rel, tableById) {
  const fromT = tableById.get(rel.fromTableId);
  const toT   = tableById.get(rel.toTableId);
  const fromOk = !!rel.fromColumnId && fromT?.columns?.some(c => c.id === rel.fromColumnId);
  const toOk   = !!rel.toColumnId   && toT?.columns?.some(c => c.id === rel.toColumnId);
  return {
    sourceHandle: fromOk ? `out-${rel.fromColumnId}` : "table-out",
    targetHandle: toOk   ? `in-${rel.toColumnId}`    : "table-in",
  };
}

/* ─── Collapsible sidebar section ───────────────────────────────────────── */
function Section({ title, icon: Icon, count, open: defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
      >
        {open
          ? <ChevronDown  className="h-3.5 w-3.5 text-slate-400" />
          : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
        {Icon && <Icon className="h-4 w-4 text-teal-600" />}
        <span className="flex-1 text-start">{title}</span>
        {count != null && (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
            {count}
          </span>
        )}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </section>
  );
}

/* ─── Light form primitives ─────────────────────────────────────────────── */
const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm";
const selectCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-sm";

/* ─── Canvas ────────────────────────────────────────────────────────────── */
function ErdCanvas({ projectId, canEdit, tables, relations, setTables, selectedTableId, setSelectedTableId, onError }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const selRef = useRef(selectedTableId);
  selRef.current = selectedTableId;

  /* sync nodes */
  useEffect(() => {
    setNodes(cur => {
      const posById = new Map(cur.map(n => [n.id, n.position]));
      return tables.map((t, i) => ({
        id: t.id, type: "table",
        position: posById.get(t.id) ?? { x: t.x || layoutGrid(i).x, y: t.y || layoutGrid(i).y },
        data: { table: t, projectId },
        selected: selRef.current != null && t.id === selRef.current,
      }));
    });
  }, [tables, setNodes, projectId]);

  useEffect(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: selectedTableId != null && n.id === selectedTableId })));
  }, [selectedTableId, setNodes]);

  /* sync edges */
  useEffect(() => {
    const tById = new Map(tables.map(t => [t.id, t]));
    setEdges(relations.map(r => {
      const m = relMeta(r.relationType);
      const { sourceHandle, targetHandle } = resolveHandles(r, tById);
      return {
        id: r.id,
        source: r.fromTableId,
        target: r.toTableId,
        sourceHandle,
        targetHandle,
        type: "relation",
        data: { color: m.stroke, dash: m.dash, label: m.label },
        zIndex: 10,
      };
    }));
  }, [relations, tables, setEdges]);

  const onNodeDragStop = useCallback(async (_e, node) => {
    if (!canEdit) return;
    onError("");
    try {
      await updateErdTable(projectId, node.id, { x: node.position.x, y: node.position.y });
      setTables(p => p.map(t => t.id === node.id ? { ...t, x: node.position.x, y: node.position.y } : t));
    } catch (e) { onError(e.response?.data?.error ?? "Could not save position"); }
  }, [canEdit, projectId, setTables, onError]);

  const onSelectionChange = useCallback(({ nodes: sel }) => setSelectedTableId(sel[0]?.id ?? null), [setSelectedTableId]);
  const onNodeClick = useCallback((_e, node) => setSelectedTableId(node.id), [setSelectedTableId]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={onNodeDragStop}
      onNodeClick={onNodeClick}
      onSelectionChange={onSelectionChange}
      onPaneClick={() => setSelectedTableId(null)}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      elevateEdgesOnSelect
      proOptions={{ hideAttribution: true }}
      colorMode="light"
      nodesDraggable={canEdit}
      nodesConnectable={false}
      elementsSelectable
      deleteKeyCode={canEdit ? ["Backspace", "Delete"] : null}
      style={{ width: "100%", height: "100%", background: "#f1f5f9" }}
    >
      {/* ── Background: subtle dot grid ── */}
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1.5}
        color="#cbd5e1"
        style={{ backgroundColor: "#f1f5f9" }}
      />

      {/* ── Controls ── */}
      <Controls
        style={{ margin: 12 }}
        className="!rounded-xl !border-slate-200 !bg-white !shadow-lg [&_button]:!rounded-lg [&_button]:!border-slate-200 [&_button]:!bg-white [&_button]:!text-slate-600 [&_button:hover]:!bg-slate-50 [&_button:hover]:!text-slate-900"
      />

      {/* ── MiniMap ── */}
      <MiniMap
        style={{ margin: 12, borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc" }}
        nodeColor={() => "#0d9488"}
        maskColor="rgba(241,245,249,0.85)"
      />

      <AutoFitView tables={tables} projectId={projectId} />
    </ReactFlow>
  );
}

/* ─── Inline table editor component ────────────────────────────────────── */
function TableListWithInlineEditor({
  tables, selectedTableId, selectedTable, setSelectedTableId, canEdit,
  editName, setEditName, editLabel, setEditLabel, editColor, setEditColor, editDesc, setEditDesc,
  tableSaveBusy, onSaveTableMeta, onDeleteTable,
  colName, setColName, colTypePick, setColTypePick, colTypeCustom, setColTypeCustom,
  colPk, setColPk, colFk, setColFk, colNull, setColNull, colUniq, setColUniq,
  colBusy, onAddColumn, toggleColFlag, onRemoveColumn,
  inputCls, selectCls,
}) {
  return (
    <ul className="space-y-0.5">
      {tables.map(t => (
        <li key={t.id}>
          <button
            type="button"
            onClick={() => setSelectedTableId(t.id === selectedTableId ? null : t.id)}
            className={`w-full rounded-xl px-3 py-2 text-start text-sm transition-all flex items-center justify-between gap-2 ${
              t.id === selectedTableId
                ? "bg-teal-50 text-teal-700 ring-1 ring-teal-300"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="min-w-0 flex-1 truncate">
              <span className="font-mono font-medium">{t.name}</span>
              <span className="ml-2 text-[10px] text-slate-400">· {t.columns?.length ?? 0} cols</span>
            </span>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${t.id === selectedTableId ? "rotate-180 text-teal-500" : "text-slate-300"}`} />
          </button>

          {t.id === selectedTableId && selectedTable && (
            <div className="mx-1 mb-2 mt-0.5 rounded-xl border border-teal-200 bg-white p-3 space-y-3 shadow-sm">
              {canEdit ? (
                <form className="space-y-2" onSubmit={onSaveTableMeta}>
                  <input className={inputCls} placeholder="Physical name" value={editName} onChange={e => setEditName(e.target.value)} required />
                  <input className={inputCls} placeholder="Display label (optional)" value={editLabel} onChange={e => setEditLabel(e.target.value)} />
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-500">Color</label>
                    <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="h-7 w-10 cursor-pointer rounded border border-slate-200" />
                    <span className="font-mono text-[10px] text-slate-400">{editColor}</span>
                  </div>
                  <textarea className={inputCls} rows={2} placeholder="Description…" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={tableSaveBusy}><Save className="h-3 w-3" />{tableSaveBusy ? "Saving…" : "Save"}</Button>
                    <Button type="button" variant="danger" size="sm" onClick={onDeleteTable}><Trash2 className="h-3 w-3" />Delete</Button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-slate-500 font-mono">{selectedTable.name}</p>
              )}

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                  <Key className="h-3 w-3 text-teal-500" />
                  Columns
                  <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{selectedTable.columns?.length ?? 0}</span>
                </p>
                {canEdit && (
                  <form className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 mb-2" onSubmit={onAddColumn}>
                    <input className={inputCls} placeholder="Column name" value={colName} onChange={e => setColName(e.target.value)} required />
                    <select className={selectCls} value={colTypePick} onChange={e => setColTypePick(e.target.value)}>
                      {ERD_DATA_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    {colTypePick === ERD_DATA_TYPE_CUSTOM && (
                      <input className={inputCls} placeholder="Custom type" value={colTypeCustom} onChange={e => setColTypeCustom(e.target.value)} required />
                    )}
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
                      {[["PK", colPk, setColPk], ["FK", colFk, setColFk], ["Nullable", colNull, setColNull], ["Unique", colUniq, setColUniq]].map(([lbl, val, set]) => (
                        <label key={lbl} className="flex cursor-pointer items-center gap-1.5">
                          <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="rounded border-slate-300 text-teal-500" />
                          {lbl}
                        </label>
                      ))}
                    </div>
                    <Button type="submit" size="sm" className="w-full" disabled={colBusy}>
                      <Plus className="h-3.5 w-3.5" />{colBusy ? "Adding…" : "Add column"}
                    </Button>
                  </form>
                )}
                <ul className="space-y-0.5">
                  {(selectedTable.columns ?? []).map(c => (
                    <li key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-xs">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          {c.isPk && <span className="rounded px-1 py-0.5 text-[8px] font-bold text-amber-700 bg-amber-50 ring-1 ring-amber-200">PK</span>}
                          {c.isFk && <span className="rounded px-1 py-0.5 text-[8px] font-bold text-sky-700 bg-sky-50 ring-1 ring-sky-200">FK</span>}
                          <span className="truncate font-mono text-slate-700">{c.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{c.dataType}</span>
                      </div>
                      {canEdit && (
                        <div className="flex shrink-0 items-center gap-1">
                          {[["PK", c.isPk, "isPk"], ["FK", c.isFk, "isFk"], ["N", c.isNullable, "isNullable"]].map(([lbl, val, key]) => (
                            <button key={key} type="button"
                              onClick={() => toggleColFlag(c, { [key]: !val })}
                              className={`rounded px-1 py-0.5 text-[9px] font-bold transition-colors ${val ? "bg-teal-100 text-teal-700" : "text-slate-300 hover:text-slate-500"}`}>
                              {lbl}
                            </button>
                          ))}
                          <button type="button" onClick={() => onRemoveColumn(c.id)} className="ml-0.5 rounded p-0.5 text-slate-300 hover:bg-red-50 hover:text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────── */
export default function ErdPage() {
  const { projectId } = useParams();
  const { project } = useOutletContext();
  const [tables,    setTables]    = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [selectedTableId, setSelectedTableId] = useState(null);

  const [newTableName, setNewTableName] = useState("");
  const [creatingTable, setCreatingTable] = useState(false);

  const [colName,       setColName]       = useState("");
  const [colTypePick,   setColTypePick]   = useState("varchar(255)");
  const [colTypeCustom, setColTypeCustom] = useState("");
  const [colPk,   setColPk]   = useState(false);
  const [colFk,   setColFk]   = useState(false);
  const [colNull, setColNull] = useState(true);
  const [colUniq, setColUniq] = useState(false);
  const [colDesc, setColDesc] = useState("");
  const [colBusy, setColBusy] = useState(false);

  const [relFrom,    setRelFrom]    = useState("");
  const [relTo,      setRelTo]      = useState("");
  const [relType,    setRelType]    = useState("ONE_TO_MANY");
  const [relFromCol, setRelFromCol] = useState("");
  const [relToCol,   setRelToCol]   = useState("");
  const [relBusy,    setRelBusy]    = useState(false);

  const [tableSaveBusy, setTableSaveBusy] = useState(false);
  const [editName,  setEditName]  = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("#0d9488");
  const [editDesc,  setEditDesc]  = useState("");
  const [panelOpen, setPanelOpen] = useState(true);

  const canEdit = project?.myRole === "LEADER" || project?.myRole === "EDITOR";
  const selectedTable = tables.find(t => t.id === selectedTableId) ?? null;

  const whiteboardFocus = useWhiteboardFocusStore(s => s.focus);
  const setWhiteboardFocus = useWhiteboardFocusStore(s => s.setFocus);

  /* ── Load ── */
  const load = useCallback(async () => {
    setError("");
    try {
      const [tRes, rRes] = await Promise.all([getErdTables(projectId), getErdRelations(projectId)]);
      setTables(tRes.data.tables ?? []);
      setRelations(rRes.data.relations ?? []);
    } catch (e) { setError(e.response?.data?.error ?? "Failed to load ERD"); }
  }, [projectId]);

  useEffect(() => {
    let t;
    const h = e => { if (e.detail?.projectId !== projectId) return; clearTimeout(t); t = setTimeout(load, 450); };
    window.addEventListener("dbforge:erd-updated", h);
    return () => { window.removeEventListener("dbforge:erd-updated", h); clearTimeout(t); };
  }, [projectId, load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setSelectedTableId(null); setTables([]); setRelations([]); setError("");
      try {
        const [tRes, rRes] = await Promise.all([getErdTables(projectId), getErdRelations(projectId)]);
        if (!cancelled) { setTables(tRes.data.tables ?? []); setRelations(rRes.data.relations ?? []); }
      } catch (e) { if (!cancelled) setError(e.response?.data?.error ?? "Failed to load ERD"); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  useEffect(() => {
    if (selectedTable) {
      setEditName(selectedTable.name ?? "");
      setEditLabel(selectedTable.label ?? "");
      setEditColor(selectedTable.color || "#0d9488");
      setEditDesc(selectedTable.description ?? "");
    }
  }, [selectedTable]);

  useEffect(() => {
    if (tables.length && !relFrom && !relTo) {
      setRelFrom(tables[0].id);
      setRelTo(tables.length > 1 ? tables[1].id : tables[0].id);
    }
  }, [tables, relFrom, relTo]);

  const fromCols = useMemo(() => tables.find(x => x.id === relFrom)?.columns ?? [], [tables, relFrom]);
  const toCols   = useMemo(() => tables.find(x => x.id === relTo)?.columns   ?? [], [tables, relTo]);

  /* ── Actions ── */
  async function onCreateTable(e) {
    e.preventDefault();
    if (!newTableName.trim() || !canEdit) return;
    setCreatingTable(true); setError("");
    const pos = layoutGrid(tables.length);
    try {
      const { data } = await createErdTable(projectId, { name: newTableName.trim(), x: pos.x, y: pos.y });
      setNewTableName(""); await load(); setSelectedTableId(data.table?.id ?? null);
    } catch (err) { setError(err.response?.data?.error ?? "Could not create table"); }
    finally { setCreatingTable(false); }
  }

  async function onSaveTableMeta(e) {
    e.preventDefault();
    if (!selectedTable || !canEdit) return;
    setTableSaveBusy(true); setError("");
    try {
      await updateErdTable(projectId, selectedTable.id, {
        name: editName.trim(),
        label: editLabel.trim() || null,
        color: editColor,
        description: editDesc.trim() || null,
      });
      await load();
    } catch (err) { setError(err.response?.data?.error ?? "Could not update table"); }
    finally { setTableSaveBusy(false); }
  }

  async function onDeleteTable() {
    if (!selectedTable || !canEdit) return;
    if (!window.confirm(`Delete table "${selectedTable.name}" and all its columns?`)) return;
    setError("");
    try { await deleteErdTable(projectId, selectedTable.id); setSelectedTableId(null); await load(); }
    catch (err) { setError(err.response?.data?.error ?? "Could not delete table"); }
  }

  async function onAddColumn(e) {
    e.preventDefault();
    if (!selectedTable || !colName.trim() || !canEdit) return;
    const dataType = resolveColumnDataType(colTypePick, colTypeCustom);
    if (!dataType) { setError("Pick a data type or enter a custom one."); return; }
    setColBusy(true); setError("");
    try {
      await createErdColumn(projectId, selectedTable.id, {
        name: colName.trim(), dataType,
        isPk: colPk, isFk: colFk, isNullable: colNull, isUnique: colUniq,
        description: colDesc.trim() || undefined,
        sortOrder: selectedTable.columns?.length ?? 0,
      });
      setColName(""); setColTypePick("varchar(255)"); setColTypeCustom("");
      setColPk(false); setColFk(false); setColNull(true); setColUniq(false); setColDesc("");
      await load();
    } catch (err) { setError(err.response?.data?.error ?? "Could not add column"); }
    finally { setColBusy(false); }
  }

  async function toggleColFlag(col, patch) {
    if (!selectedTable || !canEdit) return;
    try { await updateErdColumn(projectId, selectedTable.id, col.id, patch); await load(); }
    catch (err) { setError(err.response?.data?.error ?? "Could not update column"); }
  }

  async function onRemoveColumn(colId) {
    if (!selectedTable || !canEdit) return;
    if (!window.confirm("Remove this column?")) return;
    try { await deleteErdColumn(projectId, selectedTable.id, colId); await load(); }
    catch (err) { setError(err.response?.data?.error ?? "Could not remove column"); }
  }

  async function onCreateRelation(e) {
    e.preventDefault();
    if (!relFrom || !relTo || !canEdit) return;
    setRelBusy(true); setError("");
    try {
      await createErdRelation(projectId, {
        fromTableId: relFrom, toTableId: relTo, relationType: relType,
        fromColumnId: relFromCol || null, toColumnId: relToCol || null,
      });
      setRelFromCol(""); setRelToCol(""); await load();
    } catch (err) { setError(err.response?.data?.error ?? "Could not create relation"); }
    finally { setRelBusy(false); }
  }

  async function onDeleteRelation(id) {
    if (!canEdit || !window.confirm("Remove this relation?")) return;
    try { await deleteErdRelation(projectId, id); await load(); }
    catch (err) { setError(err.response?.data?.error ?? "Could not remove relation"); }
  }

  /* ── Render ── */
  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center" style={{ background: "#0c0c0f" }}>
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ background: "#f8fafc" }}>

      {/* ── Top bar ── */}
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800">
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <Link to={`/projects/${projectId}`} className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800">
          {project?.name ?? "Project"}
        </Link>
        <span className="flex-1" />

        {/* Legend */}
        <div className="hidden items-center gap-3 sm:flex">
          {Object.entries(RELATION_META).map(([type, m]) => (
            <span key={type} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: m.stroke }}>
              <span className="inline-block h-0.5 w-5 rounded-full" style={{ background: m.stroke }} />
              {m.label}
            </span>
          ))}
        </div>

        <button type="button" onClick={() => setWhiteboardFocus(!whiteboardFocus)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
          {whiteboardFocus
            ? <><PanelLeftOpen className="h-4 w-4" /><span className="hidden sm:inline">Show menu</span></>
            : <><Maximize2    className="h-4 w-4" /><span className="hidden sm:inline">Focus</span></>}
        </button>
        <button type="button" onClick={() => setPanelOpen(o => !o)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
          {panelOpen
            ? <><PanelLeftClose className="h-4 w-4" /><span className="hidden sm:inline">Hide panel</span></>
            : <><PanelLeftOpen  className="h-4 w-4" /><span className="hidden sm:inline">Schema</span></>}
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

        {/* ── Left panel ── */}
        {panelOpen && (
          <aside className="flex max-h-[48vh] w-full shrink-0 flex-col border-b border-slate-200 bg-white shadow-md lg:max-h-none lg:w-[360px] lg:border-e lg:border-b-0">
            {/* Panel header */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
                <LayoutPanelLeft className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">Schema</p>
                <p className="truncate text-[11px] text-slate-400">{project?.name}</p>
              </div>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-red-200">{error}</div>}

              {/* New table */}
              {canEdit ? (
                <Section title="New Table" icon={Plus}>
                  <form className="space-y-2" onSubmit={onCreateTable}>
                    <div className="relative">
                      <Table2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input className={`${inputCls} pl-9`} placeholder="e.g. users" value={newTableName} onChange={e => setNewTableName(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" size="sm" disabled={creatingTable}>
                      {creatingTable ? "Creating…" : "Add to canvas"}
                    </Button>
                  </form>
                </Section>
              ) : (
                <p className="text-xs text-slate-400">View-only. Ask an editor to modify the schema.</p>
              )}

              {/* Table list — properties expand inline under each table */}
              <Section title="Tables" icon={Table2} count={tables.length}>
                <TableListWithInlineEditor
                  tables={tables}
                  selectedTableId={selectedTableId}
                  selectedTable={selectedTable}
                  setSelectedTableId={setSelectedTableId}
                  canEdit={canEdit}
                  editName={editName} setEditName={setEditName}
                  editLabel={editLabel} setEditLabel={setEditLabel}
                  editColor={editColor} setEditColor={setEditColor}
                  editDesc={editDesc} setEditDesc={setEditDesc}
                  tableSaveBusy={tableSaveBusy}
                  onSaveTableMeta={onSaveTableMeta}
                  onDeleteTable={onDeleteTable}
                  colName={colName} setColName={setColName}
                  colTypePick={colTypePick} setColTypePick={setColTypePick}
                  colTypeCustom={colTypeCustom} setColTypeCustom={setColTypeCustom}
                  colPk={colPk} setColPk={setColPk}
                  colFk={colFk} setColFk={setColFk}
                  colNull={colNull} setColNull={setColNull}
                  colUniq={colUniq} setColUniq={setColUniq}
                  colBusy={colBusy}
                  onAddColumn={onAddColumn}
                  toggleColFlag={toggleColFlag}
                  onRemoveColumn={onRemoveColumn}
                  inputCls={inputCls} selectCls={selectCls}
                />
              </Section>

              {/* Relations */}
              <Section title="Relations" icon={GitBranch} count={relations.length} open={false}>
                {canEdit && tables.length >= 2 && (
                  <form className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 mb-2" onSubmit={onCreateRelation}>
                    <select className={selectCls} value={relFrom} onChange={e => setRelFrom(e.target.value)}>
                      {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <div className="flex items-center justify-center"><Link2 className="h-4 w-4 text-slate-400" /></div>
                    <select className={selectCls} value={relTo} onChange={e => setRelTo(e.target.value)}>
                      {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select className={selectCls} value={relType} onChange={e => setRelType(e.target.value)}>
                      {RELATION_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <select className={selectCls} value={relFromCol} onChange={e => setRelFromCol(e.target.value)}>
                        <option value="">From col —</option>
                        {fromCols.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <select className={selectCls} value={relToCol} onChange={e => setRelToCol(e.target.value)}>
                        <option value="">To col —</option>
                        {toCols.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <Button type="submit" size="sm" className="w-full" disabled={relBusy}>
                      <GitBranch className="h-3.5 w-3.5" />{relBusy ? "Adding…" : "Add relation"}
                    </Button>
                  </form>
                )}
                {canEdit && tables.length < 2 && (
                  <p className="text-xs text-slate-400">Create at least two tables first.</p>
                )}
                <ul className="space-y-1">
                  {relations.map(r => {
                    const from = tables.find(t => t.id === r.fromTableId);
                    const to   = tables.find(t => t.id === r.toTableId);
                    const m    = relMeta(r.relationType);
                    return (
                      <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
                        <span className="text-slate-700">
                          <span className="font-mono">{from?.name ?? "?"}</span>
                          <span className="mx-1.5" style={{ color: m.stroke }}>→</span>
                          <span className="font-mono">{to?.name ?? "?"}</span>
                          <span className="ml-2 rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: `${m.stroke}18`, color: m.stroke }}>{m.label}</span>
                        </span>
                        {canEdit && (
                          <button type="button" onClick={() => onDeleteRelation(r.id)} className="rounded p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Section>
            </div>
          </aside>
        )}

        {/* ── Canvas area ── */}
        <div className="relative min-h-[min(55vh,560px)] flex-1 lg:min-h-0" style={{ background: "#f1f5f9" }}>
          {!panelOpen && (
            <button type="button" onClick={() => setPanelOpen(true)}
              className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-md hover:bg-slate-50">
              <PanelLeftOpen className="h-4 w-4" />Schema
            </button>
          )}
          <ReactFlowProvider>
            <ErdCanvas
              projectId={projectId}
              canEdit={canEdit}
              tables={tables}
              relations={relations}
              setTables={setTables}
              selectedTableId={selectedTableId}
              setSelectedTableId={setSelectedTableId}
              onError={setError}
            />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
