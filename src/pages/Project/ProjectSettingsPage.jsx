import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Save, Settings2, Trash2, Users } from "lucide-react";
import { deleteProject, getProject, updateProject } from "../../api/projects.js";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { Select } from "../../components/ui/Select.jsx";

export default function ProjectSettingsPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { project, setProject } = useOutletContext();
  const [error, setError] = useState("");

  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pVis, setPVis] = useState("PRIVATE");
  const [generalSaving, setGeneralSaving] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const isLeader = project?.myRole === "LEADER";

  useEffect(() => {
    if (project) {
      setPName(project.name ?? "");
      setPDesc(project.description ?? "");
      setPVis(project.visibility ?? "PRIVATE");
    }
  }, [project]);

  async function onSaveGeneral(e) {
    e.preventDefault();
    setGeneralSaving(true);
    setError("");
    try {
      await updateProject(projectId, {
        name: pName.trim(),
        description: pDesc.trim() === "" ? null : pDesc.trim(),
        visibility: pVis,
      });
      const { data } = await getProject(projectId);
      setProject(data.project);
    } catch (e) {
      setError(e.response?.data?.error ?? "Could not update project");
    } finally {
      setGeneralSaving(false);
    }
  }

  async function onDeleteProject() {
    if (
      !window.confirm(
        "Delete this project and all ERD data, API docs, and comments? This cannot be undone.",
      )
    ) {
      return;
    }
    setDeleteBusy(true);
    setError("");
    try {
      await deleteProject(projectId);
      navigate("/", { replace: true });
    } catch (e) {
      setError(e.response?.data?.error ?? "Could not delete project");
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
            <Settings2 className="h-5 w-5" />
          </span>
          {t("project.settings.title", { defaultValue: "Project Settings" })}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Name, description, and visibility.{" "}
          <Link
            to={`/projects/${projectId}/team`}
            className="inline-flex items-center gap-1 font-semibold text-teal-700 transition-colors hover:text-teal-600"
          >
            <Users className="h-3.5 w-3.5" />
            Manage team & invites
          </Link>{" "}
          from the sidebar or Team page.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50/80 p-4 text-sm text-red-700 ring-1 ring-red-200/60">
          {error}
        </div>
      ) : null}

      {isLeader ? (
        <Card className="ring-1 ring-slate-200/40">
          <CardHeader
            title="Project details"
            description="Only the project leader can change these fields or delete the project."
          />
          <form className="space-y-4" onSubmit={onSaveGeneral}>
            <Input
              id="proj-name"
              label="Name"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              required
            />
            <Textarea
              id="proj-desc"
              label="Description"
              rows={3}
              value={pDesc}
              onChange={(e) => setPDesc(e.target.value)}
            />
            <Select
              id="proj-vis"
              label="Visibility"
              value={pVis}
              onChange={(e) => setPVis(e.target.value)}
            >
              <option value="PRIVATE">Private</option>
              <option value="PUBLIC">Public</option>
            </Select>
            <div className="flex flex-wrap gap-3 border-t border-slate-100/80 pt-5">
              <Button type="submit" disabled={generalSaving}>
                <Save className="h-4 w-4" />
                {generalSaving ? "Saving..." : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={deleteBusy}
                onClick={onDeleteProject}
              >
                <Trash2 className="h-4 w-4" />
                {deleteBusy ? "Deleting..." : "Delete project"}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="ring-1 ring-slate-200/40">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200/60">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-600">
              Only the project leader can edit project details here. You can still use{" "}
              <Link to={`/projects/${projectId}/team`} className="font-semibold text-teal-700">
                Team & invites
              </Link>{" "}
              if your role allows inviting others.
            </p>
          </div>
        </Card>
      )}

      <Card className="border-dashed border-slate-200/80 bg-gradient-to-br from-slate-50/50 to-teal-50/10 ring-0">
        <CardHeader
          title="Fine-grained permissions (roadmap)"
          description="The database already supports per-user resource permissions (ERD, API, comments, exports). The API will expose a management UI in a future release so leaders can grant view/edit beyond the default role presets."
        />
        <p className="text-sm text-slate-500">
          Today, access is controlled by <strong className="text-slate-700">member roles</strong> (Leader, Editor, Viewer, Commenter) on the{" "}
          <Link to={`/projects/${projectId}/team`} className="font-semibold text-teal-700">
            Team
          </Link>{" "}
          page.
        </p>
      </Card>
    </div>
  );
}
