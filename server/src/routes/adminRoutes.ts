import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/rbacMiddleware.js';
import { UserRepository } from '../repositories/userRepository.js';
import { query } from '../db/pool.js';

export const adminRouter = Router();

// Protect all admin routes with authentication and admin role enforcement
adminRouter.use(requireAuth, requireAdmin);

// List users with pagination
adminRouter.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const offset = (page - 1) * limit;

    const data = await UserRepository.listUsers(limit, offset);
    res.json({ ...data, page, limit });
  } catch (err) {
    next(err);
  }
});

// Update user role
adminRouter.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      res.status(400).json({ error: 'BadRequest', message: 'Role is required' });
      return;
    }
    const updated = await UserRepository.updateRole(req.params.id, role);

    // Audit log
    await query(
      `INSERT INTO admin_actions (admin_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user!.id, 'UPDATE_ROLE', 'user', req.params.id, JSON.stringify({ newRole: role })]
    );

    res.json({ message: 'User role updated', user: updated });
  } catch (err) {
    next(err);
  }
});

// Admin actions audit log
adminRouter.get('/actions', async (_req, res, next) => {
  try {
    const actions = await query(`
      SELECT aa.*, u.name as admin_name, u.email as admin_email
      FROM admin_actions aa
      JOIN users u ON aa.admin_id = u.id
      ORDER BY aa.created_at DESC
      LIMIT 100
    `);
    res.json({ actions: actions.rows });
  } catch (err) {
    next(err);
  }
});

// Reports list & status update
adminRouter.get('/reports', async (_req, res, next) => {
  try {
    const reports = await query(`
      SELECT r.*, u.name as reporter_name, u.email as reporter_email
      FROM reports r
      JOIN users u ON r.reporter_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json({ reports: reports.rows });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/reports/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const resUpdate = await query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json({ message: 'Report status updated', report: resUpdate.rows[0] });
  } catch (err) {
    next(err);
  }
});
