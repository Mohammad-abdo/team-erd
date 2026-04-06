import { useEffect, useRef } from "react";
import { connectProjectSocket } from "../realtime/projectSocket.js";

function dispatch(name, projectId) {
  window.dispatchEvent(new CustomEvent(name, { detail: { projectId } }));
}

/**
 * Joins Socket.io project room (server verifies membership) and bridges events to window CustomEvents.
 * @param {string | undefined} projectId
 * @param {{ onPresencePeer?: (p: { userId: string, name: string, avatar: string | null }) => void, onPresenceLeft?: (p: { userId: string }) => void }} handlers
 */
export function useProjectRealtime(projectId, handlers = {}) {
  const { onPresencePeer, onPresenceLeft } = handlers;
  const peerRef = useRef(onPresencePeer);
  const leftRef = useRef(onPresenceLeft);
  peerRef.current = onPresencePeer;
  leftRef.current = onPresenceLeft;

  useEffect(() => {
    if (!projectId) {
      return undefined;
    }

    const socket = connectProjectSocket();
    if (!socket) {
      return undefined;
    }

    const join = () => {
      socket.emit("project:join", projectId, (res) => {
        if (!res?.ok && import.meta.env.DEV) {
          console.warn("[socket] project:join", res);
        }
      });
    };

    if (socket.connected) {
      join();
    } else {
      socket.once("connect", join);
    }

    const onErd = () => dispatch("dbforge:erd-updated", projectId);
    const onApi = () => dispatch("dbforge:api-updated", projectId);
    const onMembers = () => dispatch("dbforge:members-updated", projectId);
    const onComments = () => dispatch("dbforge:comments-updated", projectId);
    const onProject = () => dispatch("dbforge:project-updated", projectId);

    const onPeer = (payload) => peerRef.current?.(payload);
    const onLeft = (payload) => leftRef.current?.(payload);

    socket.on("erd:updated", onErd);
    socket.on("api:updated", onApi);
    socket.on("members:updated", onMembers);
    socket.on("comments:updated", onComments);
    socket.on("project:updated", onProject);
    socket.on("presence:peer", onPeer);
    socket.on("presence:left", onLeft);

    return () => {
      socket.emit("project:leave", projectId);
      socket.off("erd:updated", onErd);
      socket.off("api:updated", onApi);
      socket.off("members:updated", onMembers);
      socket.off("comments:updated", onComments);
      socket.off("project:updated", onProject);
      socket.off("presence:peer", onPeer);
      socket.off("presence:left", onLeft);
    };
  }, [projectId]);
}
