// Store branding, category navigation, search, account, admin, and bag controls.
import { Search, ShoppingBag, UserRound, LayoutDashboard } from 'lucide-react'
import { formatINR, FREE_DELIVERY_MINIMUM } from '../lib/currency.js'

export default function Header({ count, onCart, onAccount, onAdmin, user, search, onSearch }) {
  return (
    <>
      <div className="announcement">Fresh flower delivery, free on orders over {formatINR(FREE_DELIVERY_MINIMUM)} <span>✿</span></div>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Daisy Daze home"><span className="brand-flower">✿</span><span>Daisy Daze<small>FLOWERS & LITTLE LOVES</small></span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#shop">Shop all</a><a href="#shop" onClick={() => onSearch('Bouquets')}>Bouquets</a><a href="#shop" onClick={() => onSearch('Garlands & Gajras')}>Gajras</a><a href="#shop" onClick={() => onSearch('Plush friends')}>Plush friends</a><a href="#our-story">Our little story</a>
        </nav>
        <div className="header-actions">
          <label className="search-box"><Search size={17} /><input aria-label="Search products" placeholder="Find something lovely" value={search} onChange={(event) => onSearch(event.target.value)} /></label>
          {user?.role === 'admin' && <button className="icon-button" aria-label="Open shop dashboard" title="Shop dashboard" onClick={onAdmin}><LayoutDashboard size={19} /></button>}
          <button className="icon-button account-button" aria-label={user ? 'Account' : 'Sign in'} onClick={onAccount}><UserRound size={19} /></button>
          <button className="icon-button bag-button" aria-label={`Shopping bag, ${count} items`} onClick={onCart}><ShoppingBag size={19} /><span className="bag-count">{count}</span></button>
        </div>
      </header>
    </>
  )
}