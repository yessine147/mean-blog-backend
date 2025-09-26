import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Article Service API',
      version: '1.0.0',
      description: 'Articles CRUD with tags, images, and comments',
    },
    servers: [
      { url: 'http://localhost:3002', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CreateArticleDto: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            coverImageUrl: { type: 'string' },
          },
        },
        UpdateArticleDto: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            coverImageUrl: { type: 'string' },
          },
        },
        AddCommentDto: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string' },
            parentId: { type: 'string' },
          },
        },
        CreateCommentDto: {
          type: 'object',
          required: ['articleId', 'content'],
          properties: {
            articleId: { type: 'string' },
            content: { type: 'string' },
            parentId: { type: 'string' },
          },
        },
      },
    },
    security: [
      { bearerAuth: [] }
    ],
  },
  apis: ['src/modules/**/*.ts'],
});
