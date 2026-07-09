import { resolveImageContentType } from "@/utils/imageUpload";

describe("resolveImageContentType", () => {
  it("accepts jpeg/png by mime type", () => {
    expect(resolveImageContentType({ mimeType: "image/jpeg", uri: "file://a" })).toBe("image/jpeg");
    expect(resolveImageContentType({ mimeType: "image/png", uri: "file://a" })).toBe("image/png");
    expect(resolveImageContentType({ mimeType: "IMAGE/JPEG", uri: "file://a" })).toBe("image/jpeg");
  });

  it("rejects unsupported types (HEIC, WebP) reported by mime type", () => {
    expect(resolveImageContentType({ mimeType: "image/heic", uri: "file://a.heic" })).toBeNull();
    expect(resolveImageContentType({ mimeType: "image/webp", uri: "file://a.webp" })).toBeNull();
  });

  it("falls back to the file extension when no mime type is reported", () => {
    expect(resolveImageContentType({ fileName: "photo.PNG", uri: "file://a" })).toBe("image/png");
    expect(resolveImageContentType({ uri: "file://x/photo.jpeg" })).toBe("image/jpeg");
    expect(resolveImageContentType({ uri: "file://x/photo.webp" })).toBeNull();
  });
});
