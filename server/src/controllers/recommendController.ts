import { Request, Response } from 'express';
import { getRecommendation } from '../services/recommendationService';
import { RecommendationRequest, VALID_GENRES } from '@shared/types';
import { logger } from '../logger';

const MAX_LIST_LENGTH = 5000;
const VALID_GENRE_SET = new Set<string>(VALID_GENRES);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export async function handleRecommend(req: Request, res: Response): Promise<void> {
  const body = req.body as Partial<RecommendationRequest>;

  if (
    !isStringArray(body.artistList) ||
    !isStringArray(body.albumList) ||
    !isStringArray(body.alreadySuggested)
  ) {
    res
      .status(400)
      .json({ error: 'artistList, albumList, and alreadySuggested must be arrays of strings' });
    return;
  }

  if (body.artistList.length === 0) {
    res.status(400).json({ error: 'artistList must not be empty' });
    return;
  }

  if (body.artistList.length > MAX_LIST_LENGTH || body.albumList.length > MAX_LIST_LENGTH) {
    res.status(400).json({ error: `Lists must not exceed ${MAX_LIST_LENGTH} items` });
    return;
  }

  if (
    body.genre !== undefined &&
    (typeof body.genre !== 'string' || !VALID_GENRE_SET.has(body.genre))
  ) {
    res.status(400).json({ error: 'genre must be one of the supported genres' });
    return;
  }

  try {
    const recommendation = await getRecommendation({
      artistList: body.artistList,
      albumList: body.albumList,
      alreadySuggested: body.alreadySuggested,
      ...(body.genre ? { genre: body.genre } : {}),
    });
    res.json(recommendation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error: message }, 'recommendation request failed');
    res.status(500).json({ error: message });
  }
}
