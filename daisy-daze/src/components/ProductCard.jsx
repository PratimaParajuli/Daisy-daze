// Reusable catalog tile with favorite and quick-add actions.
import { Heart, Plus } from 'lucide-react'
import { formatINR } from '../lib/currency.js'

export default function ProductCard({ product, onAdd, favorite, onFavorite }) {
  return (
    <article className="product-card">
      <div className="product-image"><img src={product.image} alt={product.name} loading="lazy" /><span className="product-tag">{product.tag || product.category}</span><button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} aria-label={favorite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`} onClick={() => onFavorite(product._id)}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button><button className="quick-add" aria-label={`Add ${product.name} to bag`} onClick={() => onAdd(product)}><Plus size={17} /> Add to bag</button></div>
      <div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><span className="product-price">{formatINR(product.price)}</span></div>
    </article>
  )
}