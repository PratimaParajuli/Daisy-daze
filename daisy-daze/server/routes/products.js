// Public catalog reads and admin-only product create, update, and delete routes.
import { Router } from 'express'
import Product from '../models/Product.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
const adminOnly = [requireAuth, requireAdmin]

router.get('/', async (_req, res, next) => {
  try { return res.json(await Product.find({ inStock: true }).sort({ createdAt: -1 })) } catch (error) { return next(error) }
})

router.post('/', ...adminOnly, async (req, res, next) => {
  try { return res.status(201).json(await Product.create(req.body)) } catch (error) { return next(error) }
})

router.put('/:id', ...adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ message: 'We could not find that little love.' })
    return res.json(product)
  } catch (error) { return next(error) }
})

router.delete('/:id', ...adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'We could not find that little love.' })
    return res.json({ message: 'Product removed.' })
  } catch (error) { return next(error) }
})

export default router