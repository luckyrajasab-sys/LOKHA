import { query } from '../db/pool.js';
import { getFirebaseAdmin } from '../config/firebaseAdmin.js';

export class NotificationRepository {
  static async createNotification(userId: string, title: string, message: string, type = 'info', fcmToken?: string) {
    const sql = `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [userId, title, message, type]);
    const notification = res.rows[0];

    // Optional FCM push dispatch
    if (fcmToken) {
      try {
        const admin = getFirebaseAdmin();
        await admin.messaging().send({
          token: fcmToken,
          notification: { title, body: message },
          data: { type, id: notification.id }
        });
      } catch (err: any) {
        console.warn('[FCM Push Warning] Failed to send push message:', err.message);
      }
    }

    return notification;
  }

  static async getUserNotifications(userId: string) {
    const res = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return res.rows;
  }

  static async markAsRead(notificationId: string, userId: string) {
    const res = await query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );
    return res.rows[0] || null;
  }
}
