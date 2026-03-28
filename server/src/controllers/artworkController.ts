import { Request, Response } from 'express';
import { fetchArtwork } from '../services/artworkService';
import { logger } from '../logger';

export async function handleArtwork(req: Request, res: Response): Promise<void> {
  const { artist, album } = req.query;

  if (typeof artist !== 'string' || typeof album !== 'string') {
    res.status(400).json({ error: 'artist and album query params are required' });
    return;
  }

  try {
    const artwork = await fetchArtwork(artist, album);
    res.json(artwork);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    logger.error({ error: message, artist, album }, 'artwork fetch failed');
    res.status(502).json({ error: 'Failed to fetch artwork.' });
  }
}
