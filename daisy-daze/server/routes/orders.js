// Create orders from database prices and expose customer/admin tracking routes.
import { Router } from 'express'
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.post('/', async (req, res, next) => {
  try {
    const { customer, items } = req.body
    if (!customer?.name?.trim() || !customer?.email?.trim() || !/^[6-9][0-9]{9}$/.test(customer?.phone || '') || !customer?.address?.trim() || !customer?.city?.trim() || !/^[1-9][0-9]{5}$/.test(customer?.pincode || '') || !Array.isArray(items) || items.length === 0 || items.length > 30) {
      return res.status(400).json({ message: 'Add your delivery details and at least one item.' })
    }
    const quantities = new Map()
    for (const item of items) {
      if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 25) {
        return res.status(400).json({ message: 'One of the items in your bag is not valid.' })
      }
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity)
    }
    const products = await Product.find({ _id: { $in: [...quantities.keys()] }, inStock: true })
    if (products.length !== quantities.size) return res.status(400).json({ message: 'A little something in your bag is no longer available.' })
    const orderItems = products.map((product) => ({ productId: product._id.toString(), name: product.name, price: product.price, quantity: quantities.get(product._id.toString()) }))
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const order = await Order.create({ user: req.user.id, customer, items: orderItems, total })
    return res.status(201).json(order)
  } catch (error) { return next(error) }
})

router.get('/mine', async (req, res, next) => {
  try { return res.json(await Order.find({ user: req.user.id }).sort({ createdAt: -1 })) } catch (error) { return next(error) }
})

router.get('/', requireAdmin, async (_req, res, next) => {
  try { return res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 })) } catch (error) { return next(error) }
})

router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const allowed = ['pending', 'preparing', 'out-for-delivery', 'delivered']
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid order status.' })
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true })
    if (!order) return res.status(404).json({ message: 'We could not find that order.' })
    return res.json(order)
  } catch (error) { return next(error) }
})

export default router