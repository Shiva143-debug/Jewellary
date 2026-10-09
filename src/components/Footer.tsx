import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Compass, ShieldAlert, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass text-white border-t border-white/10 pt-16 pb-8" id="boutique-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core footer elements */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-extrabold tracking-[0.2em] text-gold bg-gradient-to-r from-gold-light via-gold to-gold-bright bg-clip-text text-transparent">
                AURUM
              </span>
              <span className="text-[10px] tracking-[0.4em] text-gold/60 uppercase -mt-0.5 font-sans">
                Fine Jewelry
              </span>
            </div>
            
            <p className="text-xs text-gray-400 font-sans leading-relaxed font-light">
              Designing ethical, heirloom-quality solid gold treasures and conflict-free diamond masterworks since 1996. Our legacy is defined by luxury, authenticity, and pristine craftsmanship.
            </p>

            {/* Social handles */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 glass rounded-full text-gold-light hover:text-gold transition-colors">
                <Instagram size={14} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 glass rounded-full text-gold-light hover:text-gold transition-colors">
                <Facebook size={14} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 glass rounded-full text-gold-light hover:text-gold transition-colors">
                <Twitter size={14} />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="p-2 glass rounded-full text-gold-light hover:text-gold transition-colors">
                <Compass size={14} />
              </a>
            </div>
          </div>

          {/* Quick links Col */}
          <div>
            <h4 className="font-serif text-sm font-bold text-gold-light uppercase tracking-wider mb-4 border-b border-gold/10 pb-2">Collections</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
              <li><a href="#jewelry-items" className="hover:text-gold transition-colors">Necklaces & Chokers</a></li>
              <li><a href="#jewelry-items" className="hover:text-gold transition-colors">Diamond Solitaire Rings</a></li>
              <li><a href="#jewelry-items" className="hover:text-gold transition-colors">Hoop & Drop Earrings</a></li>
              <li><a href="#jewelry-items" className="hover:text-gold transition-colors">Ethical Chain Bracelets</a></li>
              <li><a href="#jewelry-items" className="hover:text-gold transition-colors">Bridal Filigree Bangles</a></li>
            </ul>
          </div>

          {/* Customer relations Col */}
          <div>
            <h4 className="font-serif text-sm font-bold text-gold-light uppercase tracking-wider mb-4 border-b border-gold/10 pb-2">Assurance</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
              <li><span className="text-gray-400">BIS 916 Hallmark Seals</span></li>
              <li><span className="text-gray-400">GIA Certified Diamonds</span></li>
              <li><span className="text-gray-400">Lifetime Curatorial Buyback</span></li>
              <li><span className="text-gray-400">Free Fully Insured Cargo</span></li>
              <li><span className="text-gray-400">Bespoke Fitting Customizer</span></li>
            </ul>
          </div>

          {/* Contact Details of Owner (Requested explicitly) */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-gold-light uppercase tracking-wider border-b border-gold/10 pb-2">Boutique Contact Desk</h4>
            
            <ul className="space-y-3 text-xs text-gray-300 font-sans">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Flagship Boutique:</strong><br />
                  Aurum Tower, 5th Avenue, Suite 1200, New York, NY 10011
                </span>
              </li>
              
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-gold shrink-0" />
                <span>
                  <strong>VIP Desk:</strong> +1 (800) AURUM-GOLD
                </span>
              </li>

              <li className="flex items-center gap-2">
                <Mail size={14} className="text-gold shrink-0" />
                <span>
                  <strong>Curatorial Email:</strong> concierge@aurum.com
                </span>
              </li>
            </ul>


          </div>

        </div>

        {/* Bottom Bar: Copyright and safety */}
        <div className="border-t border-gold/10 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 gap-4 font-mono">
          <p>© 2026 Aurum Fine Jewelry Co. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={10} className="fill-gold text-gold" /> for fine tastes worldwide.
          </p>
        </div>

      </div>
    </footer>
  );
}
