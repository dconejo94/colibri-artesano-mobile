// Resolve the cover image URL for a product from its variants' images.
//
// Images live on variants, not on the product directly (the backend's
// ProductImageResponseDTO carries variant_id, never product_id). This helper
// walks all variants, picks the first primary image it finds, and falls back
// to the first image of any variant, then to a placeholder.
//
// A companion `resolveAllProductImages` returns every unique image URL across
// all variants — used by the product detail gallery.

import type { Product, ProductVariant, ProductImage } from '@/types/store';

const PLACEHOLDER = 'https://via.placeholder.com/600';

/** Flatten all images from every variant into a single array. */
function collectImages(variants: ProductVariant[] | undefined): ProductImage[] {
  if (!variants?.length) return [];
  return variants.flatMap((v) => v.images ?? []);
}

/**
 * Returns the best single cover image URL for a product.
 * Priority: primary image → first image → placeholder.
 */
export function resolveProductImage(
  product: Pick<Product, 'variants'>,
): string {
  const images = collectImages(product.variants);
  if (images.length === 0) return PLACEHOLDER;
  const primary = images.find((img) => img.is_primary);
  return primary?.image_url ?? images[0].image_url;
}

/**
 * Returns all unique image URLs across all variants, sorted with primary first.
 * Used for the product detail gallery.
 */
export function resolveAllProductImages(
  product: Pick<Product, 'variants'>,
): string[] {
  const images = collectImages(product.variants);
  if (images.length === 0) return [PLACEHOLDER];

  // Sort primaries first, then deduplicate by URL.
  const sorted = [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary),
  );
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const img of sorted) {
    if (!seen.has(img.image_url)) {
      seen.add(img.image_url);
      urls.push(img.image_url);
    }
  }
  return urls;
}
