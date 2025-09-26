import { Router } from 'express';
import { createArticle, deleteArticle, getArticle, listArticles, updateArticle } from './article.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireAuthor } from '../../middlewares/role.middleware';

const router = Router();

/**
 * @openapi
 * /api/articles:
 *   get:
 *     summary: List articles
 *     tags: [Articles]
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
 *         name: q
 *         schema:
 *           type: string
 *         description: Optional text search across title and content
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', listArticles);

/**
 * @openapi
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not Found
 */
router.get('/:id', getArticle);

/**
 * @openapi
 * /api/articles:
 *   post:
 *     summary: Create article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArticleDto'
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, requireAuthor, createArticle);

/**
 * @openapi
 * /api/articles/{id}:
   *   put:
 *     summary: Update article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateArticleDto'
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */
router.put('/:id', authMiddleware, requireAuthor, updateArticle);

/**
 * @openapi
 * /api/articles/{id}:
 *   delete:
 *     summary: Delete article
 *     tags: [Articles]
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
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */
router.delete('/:id', authMiddleware, requireAuthor, deleteArticle);

export default router;
