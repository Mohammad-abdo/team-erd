import { api } from "./client.js";

export function listProjects() {
  return api.get("/projects");
}

export function createProject(payload) {
  return api.post("/projects", payload);
}

export function getProject(id) {
  return api.get(`/projects/${id}`);
}

export function updateProject(id, payload) {
  return api.put(`/projects/${id}`, payload);
}

export function deleteProject(id) {
  return api.delete(`/projects/${id}`);
}

export function listMembers(projectId) {
  return api.get(`/projects/${projectId}/members`);
}

export function inviteMember(projectId, payload) {
  return api.post(`/projects/${projectId}/members/invite`, payload);
}

export function updateMemberRole(projectId, userId, payload) {
  return api.put(`/projects/${projectId}/members/${userId}/role`, payload);
}

export function removeMember(projectId, userId) {
  return api.delete(`/projects/${projectId}/members/${userId}`);
}

export function acceptInvitation(payload) {
  return api.post("/invitations/accept", payload);
}

export function getErdTables(projectId) {
  return api.get(`/projects/${projectId}/erd/tables`);
}

export function createErdTable(projectId, payload) {
  return api.post(`/projects/${projectId}/erd/tables`, payload);
}

export function deleteErdTable(projectId, tableId) {
  return api.delete(`/projects/${projectId}/erd/tables/${tableId}`);
}

export function updateErdTable(projectId, tableId, payload) {
  return api.put(`/projects/${projectId}/erd/tables/${tableId}`, payload);
}

export function createErdColumn(projectId, tableId, payload) {
  return api.post(`/projects/${projectId}/erd/tables/${tableId}/columns`, payload);
}

export function updateErdColumn(projectId, tableId, columnId, payload) {
  return api.put(`/projects/${projectId}/erd/tables/${tableId}/columns/${columnId}`, payload);
}

export function deleteErdColumn(projectId, tableId, columnId) {
  return api.delete(`/projects/${projectId}/erd/tables/${tableId}/columns/${columnId}`);
}

export function getErdRelations(projectId) {
  return api.get(`/projects/${projectId}/erd/relations`);
}

export function createErdRelation(projectId, payload) {
  return api.post(`/projects/${projectId}/erd/relations`, payload);
}

export function deleteErdRelation(projectId, relationId) {
  return api.delete(`/projects/${projectId}/erd/relations/${relationId}`);
}

export function getApiTestSettings(projectId) {
  return api.get(`/projects/${projectId}/api/test-settings`);
}

export function saveApiTestSettings(projectId, payload) {
  return api.put(`/projects/${projectId}/api/test-settings`, payload);
}

export function getApiGroups(projectId) {
  return api.get(`/projects/${projectId}/api/groups`);
}

export function createApiGroup(projectId, payload) {
  return api.post(`/projects/${projectId}/api/groups`, payload);
}

export function updateApiGroup(projectId, groupId, payload) {
  return api.put(`/projects/${projectId}/api/groups/${groupId}`, payload);
}

export function deleteApiGroup(projectId, groupId) {
  return api.delete(`/projects/${projectId}/api/groups/${groupId}`);
}

export function createApiRoute(projectId, groupId, payload) {
  return api.post(`/projects/${projectId}/api/groups/${groupId}/routes`, payload);
}

export function updateApiRoute(projectId, routeId, payload) {
  return api.put(`/projects/${projectId}/api/routes/${routeId}`, payload);
}

export function deleteApiRoute(projectId, routeId) {
  return api.delete(`/projects/${projectId}/api/routes/${routeId}`);
}

export function createApiParameter(projectId, routeId, payload) {
  return api.post(`/projects/${projectId}/api/routes/${routeId}/parameters`, payload);
}

export function updateApiParameter(projectId, routeId, paramId, payload) {
  return api.put(`/projects/${projectId}/api/routes/${routeId}/parameters/${paramId}`, payload);
}

export function deleteApiParameter(projectId, routeId, paramId) {
  return api.delete(`/projects/${projectId}/api/routes/${routeId}/parameters/${paramId}`);
}

export function createApiResponse(projectId, routeId, payload) {
  return api.post(`/projects/${projectId}/api/routes/${routeId}/responses`, payload);
}

export function updateApiResponse(projectId, routeId, responseId, payload) {
  return api.put(`/projects/${projectId}/api/routes/${routeId}/responses/${responseId}`, payload);
}

export function deleteApiResponse(projectId, routeId, responseId) {
  return api.delete(`/projects/${projectId}/api/routes/${routeId}/responses/${responseId}`);
}

export function importErdSchema(projectId, payload) {
  return api.post(`/projects/${projectId}/import/erd`, payload);
}

export function importApiDocs(projectId, payload) {
  return api.post(`/projects/${projectId}/import/api`, payload);
}

export function importSwagger(projectId, payload) {
  return api.post(`/projects/${projectId}/import/swagger`, payload);
}

export function importPostman(projectId, payload) {
  return api.post(`/projects/${projectId}/import/postman`, payload);
}

export function getExportSwaggerUrl(projectId, token) {
  return `/api/projects/${projectId}/export/swagger?token=${token}`;
}

export function getExportPostmanUrl(projectId, token) {
  return `/api/projects/${projectId}/export/postman?token=${token}`;
}

export function exportSwagger(projectId) {
  return api.get(`/projects/${projectId}/export/swagger`);
}

export function exportPostman(projectId) {
  return api.get(`/projects/${projectId}/export/postman`);
}

export function getActivityFeed(projectId, params) {
  return api.get(`/projects/${projectId}/activity/feed`, { params });
}

export function getComments(projectId, params) {
  return api.get(`/projects/${projectId}/comments`, { params });
}

export function createComment(projectId, payload) {
  return api.post(`/projects/${projectId}/comments`, payload);
}

export function resolveComment(projectId, commentId) {
  return api.put(`/projects/${projectId}/comments/${commentId}/resolve`);
}

export function listNotifications(params) {
  return api.get("/notifications", { params });
}

export function markNotificationRead(id) {
  return api.post(`/notifications/${id}/read`);
}
