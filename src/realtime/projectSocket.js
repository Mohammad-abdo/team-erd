import { io } from "socket.io-client";
import { getAccessToken } from "../lib/authStorage.js";
import { getSocketConfig } from "../lib/apiConfig.js";

/** @type {import("socket.io-client").Socket | null} */
let socketInstance = null;

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

  const { url, path } = getSocketConfig();
  socketInstance = io(url || (typeof window !== "undefined" ? window.location.origin : ""), {
    path,
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
