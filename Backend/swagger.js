// Backend/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TransparAI API',
      version: '1.0.0',
      description: 'AI-powered Terms and Conditions analysis platform API',
      contact: {
        name: 'TransparAI Support',
        email: 'ktaylconsult@gmail.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.transparai.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Firebase JWT token. Get from Firebase Authentication.',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Indicates if the request was successful',
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Invalid request parameters',
                  description: 'Human-readable error message',
                },
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                  description: 'Error code for programmatic handling',
                },
                field: {
                  type: 'string',
                  example: 'email',
                  description: 'Field that caused the validation error (if applicable)',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-10-11T10:30:00Z',
                  description: 'Timestamp when the error occurred',
                },
              },
              required: ['message'],
            },
          },
          required: ['success', 'error'],
        },
        User: {
          type: 'object',
          properties: {
            firebaseUid: {
              type: 'string',
              example: 'RywcCYBykQdHjYRydqMWv2pLeyw1',
              description: 'Firebase user ID',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            profile: {
              type: 'object',
              properties: {
                firstName: {
                  type: 'string',
                  example: 'John',
                },
                lastName: {
                  type: 'string',
                  example: 'Doe',
                },
                phone: {
                  type: 'string',
                  example: '+33612345678',
                },
                country: {
                  type: 'string',
                  example: 'France',
                },
              },
            },
            plan: {
              type: 'string',
              enum: ['starter', 'standard', 'premium', 'enterprise'],
              example: 'premium',
            },
            monthlyQuota: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  example: 100,
                  description: 'Monthly quota limit (-1 for unlimited)',
                },
                used: {
                  type: 'number',
                  example: 15,
                  description: 'Number of analyses used this month',
                },
              },
            },
          },
        },
        Analysis: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            fileName: {
              type: 'string',
              example: 'terms-of-service.pdf',
            },
            source: {
              type: 'string',
              enum: ['pdf', 'text', 'ocr'],
              example: 'pdf',
            },
            score: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 75,
              description: 'Transparency score from 0-100',
            },
            grade: {
              type: 'string',
              enum: ['A', 'B', 'C', 'D', 'F'],
              example: 'B',
            },
            summary: {
              type: 'string',
              example: 'The terms generally favor the company with several concerning clauses...',
            },
            risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    example: 'Data Collection',
                  },
                  severity: {
                    type: 'string',
                    enum: ['Low', 'Medium', 'High', 'Critical'],
                    example: 'High',
                  },
                  description: {
                    type: 'string',
                    example: 'Extensive data collection without clear opt-out',
                  },
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-10-11T10:30:00Z',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              example: 'healthy',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-10-11T10:30:00Z',
            },
            version: {
              type: 'string',
              example: '1.0.0',
            },
            checks: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['healthy', 'unhealthy'],
                      example: 'healthy',
                    },
                    responseTime: {
                      type: 'number',
                      example: 45,
                      description: 'Response time in milliseconds',
                    },
                  },
                },
                geminiAPI: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['healthy', 'unhealthy'],
                      example: 'healthy',
                    },
                    responseTime: {
                      type: 'number',
                      example: 120,
                    },
                  },
                },
                stripe: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['healthy', 'unhealthy'],
                      example: 'healthy',
                    },
                    responseTime: {
                      type: 'number',
                      example: 85,
                    },
                  },
                },
                firebase: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['healthy', 'unhealthy'],
                      example: 'healthy',
                    },
                    responseTime: {
                      type: 'number',
                      example: 30,
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  message: 'Token invalide ou manquant',
                  code: 'UNAUTHORIZED',
                  timestamp: '2024-10-11T10:30:00Z',
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  message: 'Email est requis',
                  code: 'VALIDATION_ERROR',
                  field: 'email',
                  timestamp: '2024-10-11T10:30:00Z',
                },
              },
            },
          },
        },
        QuotaExceededError: {
          description: 'User has exceeded their monthly quota',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  message: 'Quota mensuel dépassé. Veuillez mettre à niveau votre abonnement.',
                  code: 'QUOTA_EXCEEDED',
                  timestamp: '2024-10-11T10:30:00Z',
                },
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  message: 'Erreur serveur interne',
                  code: 'INTERNAL_ERROR',
                  timestamp: '2024-10-11T10:30:00Z',
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './middleware/*.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
