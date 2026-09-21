import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { PropertyRepository } from '../repositories/propertyRepository.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

export const propertyRouter = Router();

const searchQuerySchema = z.object({
  search: z.string().optional(),
  listingType: z.string().optional(),
  propertyType: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minBedrooms: z.coerce.number().optional(),
  minBathrooms: z.coerce.number().optional(),
  minArea: z.coerce.number().optional(),
  maxArea: z.coerce.number().optional(),
  furnished: z.string().optional(),
  amenities: z.union([z.string(), z.array(z.string())]).optional().transform((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'created_at_desc', 'area_desc']).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20)
});

const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must have at least 5 characters'),
  description: z.string().optional(),
  property_type: z.string().min(2),
  listing_type: z.enum(['For Sale', 'For Rent', 'For Lease', 'New Project']),
  status: z.enum(['Draft', 'Pending Approval', 'Published', 'Sold', 'Rented', 'Leased', 'Inactive']).default('Published'),
  price: z.number().nonnegative(),
  currency: z.string().default('INR'),
  area: z.number().positive(),
  area_unit: z.enum(['sq.ft', 'sq.m', 'acres', 'hectares']).default('sq.ft'),
  bedrooms: z.number().int().nonnegative().default(0),
  bathrooms: z.number().int().nonnegative().default(0),
  furnished: z.enum(['Unfurnished', 'Semi-Furnished', 'Fully Furnished']).default('Unfurnished'),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  media: z.array(
    z.object({
      media_type: z.enum(['image', 'video', 'floorPlan', 'virtualTour']).default('image'),
      storage_url: z.string().url(),
      thumbnail_url: z.string().url().optional()
    })
  ).optional(),
  amenities: z.array(z.string()).optional()
});

// Search & Filter Properties
propertyRouter.get('/', validate({ query: searchQuerySchema }), async (req, res, next) => {
  try {
    const result = await PropertyRepository.searchProperties(req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get Single Property
propertyRouter.get('/:id', async (req, res, next) => {
  try {
    const property = await PropertyRepository.findById(req.params.id);
    if (!property) {
      res.status(404).json({ error: 'NotFound', message: 'Property not found' });
      return;
    }
    res.json({ property });
  } catch (err) {
    next(err);
  }
});

// Create Property (Authenticated)
propertyRouter.post('/', requireAuth, validate({ body: createPropertySchema }), async (req, res, next) => {
  try {
    const property = await PropertyRepository.create(req.body, req.user!.id);
    res.status(201).json({ message: 'Property created successfully', property });
  } catch (err) {
    next(err);
  }
});

// Update Property (Owner or Admin)
propertyRouter.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const updated = await PropertyRepository.update(req.params.id, req.body, req.user!.id, isAdmin);
    if (!updated) {
      res.status(404).json({ error: 'NotFound', message: 'Property not found' });
      return;
    }
    res.json({ message: 'Property updated successfully', property: updated });
  } catch (err) {
    next(err);
  }
});

// Delete Property (Owner or Admin)
propertyRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const deleted = await PropertyRepository.delete(req.params.id, req.user!.id, isAdmin);
    if (!deleted) {
      res.status(404).json({ error: 'NotFound', message: 'Property not found' });
      return;
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    next(err);
  }
});
