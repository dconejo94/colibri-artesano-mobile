// Shape of the backend's StoreProfileDTO — public projection of a store,
// distinct from the full `Store` type in types/store.ts (no owner_id, no
// logo_url; adds follower/product counts and the viewer's follow state).
export type StoreProfile = {
  id: string;
  name: string;
  description: string | null;
  product_count: number;
  follower_count: number;
  is_following: boolean;
};
