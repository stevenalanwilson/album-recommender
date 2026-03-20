import { RecommendationResponse, ArtworkResponse } from '@shared/types';

export interface HistoryEntry {
  readonly recommendation: RecommendationResponse;
  readonly artworkResponse: ArtworkResponse;
}
