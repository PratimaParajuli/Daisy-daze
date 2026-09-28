// Account creation and login; public registration never grants admin access.
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role })
const tokenFor = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return res.status(400).json({ message: 'Enter your name, a valid email, and a password with at least 8 characters.' })
    }
    const normalizedEmail = email.trim().toLowerCase()
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account already exists for that email.' })
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) })
    return res.status(201).json({ user: publicUser(user), token: tokenFor(user) })
  } catch (error) { return next(error) }
})

router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const user = await User.findOne({ email }).select('+password')
    if (!user || !await bcrypt.compare(req.body.password || '', user.password)) return res.status(401).json({ message: 'That email and password do not match.' })
    return res.json({ user: publicUser(user), token: tokenFor(user) })
  } catch (error) { return next(error) }
})

export default router