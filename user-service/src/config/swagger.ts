import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: 'Authentication and user management endpoints',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Local' },
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
        RegisterDto: {
          type: 'object',
          required: ['email', 'password', 'userName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: {
              type: 'string',
              minLength: 8,
              description: 'At least 8 chars, includes uppercase, lowercase, number, and special character',
            },
            userName: { type: 'string' },
            role: { type: 'string', enum: ['Admin', 'Editor', 'Author', 'Reader'] },
          },
        },
        LoginDto: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
        },
      },
    },
  },
  apis: ['src/modules/user/*.routes.ts'],
});
