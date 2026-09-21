import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { InteractionRepository } from '../repositories/interactionRepository.js';

export const interactionRouter = Router();

// --- FAVORITES (With duplicate prevention) ---
interactionRouter.get('/favorites', requireAuth, async (req, res, next) => {
  try {
    const favorites = await InteractionRepository.getUserFavorites(req.user!.id);
    res.json({ favorites });
  } catch (err) {
    next(err);
  }
});

interactionRouter.post('/favorites', requireAuth, async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      res.status(400).json({ error: 'BadRequest', message: 'propertyId is required' });
      return;
    }
    const result = await InteractionRepository.addFavorite(req.user!.id, propertyId);
    res.status(201).json({ message: 'Property saved to favorites', favorite: result });
  } catch (err) {
    next(err);
  }
});

interactionRouter.delete('/favorites/:propertyId', requireAuth, async (req, res, next) => {
  try {
    const removed = await InteractionRepository.removeFavorite(req.user!.id, req.params.propertyId);
    res.json({ message: 'Property removed from favorites', removed });
  } catch (err) {
    next(err);
  }
});

// --- SAVED SEARCHES ---
interactionRouter.get('/saved-searches', requireAuth, async (req, res, next) => {
  try {
    const searches = await InteractionRepository.getUserSavedSearches(req.user!.id);
    res.json({ savedSearches: searches });
  } catch (err) {
    next(err);
  }
});

interactionRouter.post('/saved-searches', requireAuth, async (req, res, next) => {
  try {
    const { name, searchParameters } = req.body;
    const search = await InteractionRepository.createSavedSearch(req.user!.id, name, searchParameters);
    res.status(201).json({ message: 'Search criteria saved', search });
  } catch (err) {
    next(err);
  }
});

// --- INQUIRIES ---
interactionRouter.get('/inquiries', requireAuth, async (req, res, next) => {
  try {
    const inquiries = await InteractionRepository.getUserInquiries(req.user!.id);
    res.json({ inquiries });
  } catch (err) {
    next(err);
  }
});

interactionRouter.post('/inquiries', requireAuth, async (req, res, next) => {
  try {
    const { propertyId, message } = req.body;
    if (!propertyId || !message) {
      res.status(400).json({ error: 'BadRequest', message: 'propertyId and message are required' });
      return;
    }
    const inquiry = await InteractionRepository.createInquiry(req.user!.id, propertyId, message);
    res.status(201).json({ message: 'Inquiry submitted', inquiry });
  } catch (err) {
    next(err);
  }
});

// --- VIEWINGS ---
interactionRouter.get('/viewings', requireAuth, async (req, res, next) => {
  try {
    const viewings = await InteractionRepository.getUserViewings(req.user!.id);
    res.json({ viewings });
  } catch (err) {
    next(err);
  }
});

interactionRouter.post('/viewings', requireAuth, async (req, res, next) => {
  try {
    const { propertyId, scheduledAt, notes } = req.body;
    if (!propertyId || !scheduledAt) {
      res.status(400).json({ error: 'BadRequest', message: 'propertyId and scheduledAt are required' });
      return;
    }
    const viewing = await InteractionRepository.createViewing(req.user!.id, propertyId, scheduledAt, notes);
    res.status(201).json({ message: 'Viewing scheduled', viewing });
  } catch (err) {
    next(err);
  }
});

// --- REVIEWS ---
interactionRouter.get('/reviews', async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query as { targetType: any; targetId: string };
    if (!targetType || !targetId) {
      res.status(400).json({ error: 'BadRequest', message: 'targetType and targetId are required' });
      return;
    }
    const reviews = await InteractionRepository.getReviews(targetType, targetId);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

interactionRouter.post('/reviews', requireAuth, async (req, res, next) => {
  try {
    const review = await InteractionRepository.createReview(req.user!.id, req.body);
    res.status(201).json({ message: 'Review published', review });
  } catch (err) {
    next(err);
  }
});
