// Storefront state and page composition: catalog, cart, account, and checkout.
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Flower2, Heart, Instagram, Truck } from 'lucide-react'
import Header from './components/Header.jsx'
import HeroSection from './components/HeroSection.jsx'
import ProductCard from './components/ProductCard.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import AccountModal from './components/AccountModal.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import { products as starterProducts } from './data/products.js'
import { api, readLocal, writeLocal } from './lib/api.js'

const categories = ['Everything lovely', 'Flowers', 'Bouquets', 'Gifts']

export default function App() {
  const [products, setProducts] = useState(() => readLocal('daisy-products-inr-v1', starterProducts))
  const [cart, setCart] = useState(() => readLocal('daisy-cart-inr-v1', []))
  const [favorites, setFavorites] = useState(() => readLocal('daisy-favorites-inr-v1', []))
  const [user, setUser] = useState(() => readLocal('daisy-user', null))
  const [category, setCategory] = useState(categories[0])
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [latestOrder, setLatestOrder] = useState(() => readLocal('daisy-latest-order-inr-v1', null))
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api('/products').then((items) => {
      if (items.length) {
        setProducts(items)
        writeLocal('daisy-products-inr-v1', items)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => { writeLocal('daisy-cart-inr-v1', cart) }, [cart])
  useEffect(() => { writeLocal('daisy-favorites-inr-v1', favorites) }, [favorites])
  useEffect(() => { if (latestOrder) writeLocal('daisy-latest-order-inr-v1', latestOrder) }, [latestOrder])
  useEffect(() => { if (notice) { const timeout = setTimeout(() => setNotice(''), 2600); return () => clearTimeout(timeout) } }, [notice])

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === categories[0] || product.category === category
    const query = search.toLowerCase().trim()
    return matchesCategory && (!query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query))
  }), [products, category, search])
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function addToCart(product) {
    setCart((current) => {
      const found = current.find((item) => item._id === product._id)
      return found ? current.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]
    })
    setNotice(`${product.name} added to your bag`)
  }

  function changeQuantity(id, change) {
    setCart((current) => current.map((item) => item._id === id ? { ...item, quantity: item.quantity + change } : item).filter((item) => item.quantity > 0))
  }

  async function placeOrder(customer) {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const payload = { customer, items: cart.map(({ _id, name, price, quantity }) => ({ productId: _id, name, price, quantity })), total }

    let createdOrder = {
      ...payload,
      _id: `local-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // Persist signed-in orders through the API; keep guest demo orders locally.
    if (user?.token) {
      try {
        createdOrder = await api('/orders', { method: 'POST', token: user.token, body: JSON.stringify(payload) })
      } catch (error) {
        if (!(error instanceof TypeError)) throw error
        const localOrders = readLocal('daisy-orders-inr-v1', [])
        writeLocal('daisy-orders-inr-v1', [createdOrder, ...localOrders])
      }
    } else {
      const localOrders = readLocal('daisy-orders-inr-v1', [])
      writeLocal('daisy-orders-inr-v1', [createdOrder, ...localOrders])
    }

    setLatestOrder(createdOrder)
    setCart([])
    setOrderComplete(true)
  }

  async function login(credentials) {
    const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
    const nextUser = { ...result.user, token: result.token }
    setUser(nextUser)
    writeLocal('daisy-user', nextUser)
  }

  async function register(details) {
    const result = await api('/auth/register', { method: 'POST', body: JSON.stringify(details) })
    const nextUser = { ...result.user, token: result.token }
    setUser(nextUser)
    writeLocal('daisy-user', nextUser)
  }

  function logout() {
    setUser(null)
    writeLocal('daisy-user', null)
  }

  function selectCategory(value) {
    setCategory(value)
    setSearch('')
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  return <div className="app-shell"><Header count={itemCount} onCart={() => { setCartOpen(true); setOrderComplete(false) }} onAccount={() => setAccountOpen(true)} onAdmin={() => setAdminOpen(true)} user={user} search={search} onSearch={(value) => { if (categories.includes(value)) selectCategory(value); else { setCategory(categories[0]); setSearch(value) } }} /><main><HeroSection onShop={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })} /><section className="shop-section" id="shop"><div className="section-intro"><div><p className="eyebrow"><span /> THE LITTLE LOVE SHOP</p><h2>Find your <em>kind of lovely.</em></h2></div><p>For your favourite person, your favourite place,<br />or just because it's Tuesday.</p></div><div className="shop-toolbar"><div className="category-tabs" role="tablist" aria-label="Shop by category">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)} role="tab" aria-selected={category === item}>{item}</button>)}</div><span className="results-count">{visibleProducts.length} little {visibleProducts.length === 1 ? 'love' : 'loves'}</span></div>{visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product._id} product={product} onAdd={addToCart} favorite={favorites.includes(product._id)} onFavorite={(id) => setFavorites((current) => current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id])} />)}</div> : <div className="no-results"><span>✿</span><h3>No little loves found just yet.</h3><button className="text-link" onClick={() => { setSearch(''); setCategory(categories[0]) }}>See everything lovely <ArrowRight size={15} /></button></div>}<div className="shop-bottom"><Flower2 size={17} /><span>Handpicked, hand-tied, and sent with love.</span></div></section><section className="story-section" id="our-story"><div className="story-image"><img src="https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=1200&q=85" alt="Florist arranging a bouquet of seasonal flowers" /></div><div className="story-copy"><p className="eyebrow">A LITTLE ABOUT US</p><h2>Life's sweeter<br />with <em>flowers</em> in it.</h2><p>We're a tiny neighbourhood flower shop with a soft spot for the thoughtful things. Every bunch is gathered fresh, tied by hand, and sent off to make somebody's day feel a little more like theirs.</p><a className="text-link" href="#shop">Come say hello <ArrowRight size={16} /></a><span className="story-scribble">✿</span></div></section><section className="promise-strip"><div><Truck size={20} /><span><strong>Fresh, always</strong><small>Flowers gathered to order</small></span></div><div><Heart size={20} /><span><strong>Made with heart</strong><small>Thoughtful in every detail</small></span></div><div><Flower2 size={20} /><span><strong>Little joys, big love</strong><small>For giving or keeping</small></span></div></section></main><footer className="site-footer"><a className="wordmark footer-brand" href="#top"><span className="brand-flower">✿</span><span>Daisy Daze<small>FLOWERS & LITTLE LOVES</small></span></a><span>For the sweet little moments. © 2025 Daisy Daze.</span><a href="https://www.instagram.com/" aria-label="Instagram"><Instagram size={19} /></a></footer>{cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onChangeQuantity={changeQuantity} onCheckout={placeOrder} complete={orderComplete} latestOrder={latestOrder} />}{accountOpen && <AccountModal onClose={() => setAccountOpen(false)} onLogin={login} onRegister={register} user={user} onLogout={logout} />}{adminOpen && user?.role === 'admin' && <AdminPanel token={user.token} onClose={() => setAdminOpen(false)} onProductsChange={(items) => { setProducts(items); writeLocal('daisy-products', items) }} />}{notice && <div className="toast" role="status"><Heart size={15} fill="currentColor" />{notice}</div>}</div>
}