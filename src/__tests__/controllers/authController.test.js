const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// Mock the User model
jest.mock('../../models/User');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'pet_owner',
        phone: '1234567890'
      };

      const mockUser = {
        _id: 'mockUserId',
        ...userData,
        generateAuthToken: jest.fn().mockReturnValue('mockToken')
      };

      // Mock User.findOne to return null (user doesn't exist)
      User.findOne.mockResolvedValue(null);
      // Mock User.create to return the new user
      User.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBe('mockToken');
      expect(response.body.data.user).toBeDefined();
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    it('should return error if user already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'pet_owner'
      };

      const existingUser = {
        _id: 'existingUserId',
        email: 'john@example.com'
      };

      User.findOne.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User already exists with this email');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: not a valid email
        password: '123' // Invalid: too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'mockUserId',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'pet_owner',
        comparePassword: jest.fn().mockResolvedValue(true),
        generateAuthToken: jest.fn().mockReturnValue('mockToken')
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBe('mockToken');
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: 'mockUserId',
        email: 'john@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const mockUser = {
        _id: 'mockUserId',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'pet_owner'
      };

      const token = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET || 'test_secret');

      User.findById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should return error for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });
});
