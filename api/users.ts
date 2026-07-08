import client from "./client";
import type { User } from "@/types/user";

export type UserUpdatePayload = Partial<{
  name: string;
  phone: string;
  address: string;
  avatar_url: string;
  bio: string;
}>;

export async function updateMe(body: UserUpdatePayload): Promise<User> {
  const { data } = await client.put<User>("/api/v1/users/me", body);
  return data;
}

import type { Product, PaginatedResponse } from "@/types/store";

export async function getFavoriteProducts(page = 1, limit = 20): Promise<PaginatedResponse<Product>> {
  const { data } = await client.get<PaginatedResponse<Product>>("/api/v1/users/me/favorites/products", {
    params: { page, limit }
  });
  return data;
}

import type { Store } from "@/types/store";

export async function getFollowedStores(page = 1, limit = 20): Promise<PaginatedResponse<Store>> {
  const { data } = await client.get<PaginatedResponse<Store>>("/api/v1/users/me/followed_stores", {
    params: { page, limit }
  });
  return data;
}
