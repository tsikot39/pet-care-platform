const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Pet = require('../../models/Pet');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// Mock the models
jest.mock('../../models/Pet');
jest.mock('../../models/User');

describe('Pet Controller', () => {
  let authToken;
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = {
      _id: 'mockUserId',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'pet_owner'
    };

    authToken = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET || 'test_secret');
    User.findById.mockResolvedValue(mockUser);
  });

  describe('GET /api/pets', () => {
    it('should get all pets for authenticated user', async () => {
      const mockPets = [
        {
          _id: 'pet1',
          name: 'Buddy',
          type: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          owner: mockUser._id
        },
        {
          _id: 'pet2',
          name: 'Whiskers',
          type: 'cat',
          breed: 'Persian',
          age: 2,
          owner: mockUser._id
        }
      ];

      Pet.find.mockResolvedValue(mockPets);

      const response = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.pets).toHaveLength(2);
      expect(Pet.find).toHaveBeenCalledWith({ owner: mockUser._id });
    });

    it('should return error for unauthenticated user', async () => {
      const response = await request(app)
        .get('/api/pets');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/pets', () => {
    it('should create a new pet successfully', async () => {
      const petData = {
        name: 'Max',
        type: 'dog',
        breed: 'Labrador',
        age: 2,
        gender: 'male',
        weight: 30,
        color: 'black',
        description: 'Friendly dog'
      };

      const mockPet = {
        _id: 'newPetId',
        ...petData,
        owner: mockUser._id
      };

      Pet.create.mockResolvedValue(mockPet);

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(petData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.pet).toBeDefined();
      expect(Pet.create).toHaveBeenCalledWith({
        ...petData,
        owner: mockUser._id
      });
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        name: '', // Required field missing
        type: 'invalid_type', // Invalid type
        age: -1 // Invalid age
      };

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/pets/:id', () => {
    it('should get pet by id for owner', async () => {
      const mockPet = {
        _id: 'pet1',
        name: 'Buddy',
        type: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        owner: mockUser._id
      };

      Pet.findById.mockResolvedValue(mockPet);

      const response = await request(app)
        .get('/api/pets/pet1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.pet).toBeDefined();
      expect(Pet.findById).toHaveBeenCalledWith('pet1');
    });

    it('should return error for non-existent pet', async () => {
      Pet.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/pets/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Pet not found');
    });
  });

  describe('PUT /api/pets/:id', () => {
    it('should update pet successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        age: 4
      };

      const mockPet = {
        _id: 'pet1',
        name: 'Buddy',
        type: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        owner: mockUser._id
      };

      const updatedPet = {
        ...mockPet,
        ...updateData
      };

      Pet.findById.mockResolvedValue(mockPet);
      Pet.findByIdAndUpdate.mockResolvedValue(updatedPet);

      const response = await request(app)
        .put('/api/pets/pet1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.pet).toBeDefined();
      expect(Pet.findByIdAndUpdate).toHaveBeenCalledWith(
        'pet1',
        updateData,
        { new: true, runValidators: true }
      );
    });

    it('should return error when trying to update pet of another user', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const mockPet = {
        _id: 'pet1',
        name: 'Buddy',
        owner: 'anotherUserId' // Different owner
      };

      Pet.findById.mockResolvedValue(mockPet);

      const response = await request(app)
        .put('/api/pets/pet1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Not authorized to update this pet');
    });
  });

  describe('DELETE /api/pets/:id', () => {
    it('should delete pet successfully', async () => {
      const mockPet = {
        _id: 'pet1',
        name: 'Buddy',
        owner: mockUser._id
      };

      Pet.findById.mockResolvedValue(mockPet);
      Pet.findByIdAndDelete.mockResolvedValue(mockPet);

      const response = await request(app)
        .delete('/api/pets/pet1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Pet deleted successfully');
      expect(Pet.findByIdAndDelete).toHaveBeenCalledWith('pet1');
    });

    it('should return error when trying to delete pet of another user', async () => {
      const mockPet = {
        _id: 'pet1',
        name: 'Buddy',
        owner: 'anotherUserId' // Different owner
      };

      Pet.findById.mockResolvedValue(mockPet);

      const response = await request(app)
        .delete('/api/pets/pet1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Not authorized to delete this pet');
    });
  });
});
