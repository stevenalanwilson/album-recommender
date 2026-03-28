import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchImageBytes } from './imageProxyService';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

function makeBodyStream(data: Buffer): ReadableStream<Uint8Array<ArrayBuffer>> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(data.buffer as ArrayBuffer));
      controller.close();
    },
  });
}

function makeResponse(
  contentType: string,
  body: Buffer | null = null,
  status = 200,
): Partial<Response> {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) => (key === 'content-type' ? contentType : null),
    } as unknown as Headers,
    body: body ? makeBodyStream(body) : null,
  };
}

describe('fetchImageBytes', () => {
  it('fetches an image from coverartarchive.org', async () => {
    const fakeBuffer = Buffer.from('fake-image-data');
    mockFetch.mockResolvedValueOnce(makeResponse('image/jpeg', fakeBuffer));

    const result = await fetchImageBytes('https://coverartarchive.org/release-group/abc/front');

    expect(result.contentType).toBe('image/jpeg');
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it('fetches an image from a subdomain of archive.org', async () => {
    const fakeBuffer = Buffer.from('fake-image-data');
    mockFetch.mockResolvedValueOnce(makeResponse('image/png', fakeBuffer));

    const result = await fetchImageBytes(
      'https://ia800501.us.archive.org/download/mbid-abc/thumb.jpg',
    );

    expect(result.contentType).toBe('image/png');
  });

  it('rejects URLs from untrusted domains', async () => {
    await expect(fetchImageBytes('https://evil.com/image.jpg')).rejects.toThrow(
      'Untrusted image hostname',
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws on invalid URLs', async () => {
    await expect(fetchImageBytes('not-a-url')).rejects.toThrow('Invalid URL');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws when the image fetch returns a non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    await expect(
      fetchImageBytes('https://coverartarchive.org/release-group/abc/front'),
    ).rejects.toThrow('Image fetch failed with status 503');
  });

  it('throws when the response content-type is not an image', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse('text/html'));

    await expect(fetchImageBytes('https://archive.org/download/mbid/img.jpg')).rejects.toThrow(
      'Unexpected content-type',
    );
  });
});
