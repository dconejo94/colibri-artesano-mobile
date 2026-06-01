import client from "./client";
import type { Category, PaginatedResponse } from "@/types/store";

export async function getCategories(
  page = 1,
  limit = 50
): Promise<PaginatedResponse<Category>> {
  const { data } = await client.get<PaginatedResponse<Category>>(
    "/api/v1/categories",
    { params: { page, limit } }
  );
  return data;
}
