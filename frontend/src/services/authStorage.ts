import type { AuthUser } from "../types/auth";

const TOKEN_KEY = "pramaan_access_token";
const USER_KEY = "pramaan_user";

export const AUTH_EXPIRED_EVENT = "pramaan:auth-expired";

function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).id === "string" &&
    typeof (value as Record<string, unknown>).email === "string"
  );
}

export function getAccessToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isAuthUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // The session remains usable in memory if storage is unavailable.
  }
}

export function saveToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // The session remains usable in memory if storage is unavailable.
  }
}

export function saveStoredUser(user: AuthUser): void {
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // The session remains usable in memory if storage is unavailable.
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // Nothing else can be done if storage is unavailable.
  }
}

export function notifyAuthExpired(): void {
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}
