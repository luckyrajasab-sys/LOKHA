import { query, withTransaction } from '../db/pool.js';

export interface CreateBookingData {
  property_id?: string;
  hotel_id?: string;
  room_id?: string;
  pg_id?: string;
  hostel_id?: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  currency?: string;
}

export class BookingRepository {
  /**
   * Atomic booking creation with overlap checks inside a PostgreSQL transaction
   */
  static async createBooking(userId: string, data: CreateBookingData) {
    if (new Date(data.check_out) < new Date(data.check_in)) {
      throw new Error('Check-out date cannot be before check-in date.');
    }

    return withTransaction(async (client) => {
      // 1. Check for overlapping active bookings on the same room/property
      if (data.room_id) {
        const overlapQuery = `
          SELECT id FROM bookings
          WHERE room_id = $1
            AND status IN ('Confirmed', 'Pending')
            AND check_in <= $3
            AND check_out >= $2
          FOR UPDATE
        `;
        const overlapRes = await client.query(overlapQuery, [data.room_id, data.check_in, data.check_out]);
        if (overlapRes.rows.length > 0) {
          throw new Error('The selected room is unavailable for the requested dates.');
        }
      } else if (data.property_id) {
        const overlapQuery = `
          SELECT id FROM bookings
          WHERE property_id = $1
            AND status IN ('Confirmed', 'Pending')
            AND check_in <= $3
            AND check_out >= $2
          FOR UPDATE
        `;
        const overlapRes = await client.query(overlapQuery, [data.property_id, data.check_in, data.check_out]);
        if (overlapRes.rows.length > 0) {
          throw new Error('The selected property is unavailable for the requested dates.');
        }
      }

      // 2. Insert booking record
      const insertSql = `
        INSERT INTO bookings (
          user_id, property_id, hotel_id, room_id, pg_id, hostel_id,
          check_in, check_out, guests, total_amount, currency, status, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Pending', 'Unpaid')
        RETURNING *
      `;
      const values = [
        userId,
        data.property_id || null,
        data.hotel_id || null,
        data.room_id || null,
        data.pg_id || null,
        data.hostel_id || null,
        data.check_in,
        data.check_out,
        data.guests,
        data.total_amount,
        data.currency || 'INR'
      ];
      const res = await client.query(insertSql, values);
      return res.rows[0];
    });
  }

  static async getUserBookings(userId: string) {
    const sql = `
      SELECT b.*,
        p.title as property_title,
        p.city as property_city,
        h.name as hotel_name,
        r.room_type as room_type,
        pg.name as pg_name,
        hostel.name as hostel_name
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN pgs pg ON b.pg_id = pg.id
      LEFT JOIN hostels hostel ON b.hostel_id = hostel.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  }

  static async updateStatus(bookingId: string, status: string, userId: string, isAdmin: boolean) {
    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (bookingRes.rows.length === 0) return null;
    const b = bookingRes.rows[0];

    if (b.user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to update this booking.');
    }

    const res = await query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );
    return res.rows[0];
  }
}
