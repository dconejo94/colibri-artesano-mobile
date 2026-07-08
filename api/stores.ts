import client from "./client";
import type { Store } from "@/types/store";
import type { StoreProfile } from "@/types/vendor";

export async function createStore(body: {
  owner_id: string;
  name: string;
  description: string;
}): Promise<Store> {
  const { data } = await client.post<Store>("/api/v1/stores/", body);
  return data;
}

export async function getStoreProfile(storeId: string): Promise<StoreProfile> {
  const { data } = await client.get<StoreProfile>(
    `/api/v1/stores/${storeId}/profile`
  );
  return data;
}

export async function followStore(storeId: string): Promise<void> {
  await client.post(`/api/v1/stores/${storeId}/follow`);
}

export async function unfollowStore(storeId: string): Promise<void> {
  await client.delete(`/api/v1/stores/${storeId}/follow`);
}

export async function getStoreByOwner(ownerId: string): Promise<Store | null> {
  try {
    const { data } = await client.get<Store>(`/api/v1/stores/owner/${ownerId}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getStore(storeId: string): Promise<Store> {
  const { data } = await client.get<Store>(`/api/v1/stores/${storeId}`);
  return data;
}

export async function updateStore(
  storeId: string,
  body: { name?: string; description?: string }
): Promise<Store> {
  const { data } = await client.put<Store>(`/api/v1/stores/${storeId}`, body);
  return data;
}
