import { useState, useEffect, useCallback } from 'react';
import { LibraryData, RecommendationResponse, ArtworkResponse } from '@shared/types';
import { HistoryEntry } from '../types/history';
import { fetchRecommendation as apiFetchRecommendation, fetchArtwork } from '../services/apiClient';

const HISTORY_STORAGE_KEY = 'album-recommender-history';
const LIBRARY_STORAGE_KEY = 'album-recommender-library';

function loadHistoryFromStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistoryToStorage(history: HistoryEntry[]): void {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function loadLibraryFromStorage(): LibraryData | null {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LibraryData;
  } catch {
    return null;
  }
}

function saveLibraryToStorage(data: LibraryData | null): void {
  if (data === null) {
    localStorage.removeItem(LIBRARY_STORAGE_KEY);
  } else {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(data));
  }
}

interface UseRecommendationReturn {
  libraryData: LibraryData | null;
  setLibraryData: (data: LibraryData | null) => void;
  recommendation: RecommendationResponse | null;
  artworkResponse: ArtworkResponse | null;
  history: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  fetchRecommendation: () => Promise<void>;
}

export function useRecommendation(): UseRecommendationReturn {
  const [libraryData, setLibraryData] = useState<LibraryData | null>(loadLibraryFromStorage);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [artworkResponse, setArtworkResponse] = useState<ArtworkResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistoryFromStorage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveHistoryToStorage(history);
  }, [history]);

  useEffect(() => {
    saveLibraryToStorage(libraryData);
  }, [libraryData]);

  const fetchRecommendation = useCallback(async (): Promise<void> => {
    if (!libraryData) return;

    setIsLoading(true);
    setError(null);

    const alreadySuggested = history.map((entry) => entry.recommendation.album);

    try {
      const rec = await apiFetchRecommendation({
        artistList: libraryData.artists as string[],
        albumList: libraryData.albums as string[],
        alreadySuggested,
      });

      const artwork = await fetchArtwork(rec.artist, rec.album);

      setRecommendation(rec);
      setArtworkResponse(artwork);

      const newEntry: HistoryEntry = { recommendation: rec, artworkResponse: artwork };
      setHistory((prev) => [newEntry, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [libraryData, history]);

  return {
    libraryData,
    setLibraryData,
    recommendation,
    artworkResponse,
    history,
    isLoading,
    error,
    fetchRecommendation,
  };
}
