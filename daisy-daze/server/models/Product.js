// MongoDB record for one catalog item, its category, price, and stock state.
import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, enum: ['Flowers', 'Bouquets', 'Gifts'], required: true },
  price: { type: Number, required: true, min: 0.01 },
  tag: { type: String, default: 'Made with love', maxlength: 40 },
  image: { type: String, required: true },
  description: { type: String, required: true, maxlength: 240 },
  inStock: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Product', productSchema)