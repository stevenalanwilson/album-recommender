import { Request, Response } from 'express';
import { getRecommendation } from '../services/recommendationService';
import { RecommendationRequest } from '../../shared/types';

export async function handleRecommend(req: Request, res: Response): Promise<void> {
  const body = req.body as Partial<RecommendationRequest>;

  if (
    !Array.isArray(body.artistList) ||
    !Array.isArray(body.albumList) ||
    !Array.isArray(body.alreadySuggested)
  ) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  try {
    const recommendation = await getRecommendation({
      artistList: body.artistList,
      albumList: body.albumList,
      alreadySuggested: body.alreadySuggested,
    });
    res.json(recommendation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}
