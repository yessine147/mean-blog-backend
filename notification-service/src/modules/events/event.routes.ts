import { Router } from 'express';
import { createEvent } from './event.controller';
import { serviceAuthMiddleware } from '../../middlewares/service-auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/events:
 *   post:
 *     summary: Create a notification event
 *     tags: [Events]
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
 *               articleId:
 *                 type: string
 *                 example: "68d593f6fb5e3105da003117"
 *               data:
 *                 type: object
 *                 description: Event data payload
 *     responses:
 *       200:
 *         description: Event processed successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', serviceAuthMiddleware, createEvent);

export default router;
