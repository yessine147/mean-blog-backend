import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Notification Service API',
      version: '1.0.0',
      description: 'Real-time notifications via Socket.IO',
    },
    servers: [
      { url: 'http://localhost:3003', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        serviceApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-service-api-key',
          description: 'Service API Key for service-to-service communication',
        },
      },
    },
    security: [
      { bearerAuth: [] }
    ],
  },
  apis: ['src/modules/**/*.ts'],
});
