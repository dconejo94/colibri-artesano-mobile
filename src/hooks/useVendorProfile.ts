import { useState, useEffect, useCallback } from "react";
import { getStoreProfile, followStore, unfollowStore } from "@/api/stores";
import { getStoreProducts } from "@/api/products";
import type { StoreProfile } from "@/types/vendor";
import type { Product as UIProduct } from "@/src/components/ProductCard";
import type { Product as BackendProduct } from "@/types/store";
import { normalizeError, type ApiError } from "@/src/api/errors";
import { resolveProductImage } from "@/utils/resolveProductImage";

function mapProduct(p: BackendProduct): UIProduct {
  const isAvailable =
    p.is_active && (!(p.variants?.length ?? 0) || (p.variants ?? []).some((v) => v.stock_quantity > 0));

  return {
    id: p.id,
    name: p.name,
    artisan: p.store?.name || "Colibrí Artesano",
    storeId: p.store?.id,
    price: Number(p.base_price) || 0,
    currency: "CRC",
    imageUri: resolveProductImage(p),
    status: isAvailable ? "available" : "sold_out",
    category: p.category?.name || "Artesanía",
    shortDescription: p.description?.substring(0, 50),
  };
}

export function useVendorProfile(storeId: string | undefined) {
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [profileData, productsData] = await Promise.all([
        getStoreProfile(storeId),
        getStoreProducts(storeId, 1, 20),
      ]);
      setProfile(profileData);
      setProducts(productsData.items.map(mapProduct));
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleFollow = async () => {
    if (!storeId || !profile || isFollowLoading) return;
    const wasFollowing = profile.is_following;

    // Optimistic update — the follow endpoints return 204 with no body.
    setProfile({
      ...profile,
      is_following: !wasFollowing,
      follower_count: profile.follower_count + (wasFollowing ? -1 : 1),
    });
    setIsFollowLoading(true);
    try {
      if (wasFollowing) await unfollowStore(storeId);
      else await followStore(storeId);
    } catch (err) {
      // Roll back on failure.
      setProfile((prev) =>
        prev
          ? { ...prev, is_following: wasFollowing, follower_count: prev.follower_count + (wasFollowing ? 1 : -1) }
          : prev
      );
      setError(normalizeError(err));
    } finally {
      setIsFollowLoading(false);
    }
  };

  return { profile, products, isLoading, isFollowLoading, error, refetch: fetchProfile, toggleFollow };
}
