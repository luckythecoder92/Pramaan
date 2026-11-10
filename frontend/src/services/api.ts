import axios from "axios";
import {
  clearSession,
  getAccessToken,
  notifyAuthExpired,
} from "./authStorage";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL =
  configuredBaseUrl && configuredBaseUrl.length > 0
    ? configuredBaseUrl.replace(/\/+$/, "")
    : "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const url = error.config?.url ?? "";
      const isAuthEndpoint =
        url.includes("/api/v1/auth/login") ||
        url.includes("/api/v1/auth/register");

      if (status === 401 && !isAuthEndpoint && getAccessToken()) {
        clearSession();
        notifyAuthExpired();
      }
    }

    return Promise.reject(error);
  },
);
