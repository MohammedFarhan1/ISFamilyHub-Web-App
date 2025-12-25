const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')

// Mock validation
jest.mock('../utils/validation', () => ({
  loginSchema: {
    parse: jest.fn((data) => data)
  }
}))

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token')
}))

const authRoutes = require('../routes/auth')
const Admin = require('../models/Admin')

// Mock Admin model
jest.mock('../models/Admin')

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/auth', authRoutes)

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const mockAdmin = {
        _id: '1',
        username: 'Farhan',
        name: 'Farhan',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
        lastLogin: new Date()
      }
      
      Admin.findOne.mockResolvedValue(mockAdmin)

      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'Farhan', password: 'Farhan8776' })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Login successful')
      expect(response.body.admin.username).toBe('Farhan')
    })

    test('should reject invalid credentials', async () => {
      Admin.findOne.mockResolvedValue(null)

      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'invalid', password: 'wrong' })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('Invalid credentials')
    })
  })

  describe('POST /auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Logout successful')
    })
  })
})