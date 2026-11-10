import type {
  LoginPayload,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
} from "../types/auth";
import { api } from "./api";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/v1/auth/login", payload);
  return data;
}

export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>(
    "/api/v1/auth/register",
    payload,
  );
  return data;
}

export async function me(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/api/v1/auth/me");
  return data;
}
