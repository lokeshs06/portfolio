import bcrypt from 'bcryptjs'

process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://placeholder'
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long'
process.env.JWT_EXPIRES_IN = '1h'
process.env.ADMIN_EMAIL = 'admin@example.com'
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-horse-battery', 4)
process.env.CLIENT_ORIGIN = 'http://localhost:5173'
