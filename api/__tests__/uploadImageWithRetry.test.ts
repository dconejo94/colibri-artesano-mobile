import client from "@/api/client";
import { uploadImageWithRetry } from "@/api/products";

jest.mock("@/api/client", () => ({ __esModule: true, default: { post: jest.fn() } }));

const mockPost = (client as unknown as { post: jest.Mock }).post;

// uploadImageToBlob does fetch(fileUri) → blob, then fetch(uploadUrl, {PUT}).
// Drive each PUT's outcome from `putResults` in order.
function mockFetch(putResults: boolean[]) {
  let putIndex = 0;
  const fetchMock = jest.fn((_input: unknown, init?: { method?: string }) => {
    if (init?.method === "PUT") {
      const ok = putResults[putIndex++];
      return Promise.resolve({ ok, status: ok ? 201 : 403, statusText: ok ? "Created" : "Forbidden" });
    }
    return Promise.resolve({ blob: () => Promise.resolve(new Uint8Array()) });
  });
  (global as unknown as { fetch: unknown }).fetch = fetchMock;
  return fetchMock;
}

const sasUrl = (n: string) => ({ data: { upload_url: `u-${n}`, blob_url: `b-${n}`, expires_at: "" } });

beforeEach(() => jest.clearAllMocks());

describe("uploadImageWithRetry", () => {
  it("uploads once and returns the blob_url on success", async () => {
    mockPost.mockResolvedValueOnce(sasUrl("1"));
    mockFetch([true]);

    const url = await uploadImageWithRetry("p", "v", "file://x.jpg", "x.jpg", "image/jpeg");

    expect(url).toBe("b-1");
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("requests a fresh SAS URL and retries once when the PUT fails (expired SAS)", async () => {
    mockPost.mockResolvedValueOnce(sasUrl("1")).mockResolvedValueOnce(sasUrl("2"));
    mockFetch([false, true]); // first PUT 403, retry PUT ok

    const url = await uploadImageWithRetry("p", "v", "file://x.jpg", "x.jpg", "image/jpeg");

    expect(url).toBe("b-2"); // the retried URL's blob
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("gives up after a single retry (does not loop forever)", async () => {
    mockPost.mockResolvedValue(sasUrl("x"));
    mockFetch([false, false]); // both PUTs fail

    await expect(
      uploadImageWithRetry("p", "v", "file://x.jpg", "x.jpg", "image/jpeg")
    ).rejects.toThrow();
    expect(mockPost).toHaveBeenCalledTimes(2);
  });
});
