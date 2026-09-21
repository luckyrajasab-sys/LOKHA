import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { UserRepository } from '../repositories/userRepository.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

export const authRouter = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  profile_image_url: z.string().url().optional()
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await UserRepository.findById(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

authRouter.put('/profile', requireAuth, validate({ body: updateProfileSchema }), async (req, res, next) => {
  try {
    const updated = await UserRepository.updateProfile(req.user!.id, req.body);
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    next(err);
  }
});
