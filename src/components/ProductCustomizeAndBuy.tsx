import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Star, ShieldCheck, Truck, Gem, Sparkles, 
  HelpCircle, CreditCard, Lock, Heart, Check, RefreshCw, BadgePercent
} from 'lucide-react';
import { JewelryItem, User, NewsOffer } from '../types';

interface ProductCustomizeAndBuyProps {
  item: JewelryItem;
  currentUser: User | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onAddToCart: (item: JewelryItem, selectedSize: string, selectedCustomizations?: Record<string, string>) => void;
  offers?: NewsOffer[];
}

export default function ProductCustomizeAndBuy({
  item,
  currentUser,
  onClose,
  onOpenAuth,
  onAddToCart,
  offers = []
}: ProductCustomizeAndBuyProps) {
  // Navigation / Tab controller inside customization
  const [activeTab, setActiveTab] = useState<'details' | 'specifications' | 'policies'>('details');

  // Dynamic customizations
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});

  useEffect(() => {
    // initialize default options for custom fields
    if (item.customizations) {
      const initial: Record<string, string> = {};
      item.customizations.forEach(c => {
        if (c.options.length > 0) {
          initial[c.name] = c.options[0];
        }
      });
      setSelectedCustomizations(initial);
    }
  }, [item.customizations]);
  
  // Wishlisted state (simulated)
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Zip code checker
  const [zipCode, setZipCode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);
  const [isCheckingZip, setIsCheckingZip] = useState(false);

  // Promo code
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isCouponError, setIsCouponError] = useState(false);

  // Status
  const [isAdding, setIsAdding] = useState(false);

  // Pricing math
  const calculatePricing = () => {
    let basePrice = item.price;
    const subtotal = basePrice;
    const tax = subtotal * 0.05;
    const totalBeforeDiscount = subtotal + tax;
    const grandTotal = Math.max(10, totalBeforeDiscount - appliedDiscount);

    return {
      basePrice,
      subtotal,
      tax,
      discount: appliedDiscount,
      total: grandTotal
    };
  };

  const prices = calculatePricing();

  // Zip delivery estimation simulator
  const checkZipDelivery = () => {
    if (!zipCode.trim() || zipCode.length < 5) return;
    setIsCheckingZip(true);
    setTimeout(() => {
      setIsCheckingZip(false);
      // Deterministic estimation based on zip digits
      const days = (Number(zipCode.charAt(0)) % 4) + 3;
      const today = new Date();
      today.setDate(today.getDate() + days);
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
      setDeliveryEstimate(`Guaranteed Express Delivery by ${today.toLocaleDateString('en-US', options)}`);
    }, 800);
  };

  // Coupon application handler
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Check dynamic offers first
    const activeOffer = offers.find(o => 
      o.type === 'offer' && 
      o.discountCode && 
      o.discountCode.toUpperCase() === code
    );

    if (activeOffer) {
      if (activeOffer.expiryDate && new Date(activeOffer.expiryDate) < new Date()) {
        setCouponMessage('This offer code has expired.');
        setIsCouponError(true);
        setAppliedDiscount(0);
        return;
      }
      
      let discountVal = 0;
      if (activeOffer.discountType === 'percentage') {
        discountVal = prices.subtotal * ((activeOffer.discountValue || 0) / 100);
      } else if (activeOffer.discountType === 'fixed') {
        discountVal = activeOffer.discountValue || 0;
      }

      setAppliedDiscount(Number(discountVal.toFixed(2)));
      setCouponMessage(`👑 Code "${code}" applied successfully! ${activeOffer.discountType === 'percentage' ? activeOffer.discountValue + '%' : '₹' + activeOffer.discountValue} royal credit granted.`);
      setIsCouponError(false);
      return;
    }

    // Fallback hardcoded offers
    if (code === 'ROYAL10' || code === 'AURUM10') {
      const discountVal = prices.subtotal * 0.10; // 10% discount
      setAppliedDiscount(Number(discountVal.toFixed(2)));
      setCouponMessage(`👑 Code "${code}" applied successfully! 10% royal credit granted.`);
      setIsCouponError(false);
    } else if (code === 'LEGACY40000') {
      setAppliedDiscount(40000);
      setCouponMessage(`👑 Code "${code}" applied successfully! ₹40,000 royal credit granted.`);
      setIsCouponError(false);
    } else {
      setCouponMessage('Invalid coupon code. Please check your active offers or try "ROYAL10".');
      setIsCouponError(true);
      setAppliedDiscount(0);
    }
  };

  // Add customized item to cart and trigger cart view
  const handleAddToCartAndCheckout = () => {
    setIsAdding(true);

    const customOptionsStr = Object.entries(selectedCustomizations).map(([k, v]) => `${k}: ${v}`).join(', ');
    const nameSuffix = [customOptionsStr].filter(Boolean).join(', ');

    // Generate a stable, deterministic suffix based on selectedCustomizations to prevent duplicates
    const customKey = Object.entries(selectedCustomizations)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${String(k).replace(/[^a-zA-Z0-9]/g, '')}-${String(v).replace(/[^a-zA-Z0-9]/g, '')}`)
      .join('-');
    const stableId = customKey ? `${item.id}-custom-${customKey}` : item.id;

    const customizedItem = {
      ...item,
      id: stableId,
      name: nameSuffix ? `${item.name} (${nameSuffix})` : item.name,
      price: Number(prices.total.toFixed(2)),
    };

    setTimeout(() => {
      onAddToCart(customizedItem, 'Standard', selectedCustomizations);
      setIsAdding(false);
    }, 450);
  };

  return (
    <div className="bg-dark-rich text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans" id="customizer-root-section">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation back button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono tracking-[0.2em] text-gold hover:text-white transition-all mb-8 cursor-pointer uppercase bg-white/5 border border-gold/20 hover:border-gold p-2.5 sm:px-4 sm:py-2 rounded-full sm:rounded-none sm:bg-transparent sm:border-0"
          id="back-to-curations-btn"
          title="Back to Imperial Curations"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Imperial Curations</span>
        </button>

        {/* Master Row splits into visualizer / form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          
          {/* ================= LEFT MAIN COLUMN: INTERACTIVE VISUALIZER ================= */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header titles */}
            <div className="space-y-1">
              <span className="text-gold font-mono text-[9px] sm:text-[10px] tracking-[0.3em] uppercase block">Bespoke Fine Atelier</span>
              <h1 className="text-2xl sm:text-4xl font-serif text-white tracking-tight font-black uppercase">
                {item.name}
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-400 font-sans">Configure high-end metals, purity factors, sizes, and inner-band laser engraving.</p>
            </div>

            {/* Immersive interactive visualizer preview stage */}
            <div className="relative h-80 sm:h-[360px] w-full rounded-3xl overflow-hidden glass-dark border border-white/10 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#151310] via-dark-rich to-[#110f0d] shadow-2xl">
              
              {/* Dynamic light rays */}
              <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />

              {/* Best Seller Badge */}
              {item.isBestSeller && (
                <span className="absolute top-4 left-4 bg-gold/20 border border-gold text-gold text-[9px] font-mono px-3 py-1 rounded-full uppercase tracking-widest font-black flex items-center gap-1.5 shadow-lg shadow-gold/10">
                  <Sparkles size={11} className="animate-spin" />
                  <span>Royal Best Seller</span>
                </span>
              )}

              {/* 3D Metal Render effect based on color choice */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                <motion.div
                  key={'Yellow Gold'}
                  initial={{ opacity: 0, scale: 0.95, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full relative"
                >
                  {/* Outer glow ring matches chosen metal tone */}
                  <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none ${
                    'bg-amber-400'
                    
                    
                  }`} />

                  {/* Main Product image with metal color overlay/tinting */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={`w-full h-full object-contain filter drop-shadow-2xl transition-all duration-700 ${
                      'brightness-105 contrast-105 hue-rotate-0'
                      
                      
                      
                    }`}
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>

              {/* Angle selector thumbs */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-[8px] font-mono uppercase text-gold tracking-widest">3D ANGLE:</span>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded border border-gold bg-cover bg-center cursor-pointer" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                  <div className="w-6 h-6 rounded border border-white/10 hover:border-gold bg-cover bg-center cursor-pointer opacity-60 hover:opacity-100 transition-opacity" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                  <div className="w-6 h-6 rounded border border-white/10 hover:border-gold bg-cover bg-center cursor-pointer opacity-60 hover:opacity-100 transition-opacity" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                </div>
              </div>

              {/* Wishlist Heart */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-gold-light hover:text-white transition-all cursor-pointer"
                id="customize-wishlist-btn"
              >
                <Heart size={18} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </div>

            {/* Certifications Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="glass p-2 sm:p-3 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gold/10 text-gold rounded-lg shrink-0">
                  <ShieldCheck size={14} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] font-mono font-bold text-white uppercase truncate">BIS GOLD</p>
                  <p className="text-[7px] sm:text-[9px] text-gray-400 truncate">916 Hallmarked</p>
                </div>
              </div>
              <div className="glass p-2 sm:p-3 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gold/10 text-gold rounded-lg shrink-0">
                  <Gem size={14} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] font-mono font-bold text-white uppercase truncate">SGL CERT</p>
                  <p className="text-[7px] sm:text-[9px] text-gray-400 truncate">Conflict-Free</p>
                </div>
              </div>
              <div className="glass p-2 sm:p-3 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gold/10 text-gold rounded-lg shrink-0">
                  <Truck size={14} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] font-mono font-bold text-white uppercase truncate">SECURE INS</p>
                  <p className="text-[7px] sm:text-[9px] text-gray-400 truncate">Concierge</p>
                </div>
              </div>
            </div>

            {/* Tabbed Info Board */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex border-b border-white/10 bg-white/[0.02]">
                {['details', 'specifications', 'policies'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider font-bold transition-all border-b-2 ${
                      activeTab === tab
                        ? 'border-gold text-gold bg-gold/5'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="p-5 text-xs text-gray-300 space-y-3 leading-relaxed">
                {activeTab === 'details' && (
                  <div className="space-y-3 font-sans">
                    <p className="font-serif text-gold-light text-sm font-semibold">{item.name} Story</p>
                    <p>{item.description}</p>
                    <p>
                      Meticulously crafted using traditional micro-setting tools, this piece has been hand-inspected under high-magnification jewel lenses to guarantee flawless symmetry. The placement is designed to catch light from all spherical angles, maximizing natural refraction indices.
                    </p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="space-y-2 font-sans">
                    <p className="font-serif text-gold-light text-sm font-semibold">Technical Specifications</p>
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody>
                        <tr className="border-b border-white/5 py-1.5 block">
                          <td className="text-gray-400 w-32 font-mono uppercase text-[10px]">Inherited Category:</td>
                          <td className="text-white font-semibold">{item.category}</td>
                        </tr>
                        <tr className="border-b border-white/5 py-1.5 block">
                          <td className="text-gray-400 w-32 font-mono uppercase text-[10px]">Net Gram Weight:</td>
                          <td className="text-white font-semibold">{item.weight}</td>
                        </tr>
                        <tr className="border-b border-white/5 py-1.5 block">
                          <td className="text-gray-400 w-32 font-mono uppercase text-[10px]">Standard Metal Type:</td>
                          <td className="text-white font-semibold">{item.material}</td>
                        </tr>
                        <tr className="border-b border-white/5 py-1.5 block">
                          <td className="text-gray-400 w-32 font-mono uppercase text-[10px]">Rating & Acclaim:</td>
                          <td className="text-gold font-bold flex items-center gap-1">
                            <Star size={11} className="fill-gold text-gold" /> {item.rating} / 5.0 Rating
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div className="space-y-2.5 font-sans">
                    <p className="font-serif text-gold-light text-sm font-semibold">Aurum Royal Purchase Protection</p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-400">
                      <li><strong>Lifetime Exchange Policy</strong>: Trade-in your custom piece at 100% current value of gold weights.</li>
                      <li><strong>30-Day Royal Return</strong>: Completely risk-free returns if un-engraved and tags intact.</li>
                      <li><strong>Bespoke Packaging</strong>: Includes our signature lighted-velvet box, certification report, and gold cleaning gloves.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

              </div>
            {/* ================= RIGHT FLOATING COLUMN: CUSTOMIZER TOOLKIT ================= */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* DYNAMIC CUSTOMIZATIONS */}
              {item.customizations && item.customizations.length > 0 && (
                <div className="glass p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4">
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-wider uppercase text-gold block">ADDITIONAL CUSTOM OPTIONS</span>
                  {item.customizations.map(cust => (
                    <div key={cust.name} className="space-y-3">
                      <label className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-400">{cust.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {cust.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setSelectedCustomizations({ ...selectedCustomizations, [cust.name]: opt })}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-center transition-all cursor-pointer font-mono ${
                              selectedCustomizations[cust.name] === opt
                                ? 'border-gold bg-gold text-dark-rich font-bold shadow-md'
                                : 'border-white/10 bg-white/5 text-gray-300 hover:border-gold/30'
                            }`}
                          >
                            <span className="text-[10px] sm:text-xs uppercase">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* WHITE GLOVE DELIVERY COVERAGE CARD */}
            <div className="glass p-4 sm:p-5 rounded-2xl border border-gold/15 bg-white/[0.02] space-y-3">
              <div className="flex items-center gap-2 text-gold">
                <ShieldCheck size={14} className="sm:w-4 sm:h-4" />
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-bold">WHITE GLOVE DELIVERY ELIGIBILITY</span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-sans">
                This exclusive piece qualifies for secure, insured concierge courier dispatch. Standard white-glove transit is fully complimentary with real-time location-tracking coordinates and safe-passage delivery.
              </p>
            </div>

            {/* ROYAL PROMOTION BENEFITS CARD */}
            <div className="glass p-4 sm:p-5 rounded-2xl border border-gold/15 bg-white/[0.02] space-y-3">
              <div className="flex items-center gap-2 text-gold">
                <BadgePercent size={14} className="sm:w-4 sm:h-4" />
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-bold">PROMOTION & ACQUIRED SAVINGS</span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-sans">
                Exclusive boutique member savings and active promotional discounts are calculated automatically at checkout. Members enjoy lifetime cleaning, maintenance, and complimentary metal resizing benefits.
              </p>
            </div>

            {/* PRICING BREAKDOWN DETAILS */}
            <div className="glass p-4 sm:p-5 rounded-2xl border border-white/10 space-y-2.5 font-mono text-[11px] sm:text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Base Price:</span>
                <span>₹{prices.basePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>VAT / Tax (5% Index):</span>
                <span>+₹{prices.tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              {prices.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
                  <span>Applied Royal Discount:</span>
                  <span>-₹{prices.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div className="h-px bg-gold/15 my-3" />
              
              <div className="flex justify-between text-sm sm:text-base font-serif font-black text-gold items-end">
                <span>VALUED ORDER TOTAL:</span>
                <div className="flex flex-col items-end">
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-[10px] sm:text-xs text-gray-500 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                  <span>₹{prices.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* MAIN PURCHASE INITIATION CTA (CART REDIRECT) */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCartAndCheckout}
                disabled={isAdding}
                className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-bright disabled:opacity-40 text-dark-rich font-bold tracking-widest uppercase text-[11px] sm:text-xs py-3.5 sm:py-4.5 rounded-xl transition-all shadow-xl hover:shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer font-sans"
                id="add-custom-to-cart-checkout-btn"
              >
                {isAdding ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    <span>ADD TO CART & CHECKOUT</span>
                  </>
                )}
              </button>

              <p className="text-[9px] sm:text-[10px] text-center text-gray-400 font-mono tracking-wider">
                👑 COMPLIMENTARY WHITE-GLOVE INSURANCE INCLUDED
              </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
