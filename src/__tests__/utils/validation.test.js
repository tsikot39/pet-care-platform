const { validate, schemas } = require('../../utils/validation');

describe('Validation Utils', () => {
  describe('registerSchema', () => {
    it('should validate correct user registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'owner',
        phone: '1234567890'
      };

      const { error } = schemas.register.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        role: 'owner'
      };

      const { error } = schemas.register.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid email');
    });

    it('should reject short password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
        role: 'owner'
      };

      const { error } = schemas.register.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 6 characters');
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        email: 'john@example.com',
        password: 'password123',
        role: 'owner'
      };

      const { error } = schemas.register.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Name is required');
    });

    it('should reject invalid role', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'invalid_role'
      };

      const { error } = schemas.register.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('must be one of');
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const { error } = schemas.login.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123'
      };

      const { error } = schemas.login.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Email is required');
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'john@example.com'
      };

      const { error } = schemas.login.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Password is required');
    });
  });

  describe('petSchema', () => {
    it('should validate correct pet data', () => {
      const validData = {
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'male',
        weight: 30
      };

      const { error } = schemas.pet.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid pet species', () => {
      const invalidData = {
        name: 'Buddy',
        species: 'invalid_species',
        breed: 'Golden Retriever',
        age: 3
      };

      const { error } = schemas.pet.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid species');
    });

    it('should reject negative age', () => {
      const invalidData = {
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: -1
      };

      const { error } = schemas.pet.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('cannot be negative');
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3
      };

      const { error } = schemas.pet.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Pet name is required');
    });
  });

  describe('serviceSchema', () => {
    it('should validate correct service data', () => {
      const validData = {
        serviceType: 'pet_sitting',
        title: 'Professional Pet Care',
        description: 'Reliable and caring pet sitting service for your beloved pets.',
        price: 50,
        duration: 60,
        location: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        petTypes: ['dog', 'cat']
      };

      const { error } = schemas.service.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid service type', () => {
      const invalidData = {
        serviceType: 'invalid_service',
        title: 'Professional Pet Care',
        description: 'Reliable and caring pet sitting service for your beloved pets.',
        price: 50,
        location: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        petTypes: ['dog']
      };

      const { error } = schemas.service.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid service type');
    });

    it('should reject negative price', () => {
      const invalidData = {
        serviceType: 'pet_sitting',
        title: 'Professional Pet Care',
        description: 'Reliable and caring pet sitting service for your beloved pets.',
        price: -10,
        location: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        petTypes: ['dog']
      };

      const { error } = schemas.service.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('cannot be negative');
    });

    it('should reject empty pet types', () => {
      const invalidData = {
        serviceType: 'pet_sitting',
        title: 'Professional Pet Care',
        description: 'Reliable and caring pet sitting service for your beloved pets.',
        price: 50,
        location: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        petTypes: []
      };

      const { error } = schemas.service.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('At least one pet type');
    });
  });

  describe('bookingSchema', () => {
    it('should validate correct booking data', () => {
      const validData = {
        service: '507f1f77bcf86cd799439011',
        pet: '507f1f77bcf86cd799439012',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        notes: 'Please take care of my pet'
      };

      const { error } = schemas.booking.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject missing service', () => {
      const invalidData = {
        pet: '507f1f77bcf86cd799439012',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };

      const { error } = schemas.booking.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Service ID is required');
    });

    it('should reject missing pet', () => {
      const invalidData = {
        service: '507f1f77bcf86cd799439011',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };

      const { error } = schemas.booking.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Pet ID is required');
    });

    it('should reject past dates', () => {
      const invalidData = {
        service: '507f1f77bcf86cd799439011',
        pet: '507f1f77bcf86cd799439012',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const { error } = schemas.booking.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('must be greater than or equal to');
    });
  });

  describe('validate middleware', () => {
    it('should create validation middleware', () => {
      const middleware = validate(schemas.register);
      expect(typeof middleware).toBe('function');
    });
  });
});
