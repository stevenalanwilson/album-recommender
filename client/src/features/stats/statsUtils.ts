import { HistoryEntry } from '../../types/history';

export interface SummaryStats {
  readonly totalAlbums: number;
  readonly uniqueArtists: number;
  readonly countriesExplored: number;
  readonly yearSpan: readonly [number, number] | null;
}

export interface ArtistCount {
  readonly artist: string;
  readonly count: number;
}

export interface MonthActivity {
  readonly key: string; // "YYYY-MM" for sorting
  readonly label: string; // "Jan '25" for display
  readonly count: number;
}

export interface DecadeCount {
  readonly decade: string;
  readonly count: number;
}

export interface LabelCount {
  readonly label: string;
  readonly count: number;
}

export function getDecadeBucket(year: string): string {
  const y = parseInt(year, 10);
  if (isNaN(y)) return 'Unknown';
  return `${Math.floor(y / 10) * 10}s`;
}

export function computeDecadeBreakdown(entries: readonly HistoryEntry[]): DecadeCount[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const decade = getDecadeBucket(entry.recommendation.year);
    counts.set(decade, (counts.get(decade) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([decade, count]) => ({ decade, count }))
    .sort((a, b) => a.decade.localeCompare(b.decade));
}

export function computeGenreBreakdown(entries: readonly HistoryEntry[], topN = 8): LabelCount[] {
  const counts = new Map<string, number>();
  const displayLabel = new Map<string, string>();
  for (const entry of entries) {
    for (const genre of entry.recommendation.genres ?? []) {
      const key = genre.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (!displayLabel.has(key)) displayLabel.set(key, genre);
    }
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({ label: displayLabel.get(key) ?? key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function computeCountryBreakdown(entries: readonly HistoryEntry[], topN = 8): LabelCount[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const country = entry.recommendation.country;
    if (!country) continue;
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function computeSummaryStats(entries: readonly HistoryEntry[]): SummaryStats {
  const artists = new Set(entries.map((e) => e.recommendation.artist));
  const countries = new Set(
    entries.map((e) => e.recommendation.country).filter((c): c is string => !!c),
  );
  const years = entries.map((e) => parseInt(e.recommendation.year, 10)).filter((y) => !isNaN(y));

  return {
    totalAlbums: entries.length,
    uniqueArtists: artists.size,
    countriesExplored: countries.size,
    yearSpan: years.length > 0 ? [Math.min(...years), Math.max(...years)] : null,
  };
}

export function computeTopArtists(entries: readonly HistoryEntry[], topN = 10): ArtistCount[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const { artist } = entry.recommendation;
    counts.set(artist, (counts.get(artist) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function computeMonthlyActivity(entries: readonly HistoryEntry[]): MonthActivity[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    try {
      const d = new Date(entry.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    } catch {
      // ignore malformed dates
    }
  }
  return Array.from(counts.entries())
    .map(([key, count]) => {
      const [year, month] = key.split('-');
      const label = `${MONTH_NAMES[parseInt(month, 10) - 1]} '${year.slice(2)}`;
      return { key, label, count };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function computeGapObservations(entries: readonly HistoryEntry[]): readonly string[] {
  const observations: string[] = [];

  // Decade gaps: highlight decades absent within the collection's own range
  const decadeBreakdown = computeDecadeBreakdown(entries);
  const numericDecades = decadeBreakdown
    .map((d) => parseInt(d.decade, 10))
    .filter((d) => !isNaN(d))
    .sort((a, b) => a - b);

  if (numericDecades.length >= 2) {
    const min = numericDecades[0];
    const max = numericDecades[numericDecades.length - 1];
    const present = new Set(numericDecades);
    const missing: string[] = [];
    for (let d = min; d <= max; d += 10) {
      if (!present.has(d)) missing.push(`${d}s`);
    }
    // Only surface gaps when there are a small number of them — too many missing
    // decades just means a focused collection, not an obvious gap.
    if (missing.length > 0 && missing.length <= 3) {
      observations.push(`No albums from the ${missing.join(' or ')} in your picks yet.`);
    }
  }

  // Country dominance: flag when one country overwhelms the rest
  const withCountry = entries.filter((e) => !!e.recommendation.country);
  if (withCountry.length >= 5) {
    const top = computeCountryBreakdown(entries)[0];
    if (top && top.count / withCountry.length > 0.65) {
      const pct = Math.round((top.count / withCountry.length) * 100);
      observations.push(
        `${pct}% of picks are from ${top.label} — there's a big world of music out there.`,
      );
    }
  }

  // Genre bias: flag when one genre dominates recent picks
  const withGenres = entries.filter((e) => (e.recommendation.genres?.length ?? 0) > 0);
  if (withGenres.length >= 5) {
    const top = computeGenreBreakdown(entries)[0];
    if (top && top.count / withGenres.length > 0.4) {
      observations.push(
        `${top.label} features in ${top.count} of your picks — branching out might surface something unexpected.`,
      );
    }
  }

  return observations.slice(0, 3);
}
