import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { NotificationRepository } from '../repositories/notificationRepository.js';

export const notificationRouter = Router();

notificationRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const notifications = await NotificationRepository.getUserNotifications(req.user!.id);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

notificationRouter.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const updated = await NotificationRepository.markAsRead(req.params.id, req.user!.id);
    res.json({ message: 'Marked as read', notification: updated });
  } catch (err) {
    next(err);
  }
});
