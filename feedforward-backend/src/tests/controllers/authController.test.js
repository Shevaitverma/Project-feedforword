// tests/controllers/authController.test.js

import request from 'supertest';
import app from '../../src/app.js';
import mongoose from 'mongoose';
import User from '../../src/models/User.js';

// Connect to a test database before running tests
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

// Clean up database after each test
afterEach(async () => {
    await User.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth Controller', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    username: 'johndoe',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message');
        });

        it('should not register a user with existing email', async () => {
            await User.create({
                name: 'Jane Doe',
                email: 'jane@example.com',
                username: 'janedoe',
                password: 'password123',
            });

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    username: 'janedoe2',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Email or Username already exists');
        });
    });

    // Additional tests for login, logout, etc.
});
