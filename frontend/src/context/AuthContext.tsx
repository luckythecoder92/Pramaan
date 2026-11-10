import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  login as loginRequest,
  me as meRequest,
  register as registerRequest,
} from "../services/auth.service";
import {
  AUTH_EXPIRED_EVENT,
  clearSession,
  getAccessToken,
  getStoredUser,
  saveSession,
  saveStoredUser,
  saveToken,
} from "../services/authStorage";
import type { AuthUser } from "../types/auth";
import { getApiErrorMessage } from "../utils/errors";
import { useToast } from "./ToastContext";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface RegisterOutcome {
  requiresConfirmation: boolean;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<RegisterOutcome>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { pushToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getAccessToken();

      if (!token) {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
        return;
      }

      try {
        const response = await meRequest();

        if (cancelled) {
          return;
        }

        saveStoredUser(response.user);
        setUser(response.user);
        setStatus("authenticated");
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSession();
          setUser(null);
          setStatus("unauthenticated");
          return;
        }

        const storedUser = getStoredUser();

        if (storedUser) {
          // Keep a previously verified session usable during a temporary outage.
          setUser(storedUser);
          setStatus("authenticated");
          pushToast({
            variant: "warning",
            title: "Session could not be verified",
            description: getApiErrorMessage(error),
          });
        } else {
          setStatus("unauthenticated");
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [pushToast]);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setStatus("unauthenticated");
      pushToast({
        variant: "warning",
        title: "Session expired",
        description: "Please sign in again to continue.",
      });
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [pushToast]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest({
      email: email.trim(),
      password,
    });

    saveToken(response.access_token);

    try {
      const profile = await meRequest();
      saveSession(response.access_token, profile.user);
      setUser(profile.user);
      setStatus("authenticated");
    } catch (error) {
      clearSession();
      setUser(null);
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string): Promise<RegisterOutcome> => {
      const response = await registerRequest({
        email: email.trim(),
        password,
      });

      if (!response.access_token) {
        return { requiresConfirmation: true, user: response.user };
      }

      saveSession(response.access_token, response.user);
      setUser(response.user);
      setStatus("authenticated");

      return { requiresConfirmation: false, user: response.user };
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
    pushToast({
      variant: "info",
      title: "Signed out",
      description: "Your session has been cleared on this device.",
    });
  }, [pushToast]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated" && user !== null,
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
