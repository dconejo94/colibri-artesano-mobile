import client from "./client";
import type { User, UserRole } from "@/types/user";

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  store_name?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function register(body: RegisterPayload): Promise<AuthTokens> {
  const { data } = await client.post<AuthTokens>("/api/v1/auth/register", body);
  return data;
}

export async function login(body: LoginPayload): Promise<AuthTokens> {
  const { data } = await client.post<AuthTokens>("/api/v1/auth/login", body);
  return data;
}

export async function refresh(
  refreshToken: string
): Promise<{ access_token: string; token_type: string }> {
  const { data } = await client.post<{ access_token: string; token_type: string }>(
    "/api/v1/auth/refresh",
    { refresh_token: refreshToken }
  );
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await client.get<User>("/api/v1/users/me");
  return data;
}
