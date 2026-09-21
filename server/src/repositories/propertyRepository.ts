import { query, withTransaction } from '../db/pool.js';

export interface PropertyFilterParams {
  search?: string;
  listingType?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: string;
  amenities?: string[];
  lat?: number;
  lng?: number;
  radiusKm?: number;
  status?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'created_at_desc' | 'area_desc';
  page?: number;
  limit?: number;
}

export class PropertyRepository {
  static async searchProperties(filters: PropertyFilterParams) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Status filter (defaults to Published for public searches)
    if (filters.status) {
      conditions.push(`p.status = $${idx++}`);
      values.push(filters.status);
    } else {
      conditions.push(`p.status = 'Published'`);
    }

    if (filters.search) {
      conditions.push(`(
        p.title ILIKE $${idx} OR 
        p.description ILIKE $${idx} OR 
        p.city ILIKE $${idx} OR 
        p.address ILIKE $${idx} OR
        p.country ILIKE $${idx}
      )`);
      values.push(`%${filters.search}%`);
      idx++;
    }

    if (filters.listingType && filters.listingType !== 'All') {
      conditions.push(`p.listing_type = $${idx++}`);
      values.push(filters.listingType);
    }

    if (filters.propertyType && filters.propertyType !== 'All') {
      conditions.push(`p.property_type ILIKE $${idx++}`);
      values.push(filters.propertyType);
    }

    if (filters.city) {
      conditions.push(`p.city ILIKE $${idx++}`);
      values.push(filters.city);
    }

    if (filters.country) {
      conditions.push(`p.country ILIKE $${idx++}`);
      values.push(filters.country);
    }

    if (filters.minPrice !== undefined) {
      conditions.push(`p.price >= $${idx++}`);
      values.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(`p.price <= $${idx++}`);
      values.push(filters.maxPrice);
    }

    if (filters.minBedrooms !== undefined) {
      conditions.push(`p.bedrooms >= $${idx++}`);
      values.push(filters.minBedrooms);
    }

    if (filters.minBathrooms !== undefined) {
      conditions.push(`p.bathrooms >= $${idx++}`);
      values.push(filters.minBathrooms);
    }

    if (filters.minArea !== undefined) {
      conditions.push(`p.area >= $${idx++}`);
      values.push(filters.minArea);
    }

    if (filters.maxArea !== undefined) {
      conditions.push(`p.area <= $${idx++}`);
      values.push(filters.maxArea);
    }

    if (filters.furnished && filters.furnished !== 'All') {
      conditions.push(`p.furnished = $${idx++}`);
      values.push(filters.furnished);
    }

    // Radius search using spherical distance in km
    if (filters.lat !== undefined && filters.lng !== undefined && filters.radiusKm) {
      conditions.push(`(
        6371 * acos(
          cos(radians($${idx})) * cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians($${idx + 1})) +
          sin(radians($${idx})) * sin(radians(p.latitude))
        )
      ) <= $${idx + 2}`);
      values.push(filters.lat, filters.lng, filters.radiusKm);
      idx += 3;
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      conditions.push(`p.id IN (
        SELECT pa.property_id FROM property_amenities pa
        JOIN amenities a ON pa.amenity_id = a.id
        WHERE a.name = ANY($${idx++})
        GROUP BY pa.property_id
        HAVING COUNT(DISTINCT a.name) = ${filters.amenities.length}
      )`);
      values.push(filters.amenities);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderClause = 'ORDER BY p.created_at DESC';
    if (filters.sortBy === 'price_asc') orderClause = 'ORDER BY p.price ASC';
    if (filters.sortBy === 'price_desc') orderClause = 'ORDER BY p.price DESC';
    if (filters.sortBy === 'area_desc') orderClause = 'ORDER BY p.area DESC';

    const countSql = `SELECT COUNT(*) as total FROM properties p ${whereClause}`;
    const countRes = await query(countSql, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const dataSql = `
      SELECT p.*,
        u.name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pm.id,
              'media_type', pm.media_type,
              'storage_url', pm.storage_url,
              'thumbnail_url', pm.thumbnail_url,
              'sort_order', pm.sort_order
            )
          ) FILTER (WHERE pm.id IS NOT NULL), '[]'
        ) as media,
        COALESCE(
          json_agg(DISTINCT am.name) FILTER (WHERE am.name IS NOT NULL), '[]'
        ) as amenities
      FROM properties p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN property_media pm ON p.id = pm.property_id
      LEFT JOIN property_amenities pa ON p.id = pa.property_id
      LEFT JOIN amenities am ON pa.amenity_id = am.id
      ${whereClause}
      GROUP BY p.id, u.id
      ${orderClause}
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit, offset);
    const rowsRes = await query(dataSql, values);

    return {
      properties: rowsRes.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async findById(id: string) {
    const sql = `
      SELECT p.*,
        u.name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pm.id,
              'media_type', pm.media_type,
              'storage_url', pm.storage_url,
              'thumbnail_url', pm.thumbnail_url,
              'sort_order', pm.sort_order
            )
          ) FILTER (WHERE pm.id IS NOT NULL), '[]'
        ) as media,
        COALESCE(
          json_agg(DISTINCT am.name) FILTER (WHERE am.name IS NOT NULL), '[]'
        ) as amenities
      FROM properties p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN property_media pm ON p.id = pm.property_id
      LEFT JOIN property_amenities pa ON p.id = pa.property_id
      LEFT JOIN amenities am ON pa.amenity_id = am.id
      WHERE p.id = $1
      GROUP BY p.id, u.id
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async create(data: any, ownerId: string) {
    return withTransaction(async (client) => {
      const insertPropSql = `
        INSERT INTO properties (
          owner_id, agent_id, title, description, property_type, listing_type,
          status, price, currency, area, area_unit, bedrooms, bathrooms,
          furnished, address, city, state, country, latitude, longitude
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING *
      `;
      const propValues = [
        ownerId,
        data.agent_id || null,
        data.title,
        data.description || '',
        data.property_type,
        data.listing_type,
        data.status || 'Published',
        data.price,
        data.currency || 'INR',
        data.area,
        data.area_unit || 'sq.ft',
        data.bedrooms || 0,
        data.bathrooms || 0,
        data.furnished || 'Unfurnished',
        data.address,
        data.city,
        data.state,
        data.country,
        data.latitude,
        data.longitude
      ];
      const propRes = await client.query(insertPropSql, propValues);
      const property = propRes.rows[0];

      // Insert media if provided
      if (Array.isArray(data.media) && data.media.length > 0) {
        for (let i = 0; i < data.media.length; i++) {
          const m = data.media[i];
          await client.query(
            `INSERT INTO property_media (property_id, media_type, storage_url, thumbnail_url, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [property.id, m.media_type || 'image', m.storage_url, m.thumbnail_url || null, i]
          );
        }
      }

      // Insert amenities
      if (Array.isArray(data.amenities) && data.amenities.length > 0) {
        for (const name of data.amenities) {
          const amRes = await client.query(
            `INSERT INTO amenities (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
            [name]
          );
          const amenityId = amRes.rows[0].id;
          await client.query(
            `INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [property.id, amenityId]
          );
        }
      }

      return property;
    });
  }

  static async update(id: string, data: any, requesterId: string, isAdmin: boolean) {
    const existing = await this.findById(id);
    if (!existing) return null;
    if (existing.owner_id !== requesterId && !isAdmin) {
      throw new Error('Unauthorized to update this property');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      'title', 'description', 'property_type', 'listing_type', 'status',
      'price', 'currency', 'area', 'area_unit', 'bedrooms', 'bathrooms',
      'furnished', 'address', 'city', 'state', 'country', 'latitude', 'longitude'
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `UPDATE properties SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await query(sql, values);
    return res.rows[0];
  }

  static async delete(id: string, requesterId: string, isAdmin: boolean) {
    const existing = await this.findById(id);
    if (!existing) return false;
    if (existing.owner_id !== requesterId && !isAdmin) {
      throw new Error('Unauthorized to delete this property');
    }
    await query('DELETE FROM properties WHERE id = $1', [id]);
    return true;
  }
}
