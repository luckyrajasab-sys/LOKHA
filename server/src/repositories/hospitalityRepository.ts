import { query } from '../db/pool.js';

export class HospitalityRepository {
  // --- HOTELS & ROOMS ---
  static async listHotels(city?: string, country?: string) {
    let sql = `
      SELECT h.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', r.id,
              'room_type', r.room_type,
              'description', r.description,
              'capacity', r.capacity,
              'price_per_night', r.price_per_night,
              'available_rooms', r.available_rooms
            )
          ) FILTER (WHERE r.id IS NOT NULL), '[]'
        ) as rooms
      FROM hotels h
      LEFT JOIN rooms r ON h.id = r.hotel_id
    `;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (city) {
      conditions.push(`h.city ILIKE $${idx++}`);
      values.push(`%${city}%`);
    }
    if (country) {
      conditions.push(`h.country ILIKE $${idx++}`);
      values.push(`%${country}%`);
    }
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    sql += ` GROUP BY h.id ORDER BY h.rating DESC, h.created_at DESC`;

    const res = await query(sql, values);
    return res.rows;
  }

  static async createHotel(ownerId: string, data: any) {
    const sql = `
      INSERT INTO hotels (owner_id, name, description, address, city, state, country, latitude, longitude, rating, verification_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const res = await query(sql, [
      ownerId, data.name, data.description || '', data.address, data.city, data.state,
      data.country, data.latitude, data.longitude, data.rating || 5.0, data.verification_status || 'Verified'
    ]);
    return res.rows[0];
  }

  static async createRoom(hotelId: string, data: any) {
    const sql = `
      INSERT INTO rooms (hotel_id, room_type, description, capacity, price_per_night, currency, available_rooms)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const res = await query(sql, [
      hotelId, data.room_type, data.description || '', data.capacity || 2,
      data.price_per_night, data.currency || 'INR', data.available_rooms || 1
    ]);
    return res.rows[0];
  }

  // --- PGS (Paying Guests / Co-Living) ---
  static async listPGs(city?: string, genderPolicy?: string) {
    let sql = 'SELECT * FROM pgs';
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (city) {
      conditions.push(`city ILIKE $${idx++}`);
      values.push(`%${city}%`);
    }
    if (genderPolicy && genderPolicy !== 'All') {
      conditions.push(`gender_policy = $${idx++}`);
      values.push(genderPolicy);
    }
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    sql += ` ORDER BY created_at DESC`;

    const res = await query(sql, values);
    return res.rows;
  }

  static async createPG(ownerId: string, data: any) {
    const sql = `
      INSERT INTO pgs (owner_id, name, description, address, city, state, country, gender_policy, price_per_month, currency, verification_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const res = await query(sql, [
      ownerId, data.name, data.description || '', data.address, data.city, data.state,
      data.country, data.gender_policy || 'Unisex', data.price_per_month, data.currency || 'INR',
      data.verification_status || 'Verified'
    ]);
    return res.rows[0];
  }

  // --- HOSTELS ---
  static async listHostels(city?: string) {
    let sql = 'SELECT * FROM hostels';
    const values: any[] = [];
    if (city) {
      sql += ' WHERE city ILIKE $1';
      values.push(`%${city}%`);
    }
    sql += ' ORDER BY created_at DESC';
    const res = await query(sql, values);
    return res.rows;
  }

  static async createHostel(ownerId: string, data: any) {
    const sql = `
      INSERT INTO hostels (owner_id, name, description, address, city, state, country, price_per_night, currency, verification_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const res = await query(sql, [
      ownerId, data.name, data.description || '', data.address, data.city, data.state,
      data.country, data.price_per_night, data.currency || 'INR', data.verification_status || 'Verified'
    ]);
    return res.rows[0];
  }
}
