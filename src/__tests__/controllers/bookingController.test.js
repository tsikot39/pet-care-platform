const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const Pet = require('../../models/Pet');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// Mock the models
jest.mock('../../models/Booking');
jest.mock('../../models/Service');
jest.mock('../../models/Pet');
jest.mock('../../models/User');

describe('Booking Controller', () => {
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

  describe('GET /api/bookings', () => {
    it('should get all bookings for authenticated user', async () => {
      const mockBookings = [
        {
          _id: 'booking1',
          service: 'service1',
          pet: 'pet1',
          user: mockUser._id,
          date: new Date(),
          status: 'pending'
        },
        {
          _id: 'booking2',
          service: 'service2',
          pet: 'pet2',
          user: mockUser._id,
          date: new Date(),
          status: 'confirmed'
        }
      ];

      Booking.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockBookings)
        })
      });

      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.bookings).toHaveLength(2);
      expect(Booking.find).toHaveBeenCalledWith({ user: mockUser._id });
    });

    it('should return error for unauthenticated user', async () => {
      const response = await request(app)
        .get('/api/bookings');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        service: 'service1',
        pet: 'pet1',
        date: new Date().toISOString(),
        timeSlot: '10:00 AM',
        notes: 'Regular checkup'
      };

      const mockService = {
        _id: 'service1',
        name: 'Pet Grooming',
        price: 50,
        duration: 60
      };

      const mockPet = {
        _id: 'pet1',
        name: 'Buddy',
        owner: mockUser._id
      };

      const mockBooking = {
        _id: 'newBookingId',
        ...bookingData,
        user: mockUser._id,
        status: 'pending'
      };

      Service.findById.mockResolvedValue(mockService);
      Pet.findById.mockResolvedValue(mockPet);
      Booking.create.mockResolvedValue(mockBooking);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.booking).toBeDefined();
      expect(Booking.create).toHaveBeenCalledWith({
        ...bookingData,
        user: mockUser._id
      });
    });

    it('should return error for invalid service', async () => {
      const bookingData = {
        service: 'invalidService',
        pet: 'pet1',
        date: new Date().toISOString(),
        timeSlot: '10:00 AM'
      };

      Service.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Service not found');
    });

    it('should return error for invalid pet', async () => {
      const bookingData = {
        service: 'service1',
        pet: 'invalidPet',
        date: new Date().toISOString(),
        timeSlot: '10:00 AM'
      };

      const mockService = {
        _id: 'service1',
        name: 'Pet Grooming',
        price: 50
      };

      Service.findById.mockResolvedValue(mockService);
      Pet.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Pet not found');
    });

    it('should return error when trying to book pet of another user', async () => {
      const bookingData = {
        service: 'service1',
        pet: 'pet1',
        date: new Date().toISOString(),
        timeSlot: '10:00 AM'
      };

      const mockService = {
        _id: 'service1',
        name: 'Pet Grooming',
        price: 50
      };

      const mockPet = {
        _id: 'pet1',
        name: 'Buddy',
        owner: 'anotherUserId' // Different owner
      };

      Service.findById.mockResolvedValue(mockService);
      Pet.findById.mockResolvedValue(mockPet);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Not authorized to book for this pet');
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should get booking by id for owner', async () => {
      const mockBooking = {
        _id: 'booking1',
        service: 'service1',
        pet: 'pet1',
        user: mockUser._id,
        date: new Date(),
        status: 'pending'
      };

      Booking.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockBooking)
        })
      });

      const response = await request(app)
        .get('/api/bookings/booking1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.booking).toBeDefined();
      expect(Booking.findById).toHaveBeenCalledWith('booking1');
    });

    it('should return error for non-existent booking', async () => {
      Booking.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      });

      const response = await request(app)
        .get('/api/bookings/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Booking not found');
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should update booking successfully', async () => {
      const updateData = {
        status: 'confirmed',
        notes: 'Updated notes'
      };

      const mockBooking = {
        _id: 'booking1',
        service: 'service1',
        pet: 'pet1',
        user: mockUser._id,
        status: 'pending'
      };

      const updatedBooking = {
        ...mockBooking,
        ...updateData
      };

      Booking.findById.mockResolvedValue(mockBooking);
      Booking.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(updatedBooking)
        })
      });

      const response = await request(app)
        .put('/api/bookings/booking1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.booking).toBeDefined();
      expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(
        'booking1',
        updateData,
        { new: true, runValidators: true }
      );
    });

    it('should return error when trying to update booking of another user', async () => {
      const updateData = {
        status: 'confirmed'
      };

      const mockBooking = {
        _id: 'booking1',
        user: 'anotherUserId' // Different user
      };

      Booking.findById.mockResolvedValue(mockBooking);

      const response = await request(app)
        .put('/api/bookings/booking1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Not authorized to update this booking');
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should delete booking successfully', async () => {
      const mockBooking = {
        _id: 'booking1',
        user: mockUser._id
      };

      Booking.findById.mockResolvedValue(mockBooking);
      Booking.findByIdAndDelete.mockResolvedValue(mockBooking);

      const response = await request(app)
        .delete('/api/bookings/booking1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Booking deleted successfully');
      expect(Booking.findByIdAndDelete).toHaveBeenCalledWith('booking1');
    });

    it('should return error when trying to delete booking of another user', async () => {
      const mockBooking = {
        _id: 'booking1',
        user: 'anotherUserId' // Different user
      };

      Booking.findById.mockResolvedValue(mockBooking);

      const response = await request(app)
        .delete('/api/bookings/booking1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Not authorized to delete this booking');
    });
  });
});
