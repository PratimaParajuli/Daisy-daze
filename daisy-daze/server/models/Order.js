// Order snapshot with INR totals and the customer's Indian delivery address.
import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true, maxlength: 240 },
    city: { type: String, required: true, maxlength: 80 },
    pincode: { type: String, required: true, match: /^[1-9][0-9]{5}$/ },
    deliveryDate: { type: String, default: '' },
    note: { type: String, default: '', maxlength: 300 },
  },
  items: [{ productId: String, name: String, price: Number, quantity: { type: Number, min: 1 } }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'preparing', 'out-for-delivery', 'delivered'], default: 'pending' },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)