import { query } from '../db/pool.js';

export interface DbUser {
  id: string;
  firebase_uid: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  profile_image_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export class UserRepository {
  static async findById(id: string): Promise<DbUser | null> {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  static async findByFirebaseUid(uid: string): Promise<DbUser | null> {
    const res = await query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    return res.rows[0] || null;
  }

  static async updateProfile(id: string, data: Partial<DbUser>): Promise<DbUser> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Disallow updating role or firebase_uid directly via profile update
    const allowed = ['name', 'phone', 'country', 'profile_image_url'];
    for (const key of allowed) {
      if ((data as any)[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push((data as any)[key]);
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await query(sql, values);
    return res.rows[0];
  }

  static async listUsers(limit = 50, offset = 0): Promise<{ users: DbUser[]; total: number }> {
    const [rowsRes, countRes] = await Promise.all([
      query('SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
      query('SELECT COUNT(*) as total FROM users')
    ]);
    return {
      users: rowsRes.rows,
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  static async updateRole(userId: string, newRole: string): Promise<DbUser> {
    const res = await query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newRole, userId]
    );
    return res.rows[0];
  }
}
