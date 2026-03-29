import { describe, it, expect } from 'vitest';
import {
  getDecadeBucket,
  computeDecadeBreakdown,
  computeGenreBreakdown,
  computeCountryBreakdown,
  computeGapObservations,
  computeSummaryStats,
  computeTopArtists,
  computeMonthlyActivity,
} from './statsUtils';
import { HistoryEntry } from '../../types/history';

function makeEntry(year: string, genres?: string[], country?: string): HistoryEntry {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    recommendation: {
      artist: 'Artist',
      album: 'Album',
      year,
      reason: 'Reason.',
      genres,
      country,
    },
    artworkResponse: { artworkUrl: null, year, appleMusicUrl: null },
  };
}

describe('getDecadeBucket', () => {
  it('maps years to decade strings', () => {
    expect(getDecadeBucket('1965')).toBe('1960s');
    expect(getDecadeBucket('1970')).toBe('1970s');
    expect(getDecadeBucket('1999')).toBe('1990s');
    expect(getDecadeBucket('2003')).toBe('2000s');
  });

  it('returns Unknown for non-numeric input', () => {
    expect(getDecadeBucket('')).toBe('Unknown');
    expect(getDecadeBucket('YYYY')).toBe('Unknown');
  });
});

describe('computeDecadeBreakdown', () => {
  it('groups entries by decade sorted chronologically', () => {
    const entries = [makeEntry('1995'), makeEntry('1998'), makeEntry('1972'), makeEntry('2010')];

    const result = computeDecadeBreakdown(entries);

    expect(result).toEqual([
      { decade: '1970s', count: 1 },
      { decade: '1990s', count: 2 },
      { decade: '2010s', count: 1 },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(computeDecadeBreakdown([])).toEqual([]);
  });
});

describe('computeGenreBreakdown', () => {
  it('counts genres case-insensitively and preserves original casing', () => {
    const entries = [
      makeEntry('1990', ['Post-Rock', 'Ambient']),
      makeEntry('1991', ['post-rock', 'Electronic']),
      makeEntry('1992', ['Ambient']),
    ];

    const result = computeGenreBreakdown(entries);

    expect(result[0].label).toBe('Post-Rock'); // first seen casing
    expect(result[0].count).toBe(2);
    expect(result[1].label).toBe('Ambient');
    expect(result[1].count).toBe(2);
  });

  it('respects topN limit', () => {
    const entries = Array.from({ length: 10 }, (_, i) => makeEntry('2000', [`Genre${i}`]));
    expect(computeGenreBreakdown(entries, 3)).toHaveLength(3);
  });

  it('returns empty array when no genres are present', () => {
    expect(computeGenreBreakdown([makeEntry('2000')])).toEqual([]);
  });
});

describe('computeCountryBreakdown', () => {
  it('counts countries and sorts by frequency', () => {
    const entries = [
      makeEntry('1990', [], 'USA'),
      makeEntry('1991', [], 'USA'),
      makeEntry('1992', [], 'UK'),
    ];

    const result = computeCountryBreakdown(entries);

    expect(result[0]).toEqual({ label: 'USA', count: 2 });
    expect(result[1]).toEqual({ label: 'UK', count: 1 });
  });

  it('skips entries without country', () => {
    const entries = [makeEntry('1990'), makeEntry('1991', [], 'Germany')];
    expect(computeCountryBreakdown(entries)).toEqual([{ label: 'Germany', count: 1 }]);
  });
});

describe('computeSummaryStats', () => {
  it('counts totals, unique artists, countries, and year span', () => {
    const entries = [
      makeEntry('1980', [], 'UK'),
      makeEntry('1990', [], 'UK'),
      makeEntry('2000', [], 'USA'),
    ];
    // Override artists to make two unique
    const modified = [
      { ...entries[0], recommendation: { ...entries[0].recommendation, artist: 'Artist A' } },
      { ...entries[1], recommendation: { ...entries[1].recommendation, artist: 'Artist B' } },
      { ...entries[2], recommendation: { ...entries[2].recommendation, artist: 'Artist A' } },
    ];

    const result = computeSummaryStats(modified);

    expect(result.totalAlbums).toBe(3);
    expect(result.uniqueArtists).toBe(2);
    expect(result.countriesExplored).toBe(2);
    expect(result.yearSpan).toEqual([1980, 2000]);
  });

  it('returns null yearSpan for empty entries', () => {
    const result = computeSummaryStats([]);
    expect(result.yearSpan).toBeNull();
    expect(result.totalAlbums).toBe(0);
  });

  it('does not count entries without country in countriesExplored', () => {
    const entries = [makeEntry('2000'), makeEntry('2001', [], 'France')];
    expect(computeSummaryStats(entries).countriesExplored).toBe(1);
  });
});

describe('computeTopArtists', () => {
  it('ranks artists by frequency descending', () => {
    const entries = [makeEntry('1990'), makeEntry('1991'), makeEntry('1992')].map((e, i) => ({
      ...e,
      recommendation: {
        ...e.recommendation,
        artist: i < 2 ? 'Popular Artist' : 'Other Artist',
      },
    }));

    const result = computeTopArtists(entries);

    expect(result[0].artist).toBe('Popular Artist');
    expect(result[0].count).toBe(2);
    expect(result[1].artist).toBe('Other Artist');
    expect(result[1].count).toBe(1);
  });

  it('respects the topN limit', () => {
    const entries = Array.from({ length: 15 }, (_, i) => ({
      ...makeEntry('2000'),
      recommendation: { ...makeEntry('2000').recommendation, artist: `Artist ${i}` },
    }));
    expect(computeTopArtists(entries, 5)).toHaveLength(5);
  });

  it('returns empty array for empty input', () => {
    expect(computeTopArtists([])).toEqual([]);
  });
});

describe('computeMonthlyActivity', () => {
  it('groups entries by month and sorts chronologically', () => {
    const entries = [
      { ...makeEntry('2000'), createdAt: '2025-01-15T10:00:00Z' },
      { ...makeEntry('2000'), createdAt: '2025-01-20T10:00:00Z' },
      { ...makeEntry('2000'), createdAt: '2025-03-05T10:00:00Z' },
    ];

    const result = computeMonthlyActivity(entries);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('2025-01');
    expect(result[0].count).toBe(2);
    expect(result[0].label).toBe("Jan '25");
    expect(result[1].key).toBe('2025-03');
    expect(result[1].count).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(computeMonthlyActivity([])).toEqual([]);
  });
});

describe('computeGapObservations', () => {
  it('surfaces missing decades within the collection range', () => {
    const entries = [makeEntry('1970'), makeEntry('1990'), makeEntry('2000')];

    const result = computeGapObservations(entries);

    expect(result.some((o) => o.includes('1980s'))).toBe(true);
  });

  it('flags country dominance above 65%', () => {
    const entries = [
      makeEntry('1990', [], 'USA'),
      makeEntry('1991', [], 'USA'),
      makeEntry('1992', [], 'USA'),
      makeEntry('1993', [], 'USA'),
      makeEntry('1994', [], 'UK'),
    ];

    const result = computeGapObservations(entries);

    expect(result.some((o) => o.includes('USA'))).toBe(true);
  });

  it('flags genre dominance above 40%', () => {
    const entries = [
      makeEntry('1990', ['Jazz']),
      makeEntry('1991', ['Jazz']),
      makeEntry('1992', ['Jazz']),
      makeEntry('1993', ['Rock']),
      makeEntry('1994', ['Pop']),
    ];

    const result = computeGapObservations(entries);

    expect(result.some((o) => o.includes('Jazz'))).toBe(true);
  });

  it('returns at most 3 observations', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry(`${1960 + i * 10}`, ['Jazz'], 'USA'),
    );
    expect(computeGapObservations(entries).length).toBeLessThanOrEqual(3);
  });

  it('does not flag country dominance with fewer than 5 country-tagged entries', () => {
    const entries = [makeEntry('1990', [], 'USA'), makeEntry('1991', [], 'USA')];
    const result = computeGapObservations(entries);
    expect(result.some((o) => o.includes('USA'))).toBe(false);
  });
});
