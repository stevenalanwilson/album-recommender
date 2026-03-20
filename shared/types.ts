export const VALID_GENRES = [
  'Electronic / Dance',
  'Hip-Hop / Beats',
  'Indie / Alternative',
  'Post-Punk / New Wave',
  'Art Rock',
  'Ambient / Neoclassical',
  'Folk',
  'Jazz',
  'Drum & Bass / Breakbeat',
  'Metal',
  'Soul / R&B',
  'Classical',
] as const;

export type Genre = (typeof VALID_GENRES)[number];

export interface LibraryData {
  readonly artists: readonly string[];
  readonly albums: readonly string[];
  readonly trackCount: number;
}

export interface RecommendationRequest {
  readonly artistList: readonly string[];
  readonly albumList: readonly string[];
  readonly alreadySuggested: readonly string[];
  readonly genre?: string;
}

export interface RecommendationResponse {
  readonly artist: string;
  readonly album: string;
  readonly year: string;
  readonly reason: string;
}

export interface ArtworkResponse {
  readonly artworkUrl: string | null;
  readonly year: string | null;
  readonly appleMusicUrl: string | null;
}
