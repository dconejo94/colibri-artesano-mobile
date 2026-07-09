// Helpers for the product-image upload flow (variant-scoped SAS → blob → register).

// Cap the longest side before upload to limit bandwidth and storage usage.
export const MAX_IMAGE_DIMENSION = 1600;

// The subset of an expo-image-picker asset we read to derive the content type.
export type PickedImage = {
  mimeType?: string | null;
  fileName?: string | null;
  uri: string;
};

/**
 * Derive an allowed content type from a picked asset, or null if unsupported
 * (e.g. HEIC on iOS, WebP) so callers can reject it before uploading. The
 * backend only accepts JPEG/PNG (see azure_blob_storage.py).
 */
export function resolveImageContentType(
  asset: PickedImage
): "image/jpeg" | "image/png" | null {
  const mime = asset.mimeType?.toLowerCase();
  if (mime === "image/jpeg" || mime === "image/png") return mime;
  if (!mime) {
    // The picker didn't report a mime type — fall back to the file extension.
    const name = (asset.fileName ?? asset.uri).toLowerCase();
    if (name.endsWith(".png")) return "image/png";
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  }
  return null;
}
