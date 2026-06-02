import client from "./client";
import type { Category, PaginatedResponse } from "@/types/store";

export async function getCategories(
  page = 1,
  limit = 50
): Promise<PaginatedResponse<Category>> {
  const { data } = await client.get<Category[]>("/api/v1/categories", {
    params: { page, limit }
  });
  
  // Wrap the array in a PaginatedResponse structure for compatibility
  return {
    items: data,
    total: data.length,
    page: 1,
    limit: data.length
  };
}
