const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long'
    }),
  
  role: Joi.string()
    .valid('owner', 'sitter')
    .required()
    .messages({
      'any.only': 'Role must be either owner or sitter',
      'string.empty': 'Role is required'
    }),
  
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
  
  bio: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Bio cannot exceed 500 characters'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

const updateUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional(),
  
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional(),
  
  bio: Joi.string()
    .max(500)
    .optional(),
  
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional()
  }).optional(),
  
  // Sitter-specific fields
  experience: Joi.string()
    .max(1000)
    .optional(),
  
  certifications: Joi.array()
    .items(Joi.string())
    .optional(),
  
  hourlyRate: Joi.number()
    .min(0)
    .optional(),
  
  // Owner-specific fields
  emergencyContact: Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    relationship: Joi.string().optional()
  }).optional()
});

// Pet validation schemas
const petSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Pet name is required',
      'string.max': 'Pet name cannot exceed 50 characters'
    }),
  
  species: Joi.string()
    .valid('dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other')
    .required()
    .messages({
      'any.only': 'Please select a valid species',
      'string.empty': 'Species is required'
    }),
  
  breed: Joi.string()
    .trim()
    .max(50)
    .optional(),
  
  age: Joi.number()
    .integer()
    .min(0)
    .max(30)
    .optional()
    .messages({
      'number.min': 'Age cannot be negative',
      'number.max': 'Age seems unrealistic'
    }),
  
  weight: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Weight cannot be negative'
    }),
  
  gender: Joi.string()
    .valid('male', 'female', 'unknown')
    .optional(),
  
  specialNeeds: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Special needs description cannot exceed 500 characters'
    }),
  
  vaccinated: Joi.boolean()
    .optional(),
  
  microchipped: Joi.boolean()
    .optional(),
  
  medications: Joi.array()
    .items(Joi.string())
    .optional(),
  
  allergies: Joi.array()
    .items(Joi.string())
    .optional(),
  
  vetInfo: Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional()
  }).optional()
});

// Service validation schemas
const serviceSchema = Joi.object({
  serviceType: Joi.string()
    .valid('dog_walking', 'pet_sitting', 'grooming', 'training', 'daycare', 'boarding', 'other')
    .required()
    .messages({
      'any.only': 'Please select a valid service type',
      'string.empty': 'Service type is required'
    }),
  
  title: Joi.string()
    .trim()
    .min(5)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Service title is required',
      'string.min': 'Title must be at least 5 characters long',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Service description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  
  duration: Joi.number()
    .integer()
    .min(15)
    .optional()
    .messages({
      'number.min': 'Minimum duration is 15 minutes'
    }),
  
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional()
    }).optional()
  }).required(),
  
  availability: Joi.array()
    .items(
      Joi.object({
        day: Joi.string()
          .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
          .required(),
        startTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required(),
        endTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required()
      })
    )
    .optional(),
  
  petTypes: Joi.array()
    .items(Joi.string().valid('dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other'))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one pet type must be selected'
    }),
  
  maxPets: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.min': 'Must accommodate at least 1 pet'
    })
});

// Booking validation schemas
const bookingSchema = Joi.object({
  service: Joi.string()
    .required()
    .messages({
      'string.empty': 'Service ID is required'
    }),
  
  pet: Joi.string()
    .required()
    .messages({
      'string.empty': 'Pet ID is required'
    }),
  
  startDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'Start date cannot be in the past',
      'any.required': 'Start date is required'
    }),
  
  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .required()
    .messages({
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
  
  emergencyContact: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    relationship: Joi.string().optional()
  }).optional()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    console.log('Validating data:', req.body); // Debug log
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      console.log('Validation errors:', errors); // Debug log
      
      // Create a more descriptive message based on the validation errors
      let message = 'Validation failed';
      if (errors.length === 1) {
        message = `Validation failed: ${errors[0].message}`;
      } else if (errors.length > 1) {
        message = `Validation failed: ${errors.length} fields have errors`;
      }
      
      return res.status(400).json({
        status: 'fail',
        message: message,
        errors: errors,
        summary: `Please fix the following ${errors.length} validation error(s):`
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    updateUser: updateUserSchema,
    pet: petSchema,
    service: serviceSchema,
    booking: bookingSchema
  }
};
