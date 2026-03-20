import { Router } from 'express';
import { handleRecommend } from '../controllers/recommendController';
import { handleArtwork } from '../controllers/artworkController';

export const apiRouter = Router();

apiRouter.post('/recommend', handleRecommend);
apiRouter.get('/artwork', handleArtwork);
