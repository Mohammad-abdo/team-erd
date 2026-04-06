import { io } from "socket.io-client";
import { getAccessToken } from "../lib/authStorage.js";

/** @type {import("socket.io-client").Socket | null} */
let socketInstance = null;

/**
 * Socket.io server URL.
 * - Default: same origin (Vite proxies /socket.io → API in dev).
 * - Set VITE_API_ORIGIN=http://localhost:4000 if the proxy/WebSocket path misbehaves.
 */
function socketUrl() {
  if (typeof window === "undefined") {
    return "";
  }
  const explicit = import.meta.env.VITE_API_ORIGIN;
  if (typeof explicit === "string" && explicit.trim() !== "") {
    return explicit.replace(/\/$/, "");
  }
  return window.location.origin;
}

/**
 * Returns connected socket, or null if no access token.
 * Reuses one connection for the whole SPA session.
 * Avoids disconnecting a socket that is still handshaking (React Strict Mode remounts).
 */
export function connectProjectSocket() {
  const token = getAccessToken();
  if (!token) {
    disconnectProjectSocket();
    return null;
  }

  if (socketInstance) {
    socketInstance.auth = { token };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  socketInstance = io(socketUrl(), {
    path: "/socket.io",
    autoConnect: true,
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  socketInstance.on("connect_error", () => {
    const t = getAccessToken();
    if (t && socketInstance) {
      socketInstance.auth = { token: t };
      socketInstance.connect();
    }
  });

  return socketInstance;
}

export function getProjectSocket() {
  return socketInstance;
}

export function disconnectProjectSocket() {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/**
 * After JWT refresh, update handshake auth for the next reconnect.
 */
export function updateSocketAuthToken() {
  const t = getAccessToken();
  if (t && socketInstance) {
    socketInstance.auth = { token: t };
  }
}
