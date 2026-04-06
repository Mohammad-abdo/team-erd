import { api } from "./client.js";

export const reportApi = {
  getPortfolio: async () => {
    const { data } = await api.get("/report/portfolio");
    return data;
  },

  getFullReport: async (projectId, format = "json") => {
    const { data } = await api.get(`/projects/${projectId}/report`, {
      params: { format },
    });
    return data;
  },

  getStats: async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/report/stats`);
    return data;
  },

  getTables: async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/report/tables`);
    return data;
  },

  getApi: async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/report/api`);
    return data;
  },

  getTeam: async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/report/team`);
    return data;
  },
};

export default reportApi;
