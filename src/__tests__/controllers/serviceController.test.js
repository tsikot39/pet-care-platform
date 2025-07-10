const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Service = require('../../models/Service');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// Mock the models
jest.mock('../../models/Service');
jest.mock('../../models/User');

describe('Service Controller', () => {
  let authToken;
  let mockUser;
  let mockProviderUser;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = {
      _id: 'mockUserId',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'pet_owner'
    };

    mockProviderUser = {
      _id: 'mockProviderId',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'service_provider'
    };

    authToken = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET || 'test_secret');
  });

  describe('GET /api/services', () => {
    it('should get all services with optional filters', async () => {
      const mockServices = [
        {
          _id: 'service1',
          name: 'Pet Grooming',
          category: 'grooming',
          price: 50,
          duration: 60,
          description: 'Professional pet grooming'
        },
        {
          _id: 'service2',
          name: 'Veterinary Checkup',
          category: 'medical',
          price: 75,
          duration: 45,
          description: 'General health checkup'
        }
      ];

      Service.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockServices)
      });

      const response = await request(app)
        .get('/api/services');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.services).toHaveLength(2);
      expect(Service.find).toHaveBeenCalledWith({});
    });

    it('should filter services by category', async () => {
      const mockServices = [
        {
          _id: 'service1',
          name: 'Pet Grooming',
          category: 'grooming',
          price: 50,
          duration: 60
        }
      ];

      Service.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockServices)
      });

      const response = await request(app)
        .get('/api/services?category=grooming');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.services).toHaveLength(1);
      expect(Service.find).toHaveBeenCalledWith({ category: 'grooming' });
    });

    it('should filter services by price range', async () => {
      const mockServices = [
        {
          _id: 'service1',
          name: 'Pet Grooming',
          category: 'grooming',
          price: 50,
          duration: 60
        }
      ];

      Service.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockServices)
      });

      const response = await request(app)
        .get('/api/services?minPrice=40&maxPrice=60');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Service.find).toHaveBeenCalledWith({
        price: { $gte: 40, $lte: 60 }
      });
    });
  });

  describe('GET /api/services/:id', () => {
    it('should get service by id', async () => {
      const mockService = {
        _id: 'service1',
        name: 'Pet Grooming',
        category: 'grooming',
        price: 50,
        duration: 60,
        description: 'Professional pet grooming'
      };

      Service.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockService)
      });

      const response = await request(app)
        .get('/api/services/service1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.service).toBeDefined();
      expect(Service.findById).toHaveBeenCalledWith('service1');
    });

    it('should return error for non-existent service', async () => {
      Service.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .get('/api/services/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Service not found');
    });
  });

  describe('POST /api/services', () => {
    beforeEach(() => {
      const providerToken = jwt.sign({ userId: mockProviderUser._id }, process.env.JWT_SECRET || 'test_secret');
      authToken = providerToken;
      User.findById.mockResolvedValue(mockProviderUser);
    });

    it('should create a new service successfully for service provider', async () => {
      const serviceData = {
        name: 'Pet Training',
        category: 'training',
        price: 100,
        duration: 90,
        description: 'Professional pet training sessions'
      };

      const mockService = {
        _id: 'newServiceId',
        ...serviceData,
        provider: mockProviderUser._id
      };

      Service.create.mockResolvedValue(mockService);

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.service).toBeDefined();
      expect(Service.create).toHaveBeenCalledWith({
        ...serviceData,
        provider: mockProviderUser._id
      });
    });

    it('should return error for pet owner trying to create service', async () => {
      const petOwnerToken = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET || 'test_secret');
      User.findById.mockResolvedValue(mockUser);

      const serviceData = {
        name: 'Pet Training',
        category: 'training',
        price: 100,
        duration: 90
      };

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${petOwnerToken}`)
        .send(serviceData);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Only service providers can create services');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        name: '', // Required field missing
        category: 'invalid_category', // Invalid category
        price: -10, // Invalid price
        duration: 0 // Invalid duration
      };

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/services/:id', () => {
    beforeEach(() => {
      const providerToken = jwt.sign({ userId: mockProviderUser._id }, process.env.JWT_SECRET || 'test_secret');
      authToken = providerToken;
      User.findById.mockResolvedValue(mockProviderUser);
    });

    it('should update service successfully', async () => {
      const updateData = {
        name: 'Updated Service Name',
        price: 120
      };

      const mockService = {
        _id: 'service1',
        name: 'Pet Training',
        category: 'training',
        price: 100,
        provider: mockProviderUser._id
      };

      const updatedService = {
        ...mockService,
        ...updateData
      };

      Service.findById.mockResolvedValue(mockService);
      Service.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedService)
      });

      const response = await request(app)
        .put('/api/services/service1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.service).toBeDefined();
      expect(Service.findByIdAndUpdate).toHaveBeenCalledWith(
        'service1',
        updateData,
        { new: true, runValidators: true }
      );
    });

    it('should return error when trying to update service of another provider', async () => {
      const updateData = {
        name: 'Updated Service Name'
      };

      const mockService = {
        _id: 'service1',
        provider: 'anotherProviderId' // Different provider
      };

      Service.findById.mockResolvedValue(mockService);

      const response = await request(app)
        .put('/api/services/service1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Not authorized to update this service');
    });
  });

  describe('DELETE /api/services/:id', () => {
    beforeEach(() => {
      const providerToken = jwt.sign({ userId: mockProviderUser._id }, process.env.JWT_SECRET || 'test_secret');
      authToken = providerToken;
      User.findById.mockResolvedValue(mockProviderUser);
    });

    it('should delete service successfully', async () => {
      const mockService = {
        _id: 'service1',
        provider: mockProviderUser._id
      };

      Service.findById.mockResolvedValue(mockService);
      Service.findByIdAndDelete.mockResolvedValue(mockService);

      const response = await request(app)
        .delete('/api/services/service1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Service deleted successfully');
      expect(Service.findByIdAndDelete).toHaveBeenCalledWith('service1');
    });

    it('should return error when trying to delete service of another provider', async () => {
      const mockService = {
        _id: 'service1',
        provider: 'anotherProviderId' // Different provider
      };

      Service.findById.mockResolvedValue(mockService);

      const response = await request(app)
        .delete('/api/services/service1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Not authorized to delete this service');
    });
  });
});
