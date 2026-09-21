import { query } from '../db/pool.js';

export class InteractionRepository {
  // --- FAVORITES (Duplicate Prevention via Unique Constraint) ---
  static async addFavorite(userId: string, propertyId: string) {
    const sql = `
      INSERT INTO favorites (user_id, property_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, property_id) DO NOTHING
      RETURNING *
    `;
    const res = await query(sql, [userId, propertyId]);
    return res.rows[0] || { message: 'Already favorited' };
  }

  static async removeFavorite(userId: string, propertyId: string) {
    const res = await query(
      'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2 RETURNING id',
      [userId, propertyId]
    );
    return res.rowCount ? res.rowCount > 0 : false;
  }

  static async getUserFavorites(userId: string) {
    const sql = `
      SELECT f.id as favorite_id, f.created_at as favorited_at, p.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pm.id,
              'storage_url', pm.storage_url,
              'media_type', pm.media_type
            )
          ) FILTER (WHERE pm.id IS NOT NULL), '[]'
        ) as media
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      LEFT JOIN property_media pm ON p.id = pm.property_id
      WHERE f.user_id = $1
      GROUP BY f.id, p.id
      ORDER BY f.created_at DESC
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  }

  // --- SAVED SEARCHES ---
  static async createSavedSearch(userId: string, name: string, searchParameters: any) {
    const sql = `
      INSERT INTO saved_searches (user_id, name, search_parameters)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const res = await query(sql, [userId, name, JSON.stringify(searchParameters)]);
    return res.rows[0];
  }

  static async getUserSavedSearches(userId: string) {
    const res = await query('SELECT * FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows;
  }

  // --- INQUIRIES ---
  static async createInquiry(userId: string, propertyId: string, message: string) {
    // Look up owner of property
    const propRes = await query('SELECT owner_id FROM properties WHERE id = $1', [propertyId]);
    if (propRes.rows.length === 0) throw new Error('Property not found');
    const ownerId = propRes.rows[0].owner_id;

    const sql = `
      INSERT INTO inquiries (user_id, property_id, owner_id, message, status)
      VALUES ($1, $2, $3, $4, 'Pending')
      RETURNING *
    `;
    const res = await query(sql, [userId, propertyId, ownerId, message]);
    return res.rows[0];
  }

  static async getUserInquiries(userId: string) {
    const sql = `
      SELECT i.*, p.title as property_title, p.city as property_city
      FROM inquiries i
      JOIN properties p ON i.property_id = p.id
      WHERE i.user_id = $1 OR i.owner_id = $1
      ORDER BY i.created_at DESC
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  }

  // --- VIEWINGS ---
  static async createViewing(userId: string, propertyId: string, scheduledAt: string, notes?: string) {
    const propRes = await query('SELECT agent_id, owner_id FROM properties WHERE id = $1', [propertyId]);
    if (propRes.rows.length === 0) throw new Error('Property not found');
    const agentId = propRes.rows[0].agent_id || propRes.rows[0].owner_id;

    const sql = `
      INSERT INTO viewings (user_id, property_id, agent_id, scheduled_at, status, notes)
      VALUES ($1, $2, $3, $4, 'Scheduled', $5)
      RETURNING *
    `;
    const res = await query(sql, [userId, propertyId, agentId, scheduledAt, notes || null]);
    return res.rows[0];
  }

  static async getUserViewings(userId: string) {
    const sql = `
      SELECT v.*, p.title as property_title, p.address as property_address
      FROM viewings v
      JOIN properties p ON v.property_id = p.id
      WHERE v.user_id = $1 OR v.agent_id = $1
      ORDER BY v.scheduled_at ASC
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  }

  // --- REVIEWS ---
  static async createReview(userId: string, data: any) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5.');
    }
    const sql = `
      INSERT INTO reviews (user_id, property_id, hotel_id, pg_id, hostel_id, rating, review, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Published')
      RETURNING *
    `;
    const res = await query(sql, [
      userId, data.property_id || null, data.hotel_id || null, data.pg_id || null,
      data.hostel_id || null, data.rating, data.review || ''
    ]);
    return res.rows[0];
  }

  static async getReviews(targetType: 'property' | 'hotel' | 'pg' | 'hostel', targetId: string) {
    const col = `${targetType}_id`;
    const sql = `
      SELECT r.*, u.name as reviewer_name, u.profile_image_url as reviewer_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.${col} = $1 AND r.status = 'Published'
      ORDER BY r.created_at DESC
    `;
    const res = await query(sql, [targetId]);
    return res.rows;
  }
}
