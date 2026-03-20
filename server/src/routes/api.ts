import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { handleRecommend } from '../controllers/recommendController';
import { handleArtwork } from '../controllers/artworkController';
import { handleImage } from '../controllers/imageController';

export const apiRouter = Router();

const recommendLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in a minute.' },
});

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

apiRouter.post('/recommend', recommendLimiter, handleRecommend);
apiRouter.get('/artwork', handleArtwork);
apiRouter.get('/image', handleImage);
