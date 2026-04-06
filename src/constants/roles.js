export const MEMBER_ROLES = [
  { value: "EDITOR", label: "Editor" },
  { value: "VIEWER", label: "Viewer" },
  { value: "COMMENTER", label: "Commenter" },
];

export function roleLabel(role) {
  const map = {
    LEADER: "Leader",
    EDITOR: "Editor",
    VIEWER: "Viewer",
    COMMENTER: "Commenter",
  };
  return map[role] ?? role;
}
