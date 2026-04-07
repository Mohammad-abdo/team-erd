import axios from "axios";
import { getApiBaseURL } from "../lib/apiConfig.js";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../lib/authStorage.js";
import { updateSocketAuthToken } from "../realtime/projectSocket.js";

const baseURL = getApiBaseURL();

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

/** Single in-flight refresh so parallel 401s (e.g. React Strict Mode) do not rotate the refresh token twice and invalidate the session. */
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          return null;
        }
        const { data } = await refreshClient.post("/auth/refresh", { refreshToken });
        setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        updateSocketAuthToken();
        return data.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err.response?.status;
    const url = String(original?.url ?? "");

    if (status !== 401 || original?._retry) {
      return Promise.reject(err);
    }

    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password")
    ) {
      return Promise.reject(err);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.assign("/auth/login");
      }
      return Promise.reject(err);
    }

    original._retry = true;

    const accessToken = await refreshAccessToken();
    if (!accessToken) {
      clearTokens();
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.assign("/auth/login");
      }
      return Promise.reject(err);
    }

    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${accessToken}`;
    return api.request(original);
  },
);
