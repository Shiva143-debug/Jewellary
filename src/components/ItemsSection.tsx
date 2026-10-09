import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShieldCheck, Heart, ArrowUpDown, ChevronRight, Eye, Sparkles, X, ShoppingBag } from 'lucide-react';
import { JewelryItem } from '../types';

interface ItemsSectionProps {
  items: JewelryItem[];
  selectedCategory: string;
  onCategorySelect: (category: any) => void;
  searchQuery: string;
  onAddToCart: (item: JewelryItem, selectedSize: string) => void;
  onCustomizeAndBuy: (item: JewelryItem) => void;
}

export default function ItemsSection({
  items,
  selectedCategory,
  onCategorySelect,
  searchQuery,
  onAddToCart,
  onCustomizeAndBuy
}: ItemsSectionProps) {
  const [selectedSort, setSelectedSort] = useState<'default' | 'price-asc' | 'price-desc' | 'popularity' | 'rating'>('default');
  const [activeDetailItem, setActiveDetailItem] = useState<JewelryItem | null>(null);
  const [customSize, setCustomSize] = useState<string>('Standard');

  // Advanced Filtering States
  const [selectedMetal, setSelectedMetal] = useState<string>('All');
  const [selectedGemstone, setSelectedGemstone] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  // Custom wishlist simulation
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (itemId: string) => {
    setWishlist(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const categories = ['All', 'Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Bangles'] as const;

  // Metal type and gemstone extraction helpers for legacy/admin items
  const getItemMetalType = (item: JewelryItem): string => {
    if (item.metalType) return item.metalType;
    const mat = (item.material || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    if (mat.includes('rose') || name.includes('rose')) return 'Rose Gold';
    if (mat.includes('white') || name.includes('white') || mat.includes('platinum') || name.includes('platinum')) return 'Platinum';
    return 'Yellow Gold'; // Default Yellow Gold
  };

  const getItemGemstone = (item: JewelryItem): string => {
    if (item.gemstone) return item.gemstone;
    const mat = (item.material || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    if (mat.includes('diamond') || desc.includes('diamond') || name.includes('diamond')) return 'Diamond';
    if (mat.includes('emerald') || desc.includes('emerald') || name.includes('emerald')) return 'Emerald';
    if (mat.includes('pearl') || desc.includes('pearl') || name.includes('pearl')) return 'Pearl';
    if (mat.includes('ruby') || desc.includes('ruby') || name.includes('ruby')) return 'Ruby';
    if (mat.includes('sapphire') || desc.includes('sapphire') || name.includes('sapphire')) return 'Sapphire';
    return 'None';
  };

  // Filter items
  const filteredItems = items.filter(item => {
    // 1. Category Filter
    const matchesCategory = !selectedCategory || item.category === selectedCategory;

    // 2. Search Query Filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.material.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Metal Type Filter
    const metal = getItemMetalType(item);
    const matchesMetal = selectedMetal === 'All' || metal === selectedMetal;

    // 4. Gemstone Filter
    const gem = getItemGemstone(item);
    const matchesGem = selectedGemstone === 'All' || gem === selectedGemstone;

    // 5. Price range filter
    const priceNum = item.price;
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    const matchesPrice = priceNum >= min && priceNum <= max;

    return matchesCategory && matchesSearch && matchesMetal && matchesGem && matchesPrice;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (selectedSort === 'price-asc') return a.price - b.price;
    if (selectedSort === 'price-desc') return b.price - a.price;
    if (selectedSort === 'rating') return b.rating - a.rating;
    if (selectedSort === 'popularity') {
      // Best Seller items first, then by rating, then price
      const scoreA = (a.isBestSeller ? 10 : 0) + (a.rating || 0);
      const scoreB = (b.isBestSeller ? 10 : 0) + (b.rating || 0);
      return scoreB - scoreA;
    }
    return 0; // default (initial layout order)
  });

  const getSizesForCategory = (category: string) => {
    if (category === 'Rings') return ['6', '7', '8', '9', '10'];
    if (category === 'Bracelets' || category === 'Bangles') return ['2.4 (Small)', '2.6 (Medium)', '2.8 (Large)'];
    if (category === 'Necklaces') return ['16 Inches', '18 Inches', '20 Inches'];
    return ['Standard'];
  };

  return (
    <section className="py-20 bg-transparent text-white" id="jewelry-items">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 border-b border-gold/10 pb-6">
          <div>
            <span className="text-gold text-xs font-mono tracking-[0.3em] uppercase block mb-1">Curations</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
              Our <span className="bg-gradient-to-r from-gold-light via-gold to-gold-bright bg-clip-text text-transparent">Jewelry Collections</span>
            </h2>
          </div>

          {/* Desktop Categories Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategorySelect(cat === 'All' ? null : cat)}
                className={`px-4 py-2 text-xs font-semibold tracking-wider rounded-full border transition-all ${
                  (cat === 'All' && selectedCategory === '') || selectedCategory === cat
                    ? 'bg-gradient-to-r from-gold-dark to-gold text-dark-rich border-gold shadow-lg shadow-gold/20'
                    : 'glass text-gray-300 hover:border-white/30'
                }`}
                id={`cat-toolbar-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 glass p-4 rounded-xl border border-white/10" id="filters-and-controls-bar">
          <p className="text-xs text-gray-400 font-sans order-2 md:order-1 text-center md:text-left">
            Showing <span className="text-gold font-bold">{sortedItems.length}</span> luxury masterworks 
            {selectedCategory ? ` in ${selectedCategory}` : ''}
          </p>

          {/* Sorting & Filter toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 order-1 md:order-2 w-full md:w-auto">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-lg border text-xs font-semibold tracking-wider transition-all cursor-pointer w-full sm:w-auto ${
                showFiltersPanel || (selectedMetal !== 'All' || selectedGemstone !== 'All' || minPrice || maxPrice)
                  ? 'bg-gradient-to-r from-gold-dark to-gold text-dark-rich border-gold shadow-md' 
                  : 'glass text-gold-light border-white/10 hover:border-gold/40'
              }`}
            >
              <Sparkles size={12} />
              <span>Advanced Filters {(selectedMetal !== 'All' || selectedGemstone !== 'All' || minPrice || maxPrice) ? '●' : ''}</span>
            </button>

            {/* Sorting Select */}
            <div className="flex items-center justify-between sm:justify-start gap-3 bg-black/40 sm:bg-transparent border border-white/10 sm:border-transparent rounded-lg px-3.5 py-2 sm:p-0 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={13} className="text-gold shrink-0" />
                <span className="text-xs text-gray-400 font-sans select-none">Sort By:</span>
              </div>
              <select
                value={selectedSort}
                onChange={(e: any) => setSelectedSort(e.target.value)}
                className="bg-transparent sm:bg-black/80 sm:border sm:border-white/10 text-xs text-gold-light rounded px-2 py-1 focus:outline-none focus:border-gold cursor-pointer font-sans min-w-[130px] text-right sm:text-left"
                id="sort-select"
              >
                <option value="default" className="bg-[#111111] text-white">Inherent Legacy</option>
                <option value="popularity" className="bg-[#111111] text-white">Popularity (Bestsellers)</option>
                <option value="price-asc" className="bg-[#111111] text-white">Price: Low to High</option>
                <option value="price-desc" className="bg-[#111111] text-white">Price: High to Low</option>
                <option value="rating" className="bg-[#111111] text-white">Customer Acclaim (Rating)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
              id="advanced-filter-panel"
            >
              <div className="glass p-6 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                
                {/* Metal Type Filter */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-gold-light block font-bold border-b border-white/5 pb-1">Metal Type</span>
                  <div className="flex flex-col gap-2">
                    {['All', 'Yellow Gold', 'Rose Gold', 'White Gold', 'Platinum'].map((metal) => (
                      <label key={metal} className="flex items-center gap-2.5 cursor-pointer text-gray-300 hover:text-white transition-colors">
                        <input
                          type="radio"
                          name="metalType"
                          checked={selectedMetal === metal}
                          onChange={() => setSelectedMetal(metal)}
                          className="accent-gold h-4 w-4 rounded-full border-white/10"
                        />
                        <span className="text-xs">{metal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gemstone Filter */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-gold-light block font-bold border-b border-white/5 pb-1">Gemstone</span>
                  <div className="flex flex-col gap-2">
                    {['All', 'Diamond', 'Emerald', 'Pearl', 'Ruby', 'Sapphire', 'None'].map((gem) => (
                      <label key={gem} className="flex items-center gap-2.5 cursor-pointer text-gray-300 hover:text-white transition-colors">
                        <input
                          type="radio"
                          name="gemstone"
                          checked={selectedGemstone === gem}
                          onChange={() => setSelectedGemstone(gem)}
                          className="accent-gold h-4 w-4 rounded-full border-white/10"
                        />
                        <span className="text-xs">{gem === 'None' ? 'Plain Metal' : gem}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-gold-light block font-bold border-b border-white/5 pb-1">Price Range (₹)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-gold text-white font-mono"
                    />
                    <span className="text-gray-500 text-xs">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-gold text-white font-mono"
                    />
                  </div>
                  <div className="flex gap-1.5 pt-2 flex-wrap">
                    <button
                      onClick={() => { setMinPrice('10000'); setMaxPrice('150000'); }}
                      className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-gray-300 cursor-pointer"
                    >
                      Under ₹1.5L
                    </button>
                    <button
                      onClick={() => { setMinPrice('150000'); setMaxPrice('300000'); }}
                      className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-gray-300 cursor-pointer"
                    >
                      ₹1.5L - ₹3L
                    </button>
                    <button
                      onClick={() => { setMinPrice('300000'); setMaxPrice('1000000'); }}
                      className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-gray-300 cursor-pointer"
                    >
                      ₹3L+
                    </button>
                  </div>
                </div>

                {/* Clear & Summary */}
                <div className="flex flex-col justify-between items-start md:items-end md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-mono uppercase tracking-wider text-gold-light block font-bold">Active Filters</span>
                    <p className="text-xs text-gray-400">
                      Category: <span className="text-white">{selectedCategory || 'All'}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Metal: <span className="text-white">{selectedMetal}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Gemstone: <span className="text-white">{selectedGemstone === 'None' ? 'Plain Metal' : selectedGemstone}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMetal('All');
                      setSelectedGemstone('All');
                      setMinPrice('');
                      setMaxPrice('');
                      onCategorySelect(null);
                    }}
                    className="mt-4 w-full md:w-auto px-4 py-2 text-xs font-semibold tracking-wider rounded-xl border border-gold/40 hover:border-gold text-gold hover:bg-gold hover:text-dark-rich transition-all uppercase font-mono cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {sortedItems.length === 0 && (
          <div className="text-center py-24 glass rounded-3xl border border-dashed border-white/15">
            <p className="font-serif text-xl text-gold-light mb-2">No masterworks found</p>
            <p className="text-xs text-gray-400 font-sans max-w-sm mx-auto">
              We couldn't find any items matching your parameters. Try browsing other categories or reset search queries.
            </p>
            <button
              onClick={() => {
                onCategorySelect(null);
                // Trigger reload/reset parent
              }}
              className="mt-6 text-xs text-dark-rich bg-gold font-bold uppercase tracking-wider px-5 py-2.5 rounded-full"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8" id="items-grid-container">
          <AnimatePresence>
            {sortedItems.map((item, index) => {
              // Dynamic mockup tag/ribbon based on item features
              const getRibbonLabel = (it: typeof item) => {
                if (it.isBestSeller) return "Hotseller!";
                if (it.price > 120000) return "New Launch";
                if (it.category === "Bangles" || it.category === "Rings") return "Today's Special";
                return "Festive favorite";
              };

              // Simulated stable review count based on item ID for high fidelity mockup
              const reviewCount = (parseInt(item.id.replace(/\D/g, '') || "0") % 41) + 14;

              // Pricing math
              const originalPrice = item.originalPrice || Math.round(item.price * 1.45);
              const discountPercent = Math.round(((originalPrice - item.price) / originalPrice) * 100);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                  className="group relative glass rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between gold-glow-hover bg-[#151310]/80 border border-white/5"
                  id={`item-card-${item.id}`}
                >
                  {/* Upper Thumbnail Container - Tall Aspect Ratio for Premium Mobile Feel */}
                  <div 
                    className="relative overflow-hidden aspect-[4/5] sm:aspect-square w-full mx-auto bg-[#0a0908] cursor-pointer" 
                    onClick={() => {
                      setActiveDetailItem(item);
                      setCustomSize(getSizesForCategory(item.category)[0]);
                    }}
                  >
                    {/* Swallowtail Ribbon Tag (Matches Mockup perfectly) */}
                    <div 
                      className="absolute top-3 left-0 z-10 bg-[#D4C3A3] text-black font-sans text-[8px] sm:text-[9px] font-bold tracking-wider py-1 pl-2.5 pr-4 shadow-md select-none"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%)' }}
                    >
                      {getRibbonLabel(item)}
                    </div>

                    {/* Material Subtitle under Ribbon Badge */}
                    <div className="absolute top-9 left-2.5 z-10 text-[8px] sm:text-[9px] text-gray-300 font-mono tracking-wide drop-shadow-md select-none uppercase">
                      {item.material.split(' ').slice(0, 2).join(' ')}
                    </div>

                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 z-10 p-1.5 sm:p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-gold-light transition-colors shadow-sm"
                      title="Add to Wishlist"
                      id={`wishlist-btn-${item.id}`}
                    >
                      <Heart 
                        size={14} 
                        className={wishlist.includes(item.id) ? 'fill-red-500 text-red-500' : ''} 
                      />
                    </button>

                    {/* Product Image: Responsive object fit */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover sm:object-contain p-0 sm:p-3 transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Rating Pill bottom left overlay (Matches Mockup perfectly) */}
                    <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 bg-white/95 text-black font-sans text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      <span>{item.rating || 4.9}</span>
                      <Star size={8} className="fill-amber-500 text-amber-500 shrink-0" />
                      <span className="text-gray-400 font-normal">|</span>
                      <span className="text-gray-500 font-normal">{reviewCount}</span>
                    </div>

                    {/* Quick view overlay on Desktop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                      <span className="text-[10px] font-bold text-black font-mono tracking-widest uppercase bg-gold px-4 py-2.5 rounded-lg shadow-lg hover:scale-105 transition-transform">
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Info block - Cleaner layout to avoid squeezing on mobile */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Category & Materials (Only shown on Desktop to save mobile space) */}
                      <div className="hidden sm:flex flex-wrap items-center justify-between gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-mono">
                        <span>{item.category}</span>
                        <span>{item.weight}</span>
                      </div>

                      {/* Product Name with mobile-only view details icon */}
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <h3 
                          onClick={() => {
                            setActiveDetailItem(item);
                            setCustomSize(getSizesForCategory(item.category)[0]);
                          }}
                          className="font-sans text-[11px] sm:text-base font-semibold text-gray-100 hover:text-gold transition-colors cursor-pointer truncate flex-1"
                        >
                          {item.name}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDetailItem(item);
                            setCustomSize(getSizesForCategory(item.category)[0]);
                          }}
                          className="sm:hidden text-gold hover:text-white shrink-0 p-0.5"
                          title="View Details"
                          id={`mobile-view-details-icon-${item.id}`}
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                      
                      {/* Description (Only shown on Desktop to prevent clutter) */}
                      <p className="hidden sm:line-clamp-2 text-xs text-gray-400 font-sans font-light mb-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Price and Action Row */}
                    <div className="mt-auto">
                      {/* Price Grid (Consistent spacing in mobile grid columns) */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 min-w-0">
                        <span className="text-gray-400 line-through text-[9px] sm:text-xs font-serif shrink-0">
                          ₹{originalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="font-serif text-[11px] sm:text-base font-bold text-gold-bright shrink-0">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] sm:text-xs font-semibold text-rose-400 shrink-0 uppercase tracking-tight">
                          Save {discountPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add To Cart Full-Width Bottom attached button matches Mockup perfectly */}
                  <button
                    onClick={() => onCustomizeAndBuy(item)}
                    className="w-full bg-[#111] hover:bg-gold text-white hover:text-dark-rich border-t border-white/5 font-sans text-[10px] sm:text-xs font-bold py-2.5 uppercase tracking-wider transition-all rounded-b-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                    id={`quick-buy-${item.id}`}
                  >
                    <ShoppingBag size={11} className="shrink-0" />
                    <span>ADD TO CART</span>
                  </button>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* DETAILED SPECIFICATION AND SIZE MODAL (MYNTRA INSPIRED) */}
      <AnimatePresence>
        {activeDetailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-dark w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto md:overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row text-white admin-glow"
              id="detail-modal-container"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveDetailItem(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full glass hover:bg-white/10 text-gold transition-colors"
                id="close-detail-modal"
              >
                <X size={18} />
              </button>

              {/* Left Column: Big Image */}
              <div className="w-full md:w-1/2 relative h-64 md:h-auto shrink-0">
                <img
                  src={activeDetailItem.imageUrl}
                  alt={activeDetailItem.name}
                  className="w-full h-full object-cover absolute inset-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Specifications overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass backdrop-blur-md">
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div>
                      <p className="text-gray-400">MATERIAL:</p>
                      <p className="text-gold-light font-bold truncate">{activeDetailItem.material}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">NET WEIGHT:</p>
                      <p className="text-gold-light font-bold">{activeDetailItem.weight}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Customizer */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between md:max-h-[85vh] md:overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <span className="text-gold text-xs font-mono uppercase tracking-widest">{activeDetailItem.category} Collection</span>
                    <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-gold-light mt-1">
                      {activeDetailItem.name}
                    </h3>
                  </div>

                  {/* Certifications Row */}
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px]">
                    <ShieldCheck size={14} />
                    <span>Certified Ethically Sourced & BIS 916 Hallmarked Gold</span>
                  </div>

                  {/* Price */}
                  <div>
                    <span className="text-xs text-gray-400 font-sans block">Curator Price</span>
                    <div className="flex items-end gap-3">
                      <span className="font-serif text-3xl font-bold text-gold bg-gradient-to-r from-gold-light via-gold to-gold-bright bg-clip-text text-transparent">
                        ₹{activeDetailItem.price.toLocaleString('en-IN')}
                      </span>
                      {activeDetailItem.originalPrice && activeDetailItem.originalPrice > activeDetailItem.price && (
                        <div className="flex flex-col mb-1">
                          <span className="text-sm text-gray-500 line-through font-serif">
                            ₹{activeDetailItem.originalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400">
                            {Math.round(((activeDetailItem.originalPrice - activeDetailItem.price) / activeDetailItem.originalPrice) * 100)}% SAVINGS
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-300 leading-relaxed font-sans font-light border-y border-gold/10 py-3">
                    {activeDetailItem.description}
                  </p>

                  {/* Customization selection (Size) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gold-light font-semibold uppercase tracking-wider font-mono">Select Customization Size:</span>
                      <span className="text-gray-400 underline cursor-pointer text-[10px]">Size chart guide</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {getSizesForCategory(activeDetailItem.category).map((size) => (
                        <button
                          key={size}
                          onClick={() => setCustomSize(size)}
                          className={`px-3.5 py-2 text-xs font-mono font-medium rounded-lg border transition-all ${
                            customSize === size
                              ? 'bg-gold border-gold text-dark-rich'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:border-gold/50'
                          }`}
                          id={`size-btn-${size}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {activeDetailItem.category === 'Rings' && (
                      <p className="text-[10px] text-gray-400 font-sans">Sizes available in Standard US ring diameter ratios.</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gold/10 space-y-3">
                  <button
                    onClick={() => {
                      onAddToCart(activeDetailItem, customSize);
                      setActiveDetailItem(null); // Close modal
                    }}
                    className="w-full bg-white/5 border border-gold/30 hover:border-gold hover:text-dark-rich text-gold font-bold tracking-widest uppercase text-xs py-3 rounded-xl transition-all"
                    id="add-to-cart-modal-btn"
                  >
                    Add to Luxury Bag
                  </button>
                  <button
                    onClick={() => {
                      onCustomizeAndBuy(activeDetailItem);
                      setActiveDetailItem(null);
                    }}
                    className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-bright text-dark-rich font-bold tracking-widest uppercase text-xs py-3 rounded-xl transition-all shadow-lg hover:shadow-gold/25"
                    id="customize-now-modal-btn"
                  >
                    Customize & Buy Now
                  </button>
                  <p className="text-[9px] text-center text-gray-400 font-sans">
                    ✈️ Free express global delivery & elegant bespoke velvet gift-box wrapping included.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
