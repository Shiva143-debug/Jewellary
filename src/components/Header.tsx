import { useState } from 'react';
import { 
  ShoppingBag, User, LogOut, ShieldAlert, Menu, X, Receipt
} from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  onOpenProfile: () => void;
  cartCount: number;
  onCategorySelect: (category: any) => void;
  selectedCategory: string;
  onNavigateToItems?: () => void;
  onNavigateToOffers?: () => void;
  onNavigateToContact?: () => void;
  onLogoClick?: () => void;
}

export default function Header({
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenCart,
  onOpenAdmin,
  onOpenOrders,
  onOpenProfile,
  cartCount,
  onCategorySelect,
  selectedCategory,
  onNavigateToItems,
  onNavigateToOffers,
  onNavigateToContact,
  onLogoClick
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10" id="boutique-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gold p-1 hover:text-gold-bright transition-colors md:hidden cursor-pointer"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Luxury Logo */}
          <button
            onClick={onLogoClick}
            className="flex flex-col items-center select-none cursor-pointer hover:opacity-85 transition-opacity focus:outline-none text-center"
            id="brand-logo"
          >
            <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-[0.25em] text-gold bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              AURUM
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.4em] text-gold/60 font-sans uppercase -mt-0.5">
              Fine Jewelry
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 mx-4">
            <div className="relative group py-2">
              <button
                onClick={onNavigateToItems}
                className="text-[11px] font-mono font-bold tracking-widest text-gray-300 group-hover:text-gold transition-colors cursor-pointer uppercase flex items-center gap-1 focus:outline-none"
              >
                <span>JEWELLERS</span>
                <span className="text-[8px] opacity-60">▼</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-1 w-44 bg-[#111111] border border-gold/15 rounded-xl shadow-2xl overflow-hidden hidden group-hover:block z-50 animate-fadeIn">
                {['All', 'Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Bangles'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      onCategorySelect(cat);
                      setTimeout(() => {
                        document.getElementById('jewelry-items')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[10px] font-mono tracking-wider transition-colors hover:bg-gold/10 text-gray-300 hover:text-gold uppercase block ${
                      selectedCategory === cat ? 'text-gold bg-gold/5 font-bold border-l-2 border-gold' : ''
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={onNavigateToOffers}
              className="text-[11px] font-mono font-bold tracking-widest text-gray-300 hover:text-gold transition-colors cursor-pointer"
            >
              OFFERS
            </button>
            <button
              onClick={onNavigateToContact}
              className="text-[11px] font-mono font-bold tracking-widest text-gray-300 hover:text-gold transition-colors cursor-pointer"
            >
              CONTACT US
            </button>
          </div>

          <div className="hidden md:flex flex-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Admin Quick Entry */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 px-3 py-1.5 rounded-md text-xs border border-amber-500/30 transition-all font-medium cursor-pointer"
                id="admin-dashboard-btn"
              >
                <ShieldAlert size={14} className="animate-pulse" />
                <span className="hidden sm:inline">Admin Dashboard</span>
              </button>
            )}

            {/* Profile Action Button */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 text-xs text-gray-300 hover:text-gold transition-all border border-gold/30 hover:border-gold px-3.5 py-2.5 rounded-full bg-gold/5 cursor-pointer shadow-sm shadow-gold/5"
                  id="profile-trigger-btn"
                  title="View and Edit Profile Details"
                >
                  <User size={15} className="text-gold" />
                  <span className="hidden sm:inline font-mono tracking-wider font-bold">
                    {currentUser.name.split(' ')[0].toUpperCase()}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-gold transition-colors border border-gold/30 hover:border-gold px-3.5 py-2 rounded-full bg-gold/5 cursor-pointer font-semibold"
                  id="login-trigger-btn"
                >
                  <User size={15} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Luxury Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-gold-light hover:text-gold transition-colors rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 cursor-pointer"
              id="cart-trigger-btn"
            >
              <ShoppingBag size={20} className="hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-sans text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-dark-rich animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-dark border-b border-white/10 px-4 py-6 space-y-4 animate-fadeIn">
          
          {/* New Mobile Navigation Links */}
          <div className="flex flex-col space-y-1.5 border-t border-b border-white/5 py-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToItems?.();
              }}
              className="w-full text-left py-2 px-3 text-xs font-mono tracking-wider text-gray-300 hover:text-gold hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            >
              💎 JEWELLERS
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToOffers?.();
              }}
              className="w-full text-left py-2 px-3 text-xs font-mono tracking-wider text-gray-300 hover:text-gold hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            >
              🎁 EXCLUSIVE OFFERS
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToContact?.();
              }}
              className="w-full text-left py-2 px-3 text-xs font-mono tracking-wider text-gray-300 hover:text-gold hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            >
              📞 CONTACT VIP DESK
            </button>
          </div>

          {/* Mobile User Profile details */}
          {currentUser ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold text-dark-rich font-serif font-black flex items-center justify-center text-xs uppercase">
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">{currentUser.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono">{currentUser.mobile || currentUser.email}</p>
                </div>
              </div>

              {/* Action buttons on mobile */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gold hover:text-gold-bright py-2 border border-gold/30 rounded-lg bg-gold/5 transition-all cursor-pointer uppercase tracking-wider font-mono"
                  id="my-profile-mobile-btn"
                >
                  <User size={14} />
                  <span>View / Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenOrders();
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-300 hover:text-white py-2 border border-white/10 rounded-lg bg-white/[0.02] transition-all cursor-pointer uppercase tracking-wider font-mono"
                  id="my-orders-mobile-btn"
                >
                  <Receipt size={14} />
                  <span>Track My Orders</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 text-xs text-rose-400 font-bold border border-rose-500/10 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 transition-all cursor-pointer uppercase tracking-wider font-mono"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gold hover:text-gold-bright py-2.5 border border-gold/30 rounded-xl bg-gold/5 transition-all"
            >
              <User size={15} />
              <span>Sign In to Account</span>
            </button>
          )}

          <div className="border-t border-gold/10 pt-4 flex flex-col space-y-3">
            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold px-2">Support</span>
            <div className="px-3 text-xs text-gray-400 space-y-1 font-mono">
              <p>📍 Flagship: 5th Ave, NY</p>
              <p>📞 VIP desk: +1 (800) AURUM-GOLD</p>
              <p>✉️ curations: concierge@aurum.com</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
