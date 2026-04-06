import { Navigate, useParams } from "react-router-dom";

/** Legacy /erd URL → /whiteboard */
export default function ErdRedirectPage() {
  const { projectId } = useParams();
  return <Navigate to={`/projects/${projectId}/whiteboard`} replace />;
}
