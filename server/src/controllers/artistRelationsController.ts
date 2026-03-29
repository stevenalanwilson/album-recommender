import { Request, Response } from 'express';
import { fetchArtistRelations } from '../services/artistRelationsService';

export async function handleArtistRelations(req: Request, res: Response): Promise<void> {
  const { artist } = req.query;

  if (typeof artist !== 'string' || artist.trim() === '') {
    res.status(400).json({ error: 'artist query param is required' });
    return;
  }

  const result = await fetchArtistRelations(artist);
  res.json(result);
}
