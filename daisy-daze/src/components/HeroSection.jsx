// Homepage introduction and the primary shortcut to the product catalog.
import { ArrowDown, ArrowUpRight, Heart } from 'lucide-react'

export default function HeroSection({ onShop }) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy"><p className="eyebrow"><span /> A FLOWER SHOP FOR FEELING THINGS</p><h1>A little joy,<br /><em>in every</em> bloom.</h1><p className="hero-description">Fresh roses, fragrant mogra, festive marigolds, and huggable friends, wrapped up for every kind of celebration.</p><button className="button button-dark" onClick={onShop}>Find your little something <ArrowUpRight size={17} /></button><div className="hero-footnote"><span className="footnote-icon"><Heart size={16} /></span> Made by hand, with a whole lot of heart</div></div>
      <div className="hero-photo"><img src="https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1500&q=90" alt="A dreamy bunch of peach and pink garden flowers" /><div className="photo-caption"><span>FRESH FROM THE FLOWER BAR</span><strong>A bouquet for your kind of day</strong></div><div className="hero-stamp">GROWN<br />WITH<br /><span>LOVE</span><i>✿</i></div></div>
      <a className="scroll-cue" href="#shop"><ArrowDown size={15} /> A LITTLE FURTHER DOWN</a>
    </section>
  )
}