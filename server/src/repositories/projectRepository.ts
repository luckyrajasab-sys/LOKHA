import { query } from '../db/pool.js';

export class ProjectRepository {
  static async listProjects(city?: string, status?: string) {
    let sql = `
      SELECT p.*,
        d.company_name as developer_name,
        b.company_name as builder_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', po.id,
              'title', po.title,
              'unit_type', po.unit_type,
              'area', po.area,
              'area_unit', po.area_unit,
              'price', po.price,
              'available_units', po.available_units,
              'status', po.status
            )
          ) FILTER (WHERE po.id IS NOT NULL), '[]'
        ) as offers
      FROM projects p
      LEFT JOIN developers d ON p.developer_id = d.id
      LEFT JOIN builders b ON p.builder_id = b.id
      LEFT JOIN project_offers po ON p.id = po.project_id
    `;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (city) {
      conditions.push(`p.city ILIKE $${idx++}`);
      values.push(`%${city}%`);
    }
    if (status) {
      conditions.push(`p.status = $${idx++}`);
      values.push(status);
    }
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    sql += ` GROUP BY p.id, d.id, b.id ORDER BY p.created_at DESC`;

    const res = await query(sql, values);
    return res.rows;
  }

  static async createProject(data: any) {
    const sql = `
      INSERT INTO projects (developer_id, builder_id, name, description, property_type, city, state, country, latitude, longitude, status, expected_completion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const res = await query(sql, [
      data.developer_id || null, data.builder_id || null, data.name, data.description || '',
      data.property_type, data.city, data.state, data.country, data.latitude, data.longitude,
      data.status || 'Under Construction', data.expected_completion || null
    ]);
    return res.rows[0];
  }

  static async createOffer(projectId: string, data: any) {
    const sql = `
      INSERT INTO project_offers (project_id, title, unit_type, area, area_unit, price, currency, available_units, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const res = await query(sql, [
      projectId, data.title, data.unit_type, data.area, data.area_unit || 'sq.ft',
      data.price, data.currency || 'INR', data.available_units || 1, data.status || 'Available'
    ]);
    return res.rows[0];
  }

  static async listBuilders() {
    const res = await query('SELECT * FROM builders ORDER BY created_at DESC');
    return res.rows;
  }

  static async createBuilder(userId: string, data: any) {
    const sql = `
      INSERT INTO builders (user_id, company_name, description, website, country, verification_status)
      VALUES ($1, $2, $3, $4, $5, 'Verified')
      RETURNING *
    `;
    const res = await query(sql, [userId, data.company_name, data.description || '', data.website || '', data.country || 'India']);
    return res.rows[0];
  }

  static async listDevelopers() {
    const res = await query('SELECT * FROM developers ORDER BY created_at DESC');
    return res.rows;
  }

  static async createDeveloper(userId: string, data: any) {
    const sql = `
      INSERT INTO developers (user_id, company_name, description, website, country, verification_status)
      VALUES ($1, $2, $3, $4, $5, 'Verified')
      RETURNING *
    `;
    const res = await query(sql, [userId, data.company_name, data.description || '', data.website || '', data.country || 'India']);
    return res.rows[0];
  }
}
