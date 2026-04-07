import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getAccessToken } from "../../lib/authStorage.js";
import { clearTokens } from "../../lib/authStorage.js";
import { getMe } from "../../api/users.js";
import { logout as apiLogout } from "../../api/auth.js";
import { getRefreshToken } from "../../lib/authStorage.js";
import { useSessionStore } from "../../store/useSessionStore.js";
import { Spinner } from "../ui/Spinner.jsx";
import { AppSidebar, MobileTopBar } from "./AppSidebar.jsx";
import { connectProjectSocket, disconnectProjectSocket } from "../../realtime/projectSocket.js";
import { useWhiteboardFocusStore } from "../../store/useWhiteboardFocusStore.js";

export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isWhiteboard = /\/projects\/[^/]+\/whiteboard\/?$/.test(pathname);
  const whiteboardFocus = useWhiteboardFocusStore((s) => s.focus);
  const clearWhiteboardFocus = useWhiteboardFocusStore((s) => s.clearFocus);
  const hideGlobalNav = isWhiteboard && whiteboardFocus;
  const user = useSessionStore((s) => s.user);
  const hydrated = useSessionStore((s) => s.hydrated);
  const setUser = useSessionStore((s) => s.setUser);
  const setHydrated = useSessionStore((s) => s.setHydrated);
  const clearSession = useSessionStore((s) => s.clearSession);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setHydrated(true);
      clearSession();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await getMe();
        if (!cancelled) {
          setUser(data.user);
        }
      } catch {
        if (!cancelled) {
          clearTokens();
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearSession, setHydrated, setUser]);

  useEffect(() => {
    if (user && getAccessToken()) {
      connectProjectSocket();
    }
  }, [user]);

  useEffect(() => {
    if (!isWhiteboard) {
      clearWhiteboardFocus();
    }
  }, [isWhiteboard, clearWhiteboardFocus]);

  async function handleLogout() {
    try {
      const refreshToken = getRefreshToken();
      await apiLogout(refreshToken ? { refreshToken } : {});
    } catch {
      /* ignore */
    }
    disconnectProjectSocket();
    clearTokens();
    clearSession();
    navigate("/auth/login", { replace: true });
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-10 w-10" />
          <p className="text-sm font-medium text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!getAccessToken()) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className={`flex h-dvh overflow-hidden ${isWhiteboard ? "bg-zinc-950" : ""}`}>
      {!hideGlobalNav ? (
        <AppSidebar
          user={user}
          onLogout={handleLogout}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {!hideGlobalNav ? <MobileTopBar onOpenMenu={() => setSidebarOpen(true)} /> : null}

        <main
          className={
            isWhiteboard
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "flex-1 overflow-x-hidden overflow-y-auto"
          }
        >
          <div
            className={
              isWhiteboard
                ? "flex min-h-0 min-w-0 flex-1 flex-col"
                : "mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
            }
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
