// API startup, MongoDB connection/seeding, route mounting, and error responses.
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { products } from '../src/data/products.js'
import User from './models/User.js'
import Product from './models/Product.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'

const app = express()
const port = process.env.PORT || 4000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '100kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use((error, _req, res, _next) => {
  console.error(error.message)
  if (error.code === 11000) return res.status(409).json({ message: 'That email is already registered.' })
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: error.message })
  return res.status(500).json({ message: 'Something went wrong on our end.' })
})

async function seedDatabase() {
  const legacyProducts = [
    ['Sunday Morning', 58, products[10]],
    ['Peachy Keen', 48, products[11]],
    ['Cloud Nine', 64, products[12]],
    ['Little Love Note', 42, products[13]],
    ['Daisy Bear', 32, products[15]],
    ['Bunny Bloom', 28, products[16]],
    ['Petal & Pal', 76, products[17]],
    ['Tiny Celebration', 52, products[19]],
    ['Mogra Gajra Pair', 349, products[7]],
    ['Marigold Toran', 699, products[8]],
    ['Mithu the Elephant', 899, products[15]],
    ['Button Nose Teddy', 699, products[16]],
    ['Phool & Mithai Box', 1799, products[17]],
    ['Rose & Chocolate Hamper', 1599, products[18]],
    ['Birthday Khushi Box', 1299, products[19]],
  ]

  for (const [name, price, product] of legacyProducts) {
    const { _id, ...localizedProduct } = product
    await Product.findOneAndUpdate({ name, price }, localizedProduct, { runValidators: true })
  }

  for (const { _id, ...product } of products) {
    if (!await Product.exists({ name: product.name })) await Product.create(product)
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase()
    const exists = await User.exists({ email })
    if (!exists) await User.create({ name: process.env.ADMIN_NAME || 'Daisy Daze Admin', email, password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin' })
  }
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Copy .env.example to .env and set a private secret.')
  process.exit(1)
}

app.listen(port, () => console.log(`Daisy Daze API listening on http://localhost:${port}`))

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(seedDatabase)
    .then(() => console.log('MongoDB connected and starter products are ready.'))
    .catch((error) => console.error(`MongoDB connection failed: ${error.message}`))
} else {
  console.warn('MONGODB_URI is not set. API endpoints requiring the database will be unavailable.')
}