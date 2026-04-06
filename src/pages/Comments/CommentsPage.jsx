import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Database, Globe, MessageSquare, Send } from "lucide-react";
import { createComment, getComments } from "../../api/projects.js";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

const TYPES = [
  { value: "ERD_TABLE", label: "ERD table" },
  { value: "ERD_RELATION", label: "ERD relation" },
  { value: "API_ROUTE", label: "API route" },
];

function applyQueryToTarget(searchParams, setType, setId) {
  const ct = searchParams.get("commentableType");
  const cid = searchParams.get("commentableId");
  if (ct && cid) {
    setType(ct);
    setId(cid);
    return true;
  }
  const table = searchParams.get("table");
  if (table) {
    setType("ERD_TABLE");
    setId(table);
    return true;
  }
  const relation = searchParams.get("relation");
  if (relation) {
    setType("ERD_RELATION");
    setId(relation);
    return true;
  }
  const route = searchParams.get("route");
  if (route) {
    setType("API_ROUTE");
    setId(route);
    return true;
  }
  return false;
}

export default function CommentsPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [commentableType, setCommentableType] = useState("ERD_TABLE");
  const [commentableId, setCommentableId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const targetLocked = useMemo(
    () =>
      Boolean(
        searchParams.get("table") ||
          searchParams.get("relation") ||
          searchParams.get("route") ||
          (searchParams.get("commentableType") && searchParams.get("commentableId")),
      ),
    [searchParams],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getComments(projectId);
      setComments(data.comments ?? []);
    } catch (e) {
      setError(e.response?.data?.error ?? "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    applyQueryToTarget(searchParams, setCommentableType, setCommentableId);
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let t;
    const h = (e) => {
      if (e.detail?.projectId !== projectId) {
        return;
      }
      clearTimeout(t);
      t = setTimeout(() => load(), 450);
    };
    window.addEventListener("dbforge:comments-updated", h);
    return () => {
      window.removeEventListener("dbforge:comments-updated", h);
      clearTimeout(t);
    };
  }, [projectId, load]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!body.trim() || !commentableId.trim()) {
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createComment(projectId, {
        commentableType,
        commentableId: commentableId.trim(),
        body: body.trim(),
      });
      setBody("");
      await load();
    } catch (err) {
      setError(err.response?.data?.error ?? "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
            <MessageSquare className="h-5 w-5" />
          </span>
          Discussion
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {targetLocked
            ? "Target is set from the whiteboard or API page."
            : "Choose what this thread is about, or open Comments from a table card, API route, or relation link to pre-fill."}
        </p>
      </div>

      <Card className="ring-1 ring-slate-200/40">
        {targetLocked ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-teal-50/80 px-3.5 py-2.5 text-xs text-teal-900 ring-1 ring-teal-200/60">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <span><strong>Context linked.</strong> You arrived with a specific table, relation, or route.</span>
          </div>
        ) : null}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Select
            id="ctype"
            label="Attach to"
            value={commentableType}
            onChange={(e) => setCommentableType(e.target.value)}
            disabled={targetLocked}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <Input
            id="cid"
            label="Entity id"
            placeholder="Set automatically from ERD / API links"
            value={commentableId}
            onChange={(e) => setCommentableId(e.target.value)}
            readOnly={targetLocked}
            className={targetLocked ? "bg-slate-50/80 text-slate-600" : ""}
          />
          <div className="md:col-span-2">
            <Textarea
              id="cbody"
              label="Comment"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? "Posting..." : "Post comment"}
            </Button>
            <Link to={`/projects/${projectId}/whiteboard`}>
              <Button type="button" variant="secondary">
                <Database className="h-4 w-4" />
                Open whiteboard
              </Button>
            </Link>
            <Link to={`/projects/${projectId}/api`}>
              <Button type="button" variant="secondary">
                <Globe className="h-4 w-4" />
                API docs
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-10 w-10" />
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl bg-red-50/80 p-4 text-sm text-red-700 ring-1 ring-red-200/60">
          {error}
        </div>
      ) : null}

      {!loading && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c) => (
            <Card key={c.id} className="ring-1 ring-slate-200/40 transition-all duration-200 hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600">
                    {(c.user?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{c.user?.name ?? "Member"}</p>
                    <p className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="muted">{c.commentableType}</Badge>
                  {c.resolvedAt ? <Badge tone="success">Resolved</Badge> : null}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{c.body}</p>
              <p className="mt-2 font-mono text-[11px] text-slate-400">on {c.commentableId}</p>
              {c.replies?.length ? (
                <ul className="mt-4 space-y-3 border-s-2 border-teal-200/60 ps-4">
                  {c.replies.map((r) => (
                    <li key={r.id}>
                      <p className="text-sm font-bold text-slate-800">{r.user?.name}</p>
                      <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
                      <p className="mt-1 text-sm text-slate-600">{r.body}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && comments.length === 0 ? (
        <Card className="border-dashed border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 text-center ring-0">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm text-slate-500">No top-level comments yet.</p>
        </Card>
      ) : null}
    </div>
  );
}
