import { Router } from 'express';
import { createComment, deleteCommentTree, listComments } from './comment.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireReader } from '../../middlewares/role.middleware';

const router = Router();

/**
 * @openapi
 * /api/comments:
 *   get:
 *     summary: List comments for an article
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', listComments);

/**
 * @openapi
 * /api/comments:
 *   post:
 *     summary: Create comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentDto'
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, requireReader, createComment);

/**
 * @openapi
 * /api/comments/{id}/tree:
 *   delete:
 *     summary: Delete comment tree (comment and all replies)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment tree deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.delete('/:id/tree', authMiddleware, requireReader, deleteCommentTree);

export default router;
