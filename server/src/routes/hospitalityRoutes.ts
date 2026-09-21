import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { HospitalityRepository } from '../repositories/hospitalityRepository.js';

export const hospitalityRouter = Router();

// --- HOTELS ---
hospitalityRouter.get('/hotels', async (req, res, next) => {
  try {
    const { city, country } = req.query as { city?: string; country?: string };
    const hotels = await HospitalityRepository.listHotels(city, country);
    res.json({ hotels });
  } catch (err) {
    next(err);
  }
});

hospitalityRouter.post('/hotels', requireAuth, async (req, res, next) => {
  try {
    const hotel = await HospitalityRepository.createHotel(req.user!.id, req.body);
    res.status(201).json({ message: 'Hotel registered successfully', hotel });
  } catch (err) {
    next(err);
  }
});

hospitalityRouter.post('/hotels/:id/rooms', requireAuth, async (req, res, next) => {
  try {
    const room = await HospitalityRepository.createRoom(req.params.id, req.body);
    res.status(201).json({ message: 'Room added successfully', room });
  } catch (err) {
    next(err);
  }
});

// --- PGS ---
hospitalityRouter.get('/pgs', async (req, res, next) => {
  try {
    const { city, genderPolicy } = req.query as { city?: string; genderPolicy?: string };
    const pgs = await HospitalityRepository.listPGs(city, genderPolicy);
    res.json({ pgs });
  } catch (err) {
    next(err);
  }
});

hospitalityRouter.post('/pgs', requireAuth, async (req, res, next) => {
  try {
    const pg = await HospitalityRepository.createPG(req.user!.id, req.body);
    res.status(201).json({ message: 'PG accommodation registered', pg });
  } catch (err) {
    next(err);
  }
});

// --- HOSTELS ---
hospitalityRouter.get('/hostels', async (req, res, next) => {
  try {
    const { city } = req.query as { city?: string };
    const hostels = await HospitalityRepository.listHostels(city);
    res.json({ hostels });
  } catch (err) {
    next(err);
  }
});

hospitalityRouter.post('/hostels', requireAuth, async (req, res, next) => {
  try {
    const hostel = await HospitalityRepository.createHostel(req.user!.id, req.body);
    res.status(201).json({ message: 'Hostel registered', hostel });
  } catch (err) {
    next(err);
  }
});
