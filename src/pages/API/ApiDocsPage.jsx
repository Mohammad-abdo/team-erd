import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Download,
  Edit3,
  FileJson,
  FolderPlus,
  Globe,
  Loader2,
  Lock,
  MessageSquare,
  Minus,
  Play,
  Plus,
  Save,
  Send,
  Settings2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  createApiGroup,
  createApiParameter,
  createApiResponse,
  createApiRoute,
  deleteApiGroup,
  deleteApiParameter,
  deleteApiResponse,
  deleteApiRoute,
  exportPostman,
  exportSwagger,
  getApiGroups,
  getApiTestSettings,
  importPostman,
  importSwagger,
  saveApiTestSettings,
  updateApiGroup,
  updateApiParameter,
  updateApiResponse,
  updateApiRoute,
} from "../../api/projects.js";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Button } from "../../components/ui/Button.jsx";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const PARAM_LOCATIONS = ["QUERY", "HEADER", "PATH", "BODY"];
const STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 422, 500];

const METHOD_COLORS = {
  GET: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", ring: "ring-emerald-500/20", fill: "#10b981" },
  POST: { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/30", ring: "ring-sky-500/20", fill: "#0ea5e9" },
  PUT: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", ring: "ring-amber-500/20", fill: "#f59e0b" },
  PATCH: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/30", ring: "ring-violet-500/20", fill: "#8b5cf6" },
  DELETE: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", ring: "ring-red-500/20", fill: "#ef4444" },
};

function methodColor(m) { return METHOD_COLORS[m] ?? METHOD_COLORS.GET; }

function statusColor(code) {
  if (code >= 200 && code < 300) return "text-emerald-400 bg-emerald-500/10";
  if (code >= 300 && code < 400) return "text-sky-400 bg-sky-500/10";
  if (code >= 400 && code < 500) return "text-amber-400 bg-amber-500/10";
  return "text-red-400 bg-red-500/10";
}

function DarkInput({ className = "", ...props }) {
  return <input className={`w-full rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 ${className}`} {...props} />;
}

function DarkTextarea({ className = "", ...props }) {
  return <textarea className={`w-full rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 ${className}`} {...props} />;
}

function DarkSelect({ children, className = "", ...props }) {
  return <select className={`rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none transition-all focus:border-teal-500/50 ${className}`} {...props}>{children}</select>;
}

function IconBtn({ children, className = "", danger, ...props }) {
  return (
    <button type="button" className={`rounded-lg p-1.5 transition-colors ${danger ? "text-zinc-500 hover:bg-red-500/10 hover:text-red-400" : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"} ${className}`} {...props}>{children}</button>
  );
}

function ParameterRow({ param, canEdit, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...param });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try { await onUpdate(param.id, form); setEditing(false); } catch {}
    finally { setBusy(false); }
  }

  if (editing) {
    return (
      <tr className="border-b border-zinc-800/60">
        <td className="px-3 py-2"><DarkSelect value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full">{PARAM_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}</DarkSelect></td>
        <td className="px-3 py-2"><DarkInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="name" /></td>
        <td className="px-3 py-2"><DarkInput value={form.dataType} onChange={(e) => setForm({ ...form, dataType: e.target.value })} placeholder="string" /></td>
        <td className="px-3 py-2 text-center"><input type="checkbox" checked={form.isRequired ?? false} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} /></td>
        <td className="px-3 py-2">
          <div className="flex gap-1">
            <IconBtn onClick={save} disabled={busy}><Check className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn onClick={() => setEditing(false)}><X className="h-3.5 w-3.5" /></IconBtn>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-zinc-800/60 text-xs">
      <td className="px-3 py-2"><span className="rounded bg-zinc-700/50 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400">{param.location}</span></td>
      <td className="px-3 py-2 font-mono text-zinc-200">{param.name}{param.isRequired ? <span className="ms-1 text-red-400">*</span> : null}</td>
      <td className="px-3 py-2 text-zinc-400">{param.dataType}</td>
      <td className="px-3 py-2 text-zinc-500">{param.description || "\u2014"}</td>
      {canEdit ? <td className="px-3 py-2"><div className="flex gap-0.5"><IconBtn onClick={() => { setForm({ ...param }); setEditing(true); }}><Edit3 className="h-3 w-3" /></IconBtn><IconBtn danger onClick={() => onDelete(param.id)}><Trash2 className="h-3 w-3" /></IconBtn></div></td> : null}
    </tr>
  );
}

function ResponseRow({ resp, canEdit, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ statusCode: resp.statusCode, description: resp.description ?? "", exampleJson: resp.exampleJson ?? "" });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try { await onUpdate(resp.id, { ...form, exampleJson: form.exampleJson || null }); setEditing(false); } catch {}
    finally { setBusy(false); }
  }

  if (editing) {
    return (
      <div className="space-y-2 rounded-lg border border-zinc-700/40 bg-zinc-800/30 p-3">
        <div className="flex gap-2">
          <DarkInput type="number" value={form.statusCode} onChange={(e) => setForm({ ...form, statusCode: +e.target.value })} className="w-24" />
          <DarkInput value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="flex-1" />
        </div>
        <DarkTextarea rows={3} value={form.exampleJson} onChange={(e) => setForm({ ...form, exampleJson: e.target.value })} placeholder='{"key": "value"}' />
        <div className="flex gap-1">
          <Button size="sm" onClick={save} disabled={busy}><Check className="h-3.5 w-3.5" />Save</Button>
          <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-zinc-700/30 bg-zinc-800/20 px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${statusColor(resp.statusCode)}`}>{resp.statusCode}</span>
          <span className="text-xs text-zinc-400">{resp.description || "No description"}</span>
        </div>
        {resp.exampleJson ? <pre className="mt-1.5 max-h-32 overflow-auto rounded-lg bg-zinc-900/80 p-2 text-[11px] leading-relaxed text-zinc-300">{resp.exampleJson}</pre> : null}
      </div>
      {canEdit ? (
        <div className="flex shrink-0 gap-0.5">
          <IconBtn onClick={() => { setForm({ statusCode: resp.statusCode, description: resp.description ?? "", exampleJson: resp.exampleJson ?? "" }); setEditing(true); }}><Edit3 className="h-3 w-3" /></IconBtn>
          <IconBtn danger onClick={() => onDelete(resp.id)}><Trash2 className="h-3 w-3" /></IconBtn>
        </div>
      ) : null}
    </div>
  );
}

function RouteCard({ route, group, projectId, canEdit, onReload, onError, testSettings }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [addParam, setAddParam] = useState(false);
  const [newParam, setNewParam] = useState({ location: "QUERY", name: "", dataType: "string", isRequired: false, description: "" });
  const [addResp, setAddResp] = useState(false);
  const [newResp, setNewResp] = useState({ statusCode: 200, description: "", exampleJson: "" });

  const [testOpen, setTestOpen] = useState(false);
  const [testBody, setTestBody] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testBusy, setTestBusy] = useState(false);

  const mc = methodColor(route.method);

  function startEdit() {
    setForm({ method: route.method, path: route.path, summary: route.summary ?? "", description: route.description ?? "", authRequired: route.authRequired ?? false, status: route.status ?? "DRAFT" });
    setEditing(true);
  }

  async function saveEdit() {
    setBusy(true); onError("");
    try {
      await updateApiRoute(projectId, route.id, form);
      setEditing(false); await onReload();
    } catch (err) { onError(err.response?.data?.error ?? "Could not update route"); }
    finally { setBusy(false); }
  }

  async function deleteRoute() {
    if (!window.confirm("Delete this route?")) return;
    onError("");
    try { await deleteApiRoute(projectId, route.id); await onReload(); }
    catch (err) { onError(err.response?.data?.error ?? "Could not delete route"); }
  }

  async function onSaveParam() {
    onError("");
    try { await createApiParameter(projectId, route.id, newParam); setAddParam(false); setNewParam({ location: "QUERY", name: "", dataType: "string", isRequired: false, description: "" }); await onReload(); }
    catch (err) { onError(err.response?.data?.error ?? "Could not add parameter"); }
  }

  async function onUpdateParam(paramId, data) {
    onError("");
    await updateApiParameter(projectId, route.id, paramId, data); await onReload();
  }

  async function onDeleteParam(paramId) {
    if (!window.confirm("Delete this parameter?")) return;
    onError("");
    try { await deleteApiParameter(projectId, route.id, paramId); await onReload(); }
    catch (err) { onError(err.response?.data?.error ?? "Could not delete parameter"); }
  }

  async function onSaveResp() {
    onError("");
    try { await createApiResponse(projectId, route.id, { ...newResp, exampleJson: newResp.exampleJson || null }); setAddResp(false); setNewResp({ statusCode: 200, description: "", exampleJson: "" }); await onReload(); }
    catch (err) { onError(err.response?.data?.error ?? "Could not add response"); }
  }

  async function onUpdateResp(respId, data) {
    onError("");
    await updateApiResponse(projectId, route.id, respId, data); await onReload();
  }

  async function onDeleteResp(respId) {
    if (!window.confirm("Delete this response?")) return;
    onError("");
    try { await deleteApiResponse(projectId, route.id, respId); await onReload(); }
    catch (err) { onError(err.response?.data?.error ?? "Could not delete response"); }
  }

  async function runTest() {
    setTestBusy(true); setTestResult(null);

    const baseUrl = testSettings.baseUrl || "http://localhost:3000";
    const token = testSettings.authToken || "";
    const globalHeaders = Array.isArray(testSettings.headers) ? testSettings.headers : [];

    let fullPath = route.path;
    (route.parameters ?? []).filter((p) => p.location === "PATH").forEach((p) => {
      fullPath = fullPath.replace(`:${p.name}`, p.example || `{${p.name}}`);
    });

    const url = new URL(fullPath, baseUrl.endsWith("/") ? baseUrl : baseUrl + "/");

    (route.parameters ?? []).filter((p) => p.location === "QUERY").forEach((p) => {
      if (p.example) url.searchParams.set(p.name, p.example);
    });

    const headers = {};
    if (token.trim()) headers["Authorization"] = `Bearer ${token.trim()}`;
    globalHeaders.forEach((h) => { if (h.key && h.value) headers[h.key] = h.value; });
    (route.parameters ?? []).filter((p) => p.location === "HEADER").forEach((p) => {
      if (p.example && !headers[p.name]) headers[p.name] = p.example;
    });

    const startMs = performance.now();
    try {
      const fetchOpts = { method: route.method, headers: { "Content-Type": "application/json", ...headers } };
      if (testBody && !["GET", "DELETE"].includes(route.method)) fetchOpts.body = testBody;
      const res = await fetch(url.toString(), fetchOpts);
      const elapsed = Math.round(performance.now() - startMs);
      let body;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("json")) { body = JSON.stringify(await res.json(), null, 2); } else { body = await res.text(); }
      setTestResult({ status: res.status, statusText: res.statusText, elapsed, body, ok: res.ok });
    } catch (err) {
      setTestResult({ status: 0, statusText: "Network Error", elapsed: Math.round(performance.now() - startMs), body: err.message, ok: false });
    } finally { setTestBusy(false); }
  }

  return (
    <div className={`rounded-xl border ${mc.border} bg-zinc-900/60 transition-all duration-200 hover:bg-zinc-900/80`}>
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-3 px-4 py-3 text-start">
        {expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" /> : <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />}
        <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${mc.bg} ${mc.text}`}>{route.method}</span>
        <code className="min-w-0 flex-1 truncate text-sm text-zinc-200">{(group.prefix ?? "") + route.path}</code>
        {route.authRequired ? <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400/60" /> : null}
        <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">{route.status}</span>
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-zinc-800/60 px-4 py-4">
          {editing ? (
            <div className="space-y-2 rounded-lg border border-zinc-700/40 bg-zinc-800/30 p-3">
              <div className="flex gap-2">
                <DarkSelect value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-28">{HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</DarkSelect>
                <DarkInput value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="/path" className="flex-1" />
              </div>
              <DarkInput value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Summary" />
              <DarkTextarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={form.authRequired} onChange={(e) => setForm({ ...form, authRequired: e.target.checked })} />Auth required</label>
                <DarkSelect value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="text-xs">
                  <option value="DRAFT">DRAFT</option><option value="ACTIVE">ACTIVE</option><option value="DEPRECATED">DEPRECATED</option>
                </DarkSelect>
              </div>
              <div className="flex gap-1">
                <Button size="sm" onClick={saveEdit} disabled={busy}><Save className="h-3.5 w-3.5" />Save</Button>
                <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              {route.summary ? <p className="text-sm text-zinc-300">{route.summary}</p> : null}
              {route.description ? <p className="text-xs text-zinc-500">{route.description}</p> : null}
            </>
          )}

          {canEdit && !editing ? (
            <div className="flex flex-wrap gap-1">
              <IconBtn onClick={startEdit}><Edit3 className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn danger onClick={deleteRoute}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
              <Link to={`/projects/${projectId}/comments?route=${encodeURIComponent(route.id)}`} className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-teal-400">
                <MessageSquare className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null}

          {/* Parameters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Parameters</h4>
              {canEdit ? <IconBtn onClick={() => setAddParam(!addParam)}>{addParam ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</IconBtn> : null}
            </div>
            {addParam ? (
              <div className="mb-2 flex flex-wrap gap-2 rounded-lg border border-zinc-700/40 bg-zinc-800/30 p-2">
                <DarkSelect value={newParam.location} onChange={(e) => setNewParam({ ...newParam, location: e.target.value })} className="w-24 text-xs">{PARAM_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}</DarkSelect>
                <DarkInput value={newParam.name} onChange={(e) => setNewParam({ ...newParam, name: e.target.value })} placeholder="name" className="w-28 text-xs" />
                <DarkInput value={newParam.dataType} onChange={(e) => setNewParam({ ...newParam, dataType: e.target.value })} placeholder="string" className="w-24 text-xs" />
                <label className="flex items-center gap-1 text-[10px] text-zinc-500"><input type="checkbox" checked={newParam.isRequired} onChange={(e) => setNewParam({ ...newParam, isRequired: e.target.checked })} />Req</label>
                <Button size="sm" onClick={onSaveParam} disabled={!newParam.name.trim()}><Plus className="h-3 w-3" /></Button>
              </div>
            ) : null}
            {route.parameters?.length ? (
              <div className="overflow-x-auto rounded-lg border border-zinc-700/30">
                <table className="w-full text-xs"><tbody>
                  {route.parameters.map((p) => <ParameterRow key={p.id} param={p} canEdit={canEdit} onUpdate={onUpdateParam} onDelete={onDeleteParam} />)}
                </tbody></table>
              </div>
            ) : <p className="text-xs text-zinc-600">No parameters defined.</p>}
          </div>

          {/* Responses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Responses</h4>
              {canEdit ? <IconBtn onClick={() => setAddResp(!addResp)}>{addResp ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</IconBtn> : null}
            </div>
            {addResp ? (
              <div className="mb-2 space-y-2 rounded-lg border border-zinc-700/40 bg-zinc-800/30 p-3">
                <div className="flex gap-2">
                  <DarkSelect value={newResp.statusCode} onChange={(e) => setNewResp({ ...newResp, statusCode: +e.target.value })} className="w-24">{STATUS_CODES.map((c) => <option key={c} value={c}>{c}</option>)}</DarkSelect>
                  <DarkInput value={newResp.description} onChange={(e) => setNewResp({ ...newResp, description: e.target.value })} placeholder="Description" className="flex-1" />
                </div>
                <DarkTextarea rows={3} value={newResp.exampleJson} onChange={(e) => setNewResp({ ...newResp, exampleJson: e.target.value })} placeholder='Example JSON response body' />
                <Button size="sm" onClick={onSaveResp}><Plus className="h-3 w-3" />Add response</Button>
              </div>
            ) : null}
            <div className="space-y-1.5">
              {(route.responses ?? []).map((r) => <ResponseRow key={r.id} resp={r} canEdit={canEdit} onUpdate={onUpdateResp} onDelete={onDeleteResp} />)}
            </div>
            {!route.responses?.length && !addResp ? <p className="text-xs text-zinc-600">No responses defined.</p> : null}
          </div>

          {/* API Tester */}
          <div className="border-t border-zinc-800/60 pt-3">
            <button type="button" onClick={() => setTestOpen(!testOpen)} className="flex items-center gap-2 text-xs font-semibold text-teal-400 transition-colors hover:text-teal-300">
              <Play className="h-3.5 w-3.5" />
              {testOpen ? "Hide Tester" : "Try it out"}
            </button>
            {testOpen ? (
              <div className="mt-3 space-y-3 rounded-xl border border-teal-500/20 bg-zinc-800/40 p-4">
                {/* Computed URL preview */}
                <div className="flex items-center gap-2 rounded-lg bg-zinc-900/80 px-3 py-2 text-xs">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 font-bold uppercase ${methodColor(route.method).bg} ${methodColor(route.method).text}`}>{route.method}</span>
                  <code className="min-w-0 flex-1 truncate text-zinc-300">{(testSettings.baseUrl || "http://localhost:3000")}{(group.prefix ?? "") + route.path}</code>
                  {(testSettings.authToken || "").trim() ? <Lock className="h-3 w-3 shrink-0 text-amber-400" title="Bearer token attached" /> : null}
                </div>

                {/* Body input — for POST, PUT, PATCH */}
                {!["GET", "DELETE"].includes(route.method) ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Request Body (JSON)</label>
                    <DarkTextarea
                      rows={6}
                      value={testBody}
                      onChange={(e) => setTestBody(e.target.value)}
                      placeholder={'{\n  "key": "value",\n  "name": "example"\n}'}
                      className="font-mono text-xs"
                    />
                    {testBody.trim() ? (() => {
                      try { JSON.parse(testBody); return <p className="flex items-center gap-1.5 text-[10px] text-emerald-400"><Check className="h-3 w-3" />Valid JSON</p>; }
                      catch { return <p className="flex items-center gap-1.5 text-[10px] text-red-400"><AlertCircle className="h-3 w-3" />Invalid JSON</p>; }
                    })() : null}
                  </div>
                ) : null}

                <Button onClick={runTest} disabled={testBusy} className="w-full">
                  {testBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {testBusy ? "Sending..." : "Send Request"}
                </Button>
                {testResult ? (
                  <div className="space-y-2 rounded-lg border border-zinc-700/40 bg-zinc-900/80 p-3">
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`rounded-lg px-2 py-1 font-bold ${testResult.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>{testResult.status} {testResult.statusText}</span>
                      <span className="text-zinc-500">{testResult.elapsed}ms</span>
                      <button type="button" className="ms-auto text-zinc-500 hover:text-zinc-300" onClick={() => { navigator.clipboard.writeText(testResult.body); }}><Copy className="h-3 w-3" /></button>
                    </div>
                    <pre className="max-h-64 overflow-auto rounded-lg bg-zinc-950/80 p-3 text-[11px] leading-relaxed text-zinc-300">{testResult.body}</pre>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GroupCard({ group, projectId, canEdit, onReload, onError, testSettings }) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [addRoute, setAddRoute] = useState(false);
  const [newRoute, setNewRoute] = useState({ method: "GET", path: "" });

  function startEdit() {
    setForm({ name: group.name, prefix: group.prefix ?? "", description: group.description ?? "" });
    setEditing(true);
  }

  async function saveGroup() {
    setBusy(true); onError("");
    try { await updateApiGroup(projectId, group.id, form); setEditing(false); await onReload(); }
    catch (err) { onError(err.response?.data?.error ?? "Could not update group"); }
    finally { setBusy(false); }
  }

  async function removeGroup() {
    if (!window.confirm(`Delete group "${group.name}" and all its routes?`)) return;
    onError("");
    try { await deleteApiGroup(projectId, group.id); await onReload(); }
    catch (err) { onError(err.response?.data?.error ?? "Could not delete group"); }
  }

  async function addNewRoute() {
    if (!newRoute.path.trim()) return;
    onError("");
    try { await createApiRoute(projectId, group.id, newRoute); setAddRoute(false); setNewRoute({ method: "GET", path: "" }); await onReload(); }
    catch (err) { onError(err.response?.data?.error ?? "Could not create route"); }
  }

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-5 py-4">
        <button type="button" onClick={() => setOpen(!open)} className="shrink-0">
          {open ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
        </button>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <DarkInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Group name" />
              <DarkInput value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} placeholder="/api/prefix" />
              <DarkTextarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
              <div className="flex gap-1">
                <Button size="sm" onClick={saveGroup} disabled={busy}><Save className="h-3.5 w-3.5" />Save</Button>
                <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <span className="font-bold text-zinc-100">{group.name}</span>
              {group.prefix ? <code className="ms-2 text-xs text-zinc-500">{group.prefix}</code> : null}
              {group.description ? <p className="mt-0.5 text-xs text-zinc-500">{group.description}</p> : null}
            </div>
          )}
        </div>
        <span className="shrink-0 rounded-lg bg-zinc-800/80 px-2 py-0.5 text-xs font-bold tabular-nums text-zinc-400">{group.routes?.length ?? 0}</span>
        {canEdit && !editing ? (
          <div className="flex shrink-0 gap-0.5">
            <IconBtn onClick={startEdit}><Edit3 className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn danger onClick={removeGroup}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
          </div>
        ) : null}
      </div>
      {open ? (
        <div className="space-y-2 border-t border-zinc-800/60 px-5 py-4">
          {canEdit ? (
            <div className="mb-3">
              {addRoute ? (
                <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-700/40 bg-zinc-800/30 p-3">
                  <DarkSelect value={newRoute.method} onChange={(e) => setNewRoute({ ...newRoute, method: e.target.value })} className="w-28">{HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</DarkSelect>
                  <DarkInput value={newRoute.path} onChange={(e) => setNewRoute({ ...newRoute, path: e.target.value })} placeholder="/resource/:id" className="flex-1" />
                  <Button size="sm" onClick={addNewRoute} disabled={!newRoute.path.trim()}><Plus className="h-3.5 w-3.5" />Add</Button>
                  <Button size="sm" variant="secondary" onClick={() => setAddRoute(false)}>Cancel</Button>
                </div>
              ) : (
                <button type="button" onClick={() => setAddRoute(true)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-teal-400 transition-colors hover:bg-teal-500/10">
                  <Plus className="h-3.5 w-3.5" />Add route
                </button>
              )}
            </div>
          ) : null}
          {group.routes?.length ? (
            <div className="space-y-2">
              {group.routes.map((route) => <RouteCard key={route.id} route={route} group={group} projectId={projectId} canEdit={canEdit} onReload={onReload} onError={onError} testSettings={testSettings} />)}
            </div>
          ) : <p className="text-xs text-zinc-600">No routes in this group yet.</p>}
        </div>
      ) : null}
    </div>
  );
}

export default function ApiDocsPage() {
  const { projectId } = useParams();
  const { project } = useOutletContext();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [testSettings, setTestSettings] = useState({ baseUrl: "http://localhost:3000", authToken: "", headers: [], body: "" });
  const saveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getApiTestSettings(projectId).then(({ data }) => {
      if (!cancelled) {
        const s = data.settings ?? {};
        setTestSettings({
          baseUrl: s.baseUrl || "http://localhost:3000",
          authToken: s.authToken || "",
          headers: Array.isArray(s.headers) ? s.headers : [],
          body: s.body || "",
        });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [projectId]);

  const handleTestSettingsChange = useCallback((patch) => {
    setTestSettings((prev) => {
      const next = { ...prev, ...patch };
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { saveApiTestSettings(projectId, next).catch(() => {}); }, 600);
      return next;
    });
  }, [projectId]);

  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(true);
  const [globalTab, setGlobalTab] = useState("auth");

  function addGlobalHeader() { handleTestSettingsChange({ headers: [...(testSettings.headers || []), { key: "", value: "" }] }); }
  function removeGlobalHeader(i) { handleTestSettingsChange({ headers: (testSettings.headers || []).filter((_, j) => j !== i) }); }
  function updateGlobalHeader(i, field, val) { handleTestSettingsChange({ headers: (testSettings.headers || []).map((h, j) => j === i ? { ...h, [field]: val } : h) }); }

  const [showNewGroup, setShowNewGroup] = useState(false);
  const [gName, setGName] = useState("");
  const [gPrefix, setGPrefix] = useState("");
  const [gDesc, setGDesc] = useState("");
  const [groupBusy, setGroupBusy] = useState(false);

  /* ── Import / Export state ── */
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [importSuccess, setImportSuccess] = useState("");

  useEffect(() => {
    if (!showImportMenu && !showExportMenu) return;
    const close = (e) => {
      if (e.target.closest("[data-dropdown]")) return;
      setShowImportMenu(false);
      setShowExportMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showImportMenu, showExportMenu]);

  const canEdit = project?.myRole === "LEADER" || project?.myRole === "EDITOR";

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await getApiGroups(projectId);
      setGroups(data.groups ?? []);
    } catch (e) { setError(e.response?.data?.error ?? "Failed to load API docs"); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let t;
    const onRemote = (e) => { if (e.detail?.projectId !== projectId) return; clearTimeout(t); t = setTimeout(() => load(), 450); };
    window.addEventListener("dbforge:api-updated", onRemote);
    return () => { window.removeEventListener("dbforge:api-updated", onRemote); clearTimeout(t); };
  }, [projectId, load]);

  async function onCreateGroup(e) {
    e.preventDefault();
    if (!gName.trim()) return;
    setGroupBusy(true); setError("");
    try {
      await createApiGroup(projectId, { name: gName.trim(), prefix: gPrefix.trim() || undefined, description: gDesc.trim() || undefined });
      setGName(""); setGPrefix(""); setGDesc(""); setShowNewGroup(false); await load();
    } catch (err) { setError(err.response?.data?.error ?? "Could not create group"); }
    finally { setGroupBusy(false); }
  }

  const routeCount = groups.reduce((sum, g) => sum + (g.routes?.length ?? 0), 0);

  /* ── Export helpers ── */
  function downloadJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportSwagger() {
    setShowExportMenu(false);
    try {
      const { data } = await exportSwagger(projectId);
      downloadJson(data, "openapi.json");
    } catch { setError("Failed to export OpenAPI spec"); }
  }

  async function handleExportPostman() {
    setShowExportMenu(false);
    try {
      const { data } = await exportPostman(projectId);
      downloadJson(data, "postman_collection.json");
    } catch { setError("Failed to export Postman collection"); }
  }

  /* ── Import helpers ── */
  function openFilePicker(accept, onFile) {
    const input = document.createElement("input");
    input.type = "file"; input.accept = accept;
    input.onchange = (e) => { const f = e.target.files?.[0]; if (f) onFile(f); };
    input.click();
  }

  async function handleImportSwagger(clearExisting) {
    setShowImportMenu(false);
    openFilePicker(".json,application/json", async (file) => {
      setImportBusy(true); setError(""); setImportSuccess("");
      try {
        const text = await file.text();
        const spec = JSON.parse(text);
        const { data } = await importSwagger(projectId, { spec, clearExisting });
        setImportSuccess(`Imported ${data.groupsCreated} groups, ${data.routesCreated} routes from Swagger/OpenAPI`);
        await load();
      } catch (e) { setError(e.response?.data?.error ?? e.message ?? "Failed to import Swagger file"); }
      finally { setImportBusy(false); }
    });
  }

  async function handleImportPostman(clearExisting) {
    setShowImportMenu(false);
    openFilePicker(".json,application/json", async (file) => {
      setImportBusy(true); setError(""); setImportSuccess("");
      try {
        const text = await file.text();
        const collection = JSON.parse(text);
        const { data } = await importPostman(projectId, { collection, clearExisting });
        setImportSuccess(`Imported ${data.groupsCreated} groups, ${data.routesCreated} routes from Postman collection`);
        await load();
      } catch (e) { setError(e.response?.data?.error ?? e.message ?? "Failed to import Postman file"); }
      finally { setImportBusy(false); }
    });
  }

  return (
    <div className="min-h-[60vh] bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-900/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold tracking-tight text-white">API Documentation</h1>
            <p className="text-sm text-zinc-500">{groups.length} groups · {routeCount} routes</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Export dropdown */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => { setShowExportMenu(v => !v); setShowImportMenu(false); }}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700/60"
              >
                <Download className="h-4 w-4 text-teal-400" />
                Export
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 border-b border-zinc-800">Export As</div>
                  <button type="button" onClick={handleExportSwagger}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors">
                    <FileJson className="h-4 w-4 text-emerald-400" />
                    <div className="text-left">
                      <div className="font-medium">OpenAPI / Swagger</div>
                      <div className="text-[10px] text-zinc-500">openapi.json (v3.0)</div>
                    </div>
                  </button>
                  <button type="button" onClick={handleExportPostman}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors">
                    <FileJson className="h-4 w-4 text-orange-400" />
                    <div className="text-left">
                      <div className="font-medium">Postman Collection</div>
                      <div className="text-[10px] text-zinc-500">postman_collection.json (v2.1)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Import dropdown — editors only */}
            {canEdit && (
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => { setShowImportMenu(v => !v); setShowExportMenu(false); }}
                  disabled={importBusy}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700/60 disabled:opacity-50"
                >
                  {importBusy ? <Loader2 className="h-4 w-4 animate-spin text-teal-400" /> : <Upload className="h-4 w-4 text-teal-400" />}
                  Import
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                </button>
                {showImportMenu && (
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 border-b border-zinc-800">Import From</div>
                    <div className="px-3 py-2 border-b border-zinc-800/60">
                      <p className="text-[11px] font-semibold text-zinc-400 mb-1.5">Swagger / OpenAPI</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleImportSwagger(false)}
                          className="flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                          Merge
                        </button>
                        <button type="button" onClick={() => handleImportSwagger(true)}
                          className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                          Replace All
                        </button>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[11px] font-semibold text-zinc-400 mb-1.5">Postman Collection</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleImportPostman(false)}
                          className="flex-1 rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-1.5 text-[11px] font-medium text-orange-400 hover:bg-orange-500/20 transition-colors">
                          Merge
                        </button>
                        <button type="button" onClick={() => handleImportPostman(true)}
                          className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                          Replace All
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {canEdit ? (
              <Button onClick={() => setShowNewGroup(!showNewGroup)} size="sm">
                {showNewGroup ? <X className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
                {showNewGroup ? "Cancel" : "New Group"}
              </Button>
            ) : null}
          </div>
        </div>

        {error ? <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20"><AlertCircle className="me-2 inline h-4 w-4" />{error}</div> : null}
        {importSuccess ? (
          <div className="mb-4 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 ring-1 ring-emerald-500/20 flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />{importSuccess}
            <button type="button" onClick={() => setImportSuccess("")} className="ml-auto text-emerald-600 hover:text-emerald-400"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : null}

        {/* ── Global Test Settings (like Postman collection-level) ── */}
        <div className="mb-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setGlobalSettingsOpen(!globalSettingsOpen)}
            className="flex w-full items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
          >
            {globalSettingsOpen ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
            <Settings2 className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-bold text-zinc-100">Global Test Settings</span>
            <span className="text-[10px] text-zinc-600">Applies to all routes</span>
            <div className="ms-auto flex items-center gap-2">
              {(testSettings.authToken || "").trim() ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  <Lock className="h-2.5 w-2.5" />Auth
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                  <Lock className="h-2.5 w-2.5" />No Auth
                </span>
              )}
              {(testSettings.headers || []).length > 0 ? (
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">{testSettings.headers.length} header{testSettings.headers.length > 1 ? "s" : ""}</span>
              ) : null}
            </div>
          </button>

          {globalSettingsOpen ? (
            <div className="border-t border-zinc-800/60 px-5 py-4 space-y-4">
              {/* Base URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Base URL</label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 text-zinc-500" />
                  <DarkInput value={testSettings.baseUrl || ""} onChange={(e) => handleTestSettingsChange({ baseUrl: e.target.value })} placeholder="http://localhost:3000" />
                </div>
              </div>

              {/* Tabs: Auth | Headers */}
              <div className="flex gap-0 border-b border-zinc-700/40">
                {[
                  { id: "auth", label: "Authorization", icon: <Lock className="h-3 w-3" /> },
                  { id: "headers", label: "Headers", icon: <Settings2 className="h-3 w-3" />, count: (testSettings.headers || []).length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setGlobalTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${globalTab === tab.id ? "border-teal-400 text-teal-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count ? <span className="rounded-full bg-zinc-700/60 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300">{tab.count}</span> : null}
                  </button>
                ))}
              </div>

              {/* Auth content */}
              {globalTab === "auth" ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Bearer Token</label>
                  <p className="text-[10px] text-zinc-600">Sent as <code className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-400">Authorization: Bearer &lt;token&gt;</code> with every request</p>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 shrink-0 text-amber-400/60" />
                    <DarkInput
                      value={testSettings.authToken || ""}
                      onChange={(e) => handleTestSettingsChange({ authToken: e.target.value })}
                      placeholder="Paste your JWT or API token here..."
                      type="password"
                    />
                    {(testSettings.authToken || "").trim() ? (
                      <IconBtn onClick={() => handleTestSettingsChange({ authToken: "" })} title="Clear token"><X className="h-3.5 w-3.5" /></IconBtn>
                    ) : null}
                  </div>
                  {(testSettings.authToken || "").trim() ? (
                    <p className="flex items-center gap-1.5 text-[10px] text-emerald-400"><Check className="h-3 w-3" />Token set — included in all requests</p>
                  ) : (
                    <p className="text-[10px] text-zinc-600">No token — requests sent without authorization</p>
                  )}
                </div>
              ) : null}

              {/* Headers content */}
              {globalTab === "headers" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Custom Headers</label>
                    <IconBtn onClick={addGlobalHeader}><Plus className="h-3.5 w-3.5" /></IconBtn>
                  </div>
                  {(testSettings.headers || []).length === 0 ? (
                    <p className="text-[10px] text-zinc-600">No custom headers. Click + to add one.</p>
                  ) : null}
                  {(testSettings.headers || []).map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <DarkInput value={h.key} onChange={(e) => updateGlobalHeader(i, "key", e.target.value)} placeholder="Header name" className="flex-1" />
                      <DarkInput value={h.value} onChange={(e) => updateGlobalHeader(i, "value", e.target.value)} placeholder="Value" className="flex-1" />
                      <IconBtn danger onClick={() => removeGlobalHeader(i)}><Minus className="h-3 w-3" /></IconBtn>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {showNewGroup ? (
          <form className="mb-6 space-y-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5" onSubmit={onCreateGroup}>
            <h2 className="text-sm font-bold text-zinc-200">Create Route Group</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <DarkInput value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Group name (e.g. Auth)" required />
              <DarkInput value={gPrefix} onChange={(e) => setGPrefix(e.target.value)} placeholder="Path prefix (e.g. /api/auth)" />
            </div>
            <DarkTextarea rows={2} value={gDesc} onChange={(e) => setGDesc(e.target.value)} placeholder="Description (optional)" />
            <Button type="submit" disabled={groupBusy}><FolderPlus className="h-4 w-4" />{groupBusy ? "Creating\u2026" : "Create Group"}</Button>
          </form>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner className="h-10 w-10" /></div>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => <GroupCard key={g.id} group={g} projectId={projectId} canEdit={canEdit} onReload={load} onError={setError} testSettings={testSettings} />)}
            {groups.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80"><Code2 className="h-7 w-7 text-zinc-600" /></div>
                <p className="mt-4 text-sm text-zinc-500">No API groups yet. Create a group to start documenting your endpoints.</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
