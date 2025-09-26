import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { serviceAuthMiddleware } from '../../middlewares/service-auth.middleware';
import { createNotificationEvent, createNotification, listNotifications, markAllRead, markRead } from './notification.controller';
import { NotificationService } from './notification.service';

const router = Router();

// Service-to-service routes (no auth middleware)
/**
 * @openapi
 * /api/notifications/service/event:
 *   post:
 *     summary: Create notification event (service-to-service)
 *     tags: [Notifications]
 *     security:
 *       - serviceApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "comment_created"
 *               receiverUserId:
 *                 type: string
 *                 example: "68d593f6fb5e3105da003117"
 *               actorId:
 *                 type: string
 *                 example: "68d593f6fb5e3105da003118"
 *               message:
 *                 type: string
 *                 example: "Someone commented on your article"
 *               articleId:
 *                 type: string
 *                 example: "68d593f6fb5e3105da003119"
 *               commentId:
 *                 type: string
 *                 example: "68d593f6fb5e3105da003120"
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post('/service/event', (req, res, next) => {
  // Bypass user auth for service endpoint; handled inside controller via x-service-key
  return createNotificationEvent(req, res, next);
});

/**
 * @openapi
 * /api/notifications/service/create:
 *   post:
 *     summary: Create notification (service-to-service)
 *     tags: [Notifications]
 *     security:
 *       - serviceApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "68d593f6fb5e3105da003117"
 *               type:
 *                 type: string
 *                 example: "comment_created"
 *               title:
 *                 type: string
 *                 example: "New comment on your article"
 *               message:
 *                 type: string
 *                 example: "Someone commented on your article"
 *               data:
 *                 type: object
 *                 description: Additional notification data
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/service/create', serviceAuthMiddleware, createNotification);

// User-facing routes (protected by auth middleware)
/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: List notifications for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 */
// Apply auth middleware only to user-facing routes
router.use(authMiddleware);
router.get('/', listNotifications);

/**
 * @openapi
 * /api/notifications/read:
 *   post:
 *     summary: Mark notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         description: Unauthorized
 */
router.post('/read', markRead);

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const service = new NotificationService();
    await service.markRead(req.user.sub, [id]);
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         description: Unauthorized
 */
router.patch('/mark-all-read', markAllRead);


export default router;
