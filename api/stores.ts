import client from "./client";
import type { Store } from "@/types/store";

export async function createStore(body: {
  owner_id: string;
  name: string;
  description: string;
}): Promise<Store> {
  const { data } = await client.post<Store>("/api/v1/stores/", body);
  return data;
}

export async function getStoreByOwner(ownerId: string): Promise<Store | null> {
  try {
    const { data } = await client.get<{ items: Store[] }>("/api/v1/stores/", {
      params: { owner_id: ownerId }
    });
    return data.items.length > 0 ? data.items[0] : null;
  } catch (error) {
    return null;
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
