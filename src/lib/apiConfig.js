/**
 * Environment-driven API base URL (Vite: variables must be prefixed with VITE_).
 *
 * - Local dev: leave unset → axios uses `/api` and Vite proxies to the backend.
 * - Production / direct API: set VITE_API_BASE_URL to the full prefix, e.g.
 *   https://coffee.qeemasupport.site/team-mg/api
 */

export function getApiBaseURL() {
  const v = import.meta.env.VITE_API_BASE_URL;
  if (typeof v === "string" && v.trim() !== "") {
    return v.trim().replace(/\/$/, "");
  }
  return "/api";
}

/**
 * Absolute API base for browser links (Swagger/Postman export downloads).
 * When base is relative `/api`, uses current page origin.
 */
export function getExportApiBase() {
  const b = getApiBaseURL();
  if (b.startsWith("http://") || b.startsWith("https://")) {
    return b;
  }
  if (typeof window === "undefined") {
    return b;
  }
  const path = b.startsWith("/") ? b : `/${b}`;
  return `${window.location.origin}${path}`;
}

/**
 * Socket.io: origin + path. If VITE_API_BASE_URL is absolute and ends with /api,
 * socket path becomes {pathname-without-api}/socket.io (e.g. /team-mg/socket.io).
 */
export function getSocketConfig() {
  const customPath = import.meta.env.VITE_SOCKET_PATH?.trim();
  const base = import.meta.env.VITE_API_BASE_URL?.trim();
  if (base && /^https?:\/\//i.test(base)) {
    try {
      const u = new URL(base);
      const prefix = u.pathname.replace(/\/api\/?$/i, "").replace(/\/$/, "") || "";
      const path = customPath || (prefix ? `${prefix}/socket.io` : "/socket.io");
      return { url: u.origin, path };
    } catch {
      /* fall through */
    }
  }
  if (import.meta.env.VITE_SOCKET_ORIGIN?.trim()) {
    return {
      url: import.meta.env.VITE_SOCKET_ORIGIN.trim().replace(/\/$/, ""),
      path: customPath || "/socket.io",
    };
  }
  if (import.meta.env.VITE_API_ORIGIN?.trim()) {
    return {
      url: import.meta.env.VITE_API_ORIGIN.trim().replace(/\/$/, ""),
      path: customPath || "/socket.io",
    };
  }
  if (typeof window !== "undefined") {
    return { url: window.location.origin, path: customPath || "/socket.io" };
  }
  return { url: "", path: "/socket.io" };
}
