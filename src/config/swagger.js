const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pet Care Platform API',
      version: '1.0.0',
      description: 'A comprehensive pet care platform API with booking system, authentication, and file uploads',
      contact: {
        name: 'Pet Care Platform Team',
        email: 'contact@petcareplatform.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8001',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the user'
            },
            name: {
              type: 'string',
              description: 'The user name',
              minLength: 2,
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'The user email'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'The user password'
            },
            role: {
              type: 'string',
              enum: ['owner', 'sitter'],
              description: 'The user role'
            },
            phone: {
              type: 'string',
              description: 'The user phone number'
            },
            bio: {
              type: 'string',
              description: 'The user bio'
            },
            isActive: {
              type: 'boolean',
              description: 'User account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date'
            }
          }
        },
        Pet: {
          type: 'object',
          required: ['name', 'species', 'owner'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the pet'
            },
            name: {
              type: 'string',
              description: 'The pet name'
            },
            species: {
              type: 'string',
              enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other'],
              description: 'The pet species'
            },
            breed: {
              type: 'string',
              description: 'The pet breed'
            },
            age: {
              type: 'number',
              description: 'The pet age'
            },
            weight: {
              type: 'number',
              description: 'The pet weight'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'unknown'],
              description: 'The pet gender'
            },
            color: {
              type: 'string',
              description: 'The pet color'
            },
            photos: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Pet photos'
            },
            specialNeeds: {
              type: 'string',
              description: 'Pet special needs'
            },
            isVaccinated: {
              type: 'boolean',
              description: 'Vaccination status'
            },
            isMicrochipped: {
              type: 'boolean',
              description: 'Microchip status'
            }
          }
        },
        Service: {
          type: 'object',
          required: ['title', 'description', 'price', 'serviceType'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the service'
            },
            title: {
              type: 'string',
              description: 'The service title'
            },
            description: {
              type: 'string',
              description: 'The service description'
            },
            price: {
              type: 'number',
              description: 'The service price'
            },
            serviceType: {
              type: 'string',
              enum: ['dog_walking', 'pet_sitting', 'grooming', 'training', 'veterinary', 'other'],
              description: 'The service type'
            },
            duration: {
              type: 'number',
              description: 'Service duration in hours'
            },
            petTypes: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Compatible pet types'
            },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' }
              }
            },
            isAvailable: {
              type: 'boolean',
              description: 'Service availability'
            }
          }
        },
        Booking: {
          type: 'object',
          required: ['service', 'pet', 'startDate', 'endDate'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the booking'
            },
            service: {
              type: 'string',
              description: 'The service ID'
            },
            pet: {
              type: 'string',
              description: 'The pet ID'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Booking start date'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Booking end date'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
              description: 'Booking status'
            },
            totalPrice: {
              type: 'number',
              description: 'Total booking price'
            },
            notes: {
              type: 'string',
              description: 'Special notes for the booking'
            },
            emergencyContact: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                relationship: { type: 'string' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'fail'
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
