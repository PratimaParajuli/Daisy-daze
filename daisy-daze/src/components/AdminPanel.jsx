// Admin workspace for product maintenance and order status updates.
import { useEffect, useState } from 'react'
import { ArrowLeft, PackagePlus, Pencil, Trash2, X } from 'lucide-react'
import { api, writeLocal } from '../lib/api.js'
import { formatINR } from '../lib/currency.js'

export default function AdminPanel({ token, onClose, onProductsChange }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('orders')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'Bouquets', price: '', image: '', description: '', tag: 'Made with love' })

  async function loadDashboard() {
    try {
      const [productData, orderData] = await Promise.all([api('/products'), api('/orders', { token })])
      setProducts(productData)
      writeLocal('daisy-products-inr-v1', productData)
      onProductsChange(productData)
      setOrders(orderData)
    } catch (loadError) {
      setError(loadError.message)
    }
  }

  useEffect(() => { loadDashboard() }, [])

  async function addProduct(event) {
    event.preventDefault()
    setError('')
    try {
      await api(editingId ? `/products/${editingId}` : '/products', { method: editingId ? 'PUT' : 'POST', token, body: JSON.stringify({ ...form, price: Number(form.price) }) })
      setForm({ name: '', category: 'Bouquets', price: '', image: '', description: '', tag: 'Made with love' })
      setEditingId(null)
      await loadDashboard()
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  async function removeProduct(productId) {
    try {
      await api(`/products/${productId}`, { method: 'DELETE', token })
      await loadDashboard()
    } catch (removeError) {
      setError(removeError.message)
    }
  }

  function editProduct(product) {
    setEditingId(product._id)
    setForm({ name: product.name, category: product.category, price: product.price, image: product.image, description: product.description, tag: product.tag || '' })
    document.querySelector('.admin-panel')?.scrollTo({ top: 360, behavior: 'smooth' })
  }

  async function updateStatus(orderId, status) {
    try {
      await api(`/orders/${orderId}`, { method: 'PATCH', token, body: JSON.stringify({ status }) })
      await loadDashboard()
    } catch (statusError) {
      setError(statusError.message)
    }
  }

  return <div className="overlay admin-overlay"><section className="admin-panel"><header className="admin-header"><button className="text-link" onClick={onClose}><ArrowLeft size={16} /> Back to shop</button><span className="eyebrow">DAISY DAZE · SHOP STUDIO</span><button className="icon-button" aria-label="Close dashboard" onClick={onClose}><X size={19} /></button></header><div className="admin-title"><div><p className="eyebrow">YOUR LITTLE EMPIRE</p><h1>The shop studio</h1></div><div className="admin-stats"><span><strong>{products.length}</strong> little loves</span><span><strong>{orders.length}</strong> orders</span></div></div><div className="admin-tabs"><button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders <span>{orders.length}</span></button><button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products <span>{products.length}</span></button></div>{error && <p className="form-error">{error}</p>}{tab === 'orders' ? <div className="admin-orders">{orders.length ? orders.map((order) => <article className="admin-order" key={order._id}><div><span className="eyebrow">ORDER · {order._id.slice(-7).toUpperCase()}</span><h3>{order.customer?.name || 'Lovely customer'}</h3><p>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p><p>{order.customer?.phone} · {order.customer?.address}, {order.customer?.city} {order.customer?.pincode}</p></div><div className="order-meta"><strong>{formatINR(order.total)}</strong><select aria-label="Order status" value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)}><option value="pending">Pending</option><option value="preparing">Preparing</option><option value="out-for-delivery">Out for delivery</option><option value="delivered">Delivered</option></select></div></article>) : <div className="empty-admin"><span>✿</span><p>Your first lovely order will land here.</p></div>}</div> : <div className="admin-products"><form className="product-form" onSubmit={addProduct}><h2><PackagePlus size={18} /> {editingId ? 'Update this little love' : 'Add a little something'}</h2><div className="admin-form-grid"><label>Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Flowers</option><option>Bouquets</option><option>Gifts</option></select></label><label>Price (₹)<input required type="number" min="1" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label>Image URL<input required type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label><label className="admin-description">Description<input required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div><div className="admin-form-actions"><button className="button button-dark">{editingId ? 'Save changes' : 'Add product'} <PackagePlus size={16} /></button>{editingId && <button type="button" className="text-link" onClick={() => { setEditingId(null); setForm({ name: '', category: 'Bouquets', price: '', image: '', description: '', tag: 'Made with love' }) }}>Cancel editing</button>}</div></form><div className="admin-product-list">{products.map((product) => <div key={product._id}><img src={product.image} alt="" /><span>{product.name}<small>{product.category}</small></span><strong>{formatINR(product.price)}</strong><div className="admin-product-actions"><button className="icon-button" aria-label={`Edit ${product.name}`} title="Edit product" onClick={() => editProduct(product)}><Pencil size={15} /></button><button className="icon-button" aria-label={`Remove ${product.name}`} title="Remove product" onClick={() => removeProduct(product._id)}><Trash2 size={15} /></button></div></div>)}</div></div>}</section></div>
}