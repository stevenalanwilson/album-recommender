import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchArtwork } from './artworkService';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchArtwork', () => {
  it('returns artworkUrl and year on successful lookup', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'release-groups': [
            {
              id: 'abc-123',
              title: 'Mezzanine',
              'first-release-date': '1998-04-20',
              'artist-credit': [{ name: 'Massive Attack' }],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: [
            {
              front: true,
              image: 'https://coverartarchive.org/image.jpg',
              thumbnails: { '500': 'https://coverartarchive.org/image-500.jpg' },
            },
          ],
        }),
      });

    const result = await fetchArtwork('Massive Attack', 'Mezzanine');

    expect(result.year).toBe('1998');
    expect(result.artworkUrl).toBe('https://coverartarchive.org/image-500.jpg');
  });

  it('returns null values when MusicBrainz returns no results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 'release-groups': [] }),
    });

    const result = await fetchArtwork('Unknown Artist', 'Unknown Album');

    expect(result.artworkUrl).toBeNull();
    expect(result.year).toBeNull();
  });

  it('returns null values when MusicBrainz request fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const result = await fetchArtwork('Artist', 'Album');

    expect(result.artworkUrl).toBeNull();
    expect(result.year).toBeNull();
  });

  it('returns year but null artwork when Cover Art Archive has no images', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'release-groups': [
            {
              id: 'xyz-456',
              title: 'Some Album',
              'first-release-date': '2005-01-01',
              'artist-credit': [{ name: 'Some Artist' }],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ images: [] }),
      });

    const result = await fetchArtwork('Some Artist', 'Some Album');

    expect(result.year).toBe('2005');
    expect(result.artworkUrl).toBeNull();
  });

  it('prioritises exact title match over partial match', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'release-groups': [
            {
              id: 'partial-1',
              title: 'Blue Lines Deluxe',
              'first-release-date': '2012-01-01',
              'artist-credit': [{ name: 'Massive Attack' }],
            },
            {
              id: 'exact-2',
              title: 'Blue Lines',
              'first-release-date': '1991-04-08',
              'artist-credit': [{ name: 'Massive Attack' }],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({ ok: false });

    const result = await fetchArtwork('Massive Attack', 'Blue Lines');

    // Should pick the exact match (id: exact-2, year 1991)
    expect(result.year).toBe('1991');
  });
});
