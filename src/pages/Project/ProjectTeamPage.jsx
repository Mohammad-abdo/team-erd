import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Shield, UserMinus, UserPlus, Users } from "lucide-react";
import { inviteMember, listMembers, removeMember, updateMemberRole } from "../../api/projects.js";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { MEMBER_ROLES, roleLabel } from "../../constants/roles.js";

export default function ProjectTeamPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const { project } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EDITOR");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteToken, setInviteToken] = useState("");

  const isLeader = project?.myRole === "LEADER";
  const canInvite = project?.myRole === "LEADER" || project?.myRole === "EDITOR";

  async function loadMembers() {
    setMembersLoading(true);
    setError("");
    try {
      const { data } = await listMembers(projectId);
      setMembers(data.members ?? []);
    } catch (e) {
      setError(e.response?.data?.error ?? "Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  async function onInvite(e) {
    e.preventDefault();
    setInviteBusy(true);
    setInviteToken("");
    setError("");
    try {
      const { data } = await inviteMember(projectId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteToken(data.invitation?.token ?? "");
      await loadMembers();
    } catch (e) {
      setError(e.response?.data?.error ?? "Invite failed");
    } finally {
      setInviteBusy(false);
    }
  }

  async function onRoleChange(userId, role) {
    setError("");
    try {
      await updateMemberRole(projectId, userId, { role });
      await loadMembers();
    } catch (e) {
      setError(e.response?.data?.error ?? "Could not update role");
    }
  }

  async function onRemove(userId) {
    if (!window.confirm("Remove this member from the project?")) {
      return;
    }
    setError("");
    try {
      await removeMember(projectId, userId);
      await loadMembers();
    } catch (e) {
      setError(e.response?.data?.error ?? "Could not remove member");
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-lg">
            <Users className="h-5 w-5" />
          </span>
          Team & invites
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Add people by email and assign roles. Editors and leaders can invite; only the leader can
          change roles or remove members.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50/80 p-4 text-sm text-red-700 ring-1 ring-red-200/60">
          {error}
        </div>
      ) : null}

      {canInvite ? (
        <Card className="border-teal-200/40 ring-1 ring-teal-200/30">
          <CardHeader
            title={
              <span className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-teal-600" />
                Invite someone
              </span>
            }
            description="They must sign in with the same email to accept (use Accept invite in the sidebar)."
          />
          <form className="grid gap-4 lg:grid-cols-12" onSubmit={onInvite}>
            <div className="lg:col-span-5">
              <Input
                id="invite-email"
                label="Email address"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="lg:col-span-3">
              <Select
                id="invite-role"
                label="Role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                {MEMBER_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end lg:col-span-4">
              <Button type="submit" className="w-full lg:w-auto" disabled={inviteBusy}>
                <Mail className="h-4 w-4" />
                {inviteBusy ? "Sending..." : "Send invitation"}
              </Button>
            </div>
          </form>
          {inviteToken ? (
            <div className="mt-4 rounded-xl bg-amber-50/80 p-4 text-sm text-amber-950 ring-1 ring-amber-200/60">
              <p className="font-bold">Development: invitation token</p>
              <p className="mt-1 break-all font-mono text-xs">{inviteToken}</p>
            </div>
          ) : null}
        </Card>
      ) : (
        <Card className="ring-1 ring-slate-200/40">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-500">
              Your role can&apos;t send invites. Ask a leader or editor to add you to invite others.
            </p>
          </div>
        </Card>
      )}

      <Card className="ring-1 ring-slate-200/40">
        <CardHeader
          title={`Members (${members.length})`}
          description="Everyone with access to this project."
        />
        {membersLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100/80">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-4 py-5 first:pt-0 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600">
                    {(m.user.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{m.user.name}</p>
                    <p className="text-sm text-slate-500">{m.user.email}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Joined {new Date(m.joinedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="success">{roleLabel(m.role)}</Badge>
                  {isLeader && m.user.id !== project.leaderId ? (
                    <>
                      <Select
                        id={`role-${m.user.id}`}
                        aria-label={`Change role for ${m.user.name}`}
                        value={m.role}
                        onChange={(e) => onRoleChange(m.user.id, e.target.value)}
                        className="w-40 py-2 text-sm"
                      >
                        {MEMBER_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </Select>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => onRemove(m.user.id)}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
