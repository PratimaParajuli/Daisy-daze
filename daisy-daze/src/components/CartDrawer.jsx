// Shopping bag summary and Indian delivery details collected at checkout.
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { formatINR, FREE_DELIVERY_MINIMUM } from '../lib/currency.js'

export default function CartDrawer({ cart, onClose, onChangeQuantity, onCheckout, complete }) {
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '', city: '', pincode: '', deliveryDate: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function submitOrder(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onCheckout(customer)
    } catch (checkoutError) {
      setError(checkoutError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-drawer" aria-label="Shopping bag">
        <div className="drawer-header"><div><span className="eyebrow">YOUR LITTLE TREASURES</span><h2>Your bag <span>({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div><button className="icon-button" aria-label="Close bag" onClick={onClose}><X size={20} /></button></div>
        {complete ? <div className="order-success"><span className="success-flower">✿</span><h2>Love is on its way.</h2><p>Your order is tucked in safely. We can't wait for it to make someone's day.</p><button className="button button-dark" onClick={onClose}>Keep wandering <ArrowRight size={16} /></button></div> : cart.length === 0 ? <div className="empty-bag"><ShoppingBag size={30} /><h3>A little room for lovely things.</h3><p>Your bag is waiting for its first bloom.</p><button className="text-link" onClick={onClose}>Back to the good stuff <ArrowLeft size={15} /></button></div> : <>
          <div className="cart-items">{cart.map((item) => <div className="cart-item" key={item._id}><img src={item.image} alt="" /><div className="cart-item-info"><h3>{item.name}</h3><span>{formatINR(item.price)}</span><div className="quantity-control"><button aria-label={`Remove one ${item.name}`} onClick={() => onChangeQuantity(item._id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label={`Add one ${item.name}`} onClick={() => onChangeQuantity(item._id, 1)}><Plus size={13} /></button></div></div><strong>{formatINR(item.price * item.quantity)}</strong></div>)}</div>
          <form className="checkout-form" onSubmit={submitOrder}><label>Your name<input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="A lovely name" /></label><label>Email address<input required type="email" autoComplete="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="you@example.com" /></label><div className="form-row"><label>Mobile number<input required type="tel" autoComplete="tel-national" inputMode="numeric" pattern="[6-9][0-9]{9}" title="Enter a 10-digit Indian mobile number" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="10-digit number" /></label><label>PIN code<input required inputMode="numeric" pattern="[1-9][0-9]{5}" title="Enter a 6-digit PIN code" value={customer.pincode} onChange={(event) => setCustomer({ ...customer, pincode: event.target.value })} placeholder="6-digit PIN" /></label></div><label>Delivery address<input required autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="House, street, area" /></label><div className="form-row"><label>City<input required autoComplete="address-level2" value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} placeholder="Your city" /></label><label>Delivery date<input type="date" value={customer.deliveryDate} onChange={(event) => setCustomer({ ...customer, deliveryDate: event.target.value })} /></label></div><label>A little note<input value={customer.note} onChange={(event) => setCustomer({ ...customer, note: event.target.value })} placeholder="Optional" /></label>{error && <p className="form-error">{error}</p>}<div className="cart-total"><span>Subtotal</span><strong>{formatINR(total)}</strong></div><p className="shipping-note">{total >= FREE_DELIVERY_MINIMUM ? 'Your delivery is on us!' : `${formatINR(FREE_DELIVERY_MINIMUM - total)} away from free delivery`}</p><button className="button button-dark checkout-button" type="submit" disabled={busy}>{busy ? 'Tucking in your order...' : 'Place my order'} <ArrowRight size={17} /></button><p className="checkout-note">We’ll confirm your delivery details soon</p></form>
        </>}
      </aside>
    </div>
  )
}