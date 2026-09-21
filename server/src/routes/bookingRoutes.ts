import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { BookingRepository } from '../repositories/bookingRepository.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

export const bookingRouter = Router();

const createBookingSchema = z.object({
  property_id: z.string().uuid().optional(),
  hotel_id: z.string().uuid().optional(),
  room_id: z.string().uuid().optional(),
  pg_id: z.string().uuid().optional(),
  hostel_id: z.string().uuid().optional(),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  guests: z.number().int().positive().default(1),
  total_amount: z.number().nonnegative(),
  currency: z.string().default('INR')
});

const updateStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed'])
});

bookingRouter.post('/', requireAuth, validate({ body: createBookingSchema }), async (req, res, next) => {
  try {
    const booking = await BookingRepository.createBooking(req.user!.id, req.body);
    res.status(201).json({ message: 'Reservation placed successfully', booking });
  } catch (err: any) {
    if (err.message.includes('unavailable') || err.message.includes('Check-out')) {
      res.status(400).json({ error: 'InvalidBooking', message: err.message });
      return;
    }
    next(err);
  }
});

bookingRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const bookings = await BookingRepository.getUserBookings(req.user!.id);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

bookingRouter.patch('/:id/status', requireAuth, validate({ body: updateStatusSchema }), async (req, res, next) => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const updated = await BookingRepository.updateStatus(req.params.id, req.body.status, req.user!.id, isAdmin);
    if (!updated) {
      res.status(404).json({ error: 'NotFound', message: 'Booking not found' });
      return;
    }
    res.json({ message: 'Booking status updated', booking: updated });
  } catch (err) {
    next(err);
  }
});
