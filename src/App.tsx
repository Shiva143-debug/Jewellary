import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, CheckCircle, Receipt, ArrowRight, X, Heart } from 'lucide-react';

import Header from './components/Header';
import Banner from './components/Banner';
import ItemsSection from './components/ItemsSection';
import OffersNews from './components/OffersNews';
import Footer from './components/Footer';

import AuthModal from './components/AuthModal';
import ShoppingBagPage from './components/ShoppingBagPage';
import AdminPanel from './components/AdminPanel';
import CustomerOrdersPage from './components/CustomerOrdersPage';
import ProductCustomizeAndBuy from './components/ProductCustomizeAndBuy';
import UserProfilePage from './components/UserProfilePage';

import { JewelryItem, CartItem, User, NewsOffer, Order, SavedAddress } from './types';

export default function App() {
  // Global States
  const [items, setItems] = useState<JewelryItem[]>([]);
  const [newsOffers, setNewsOffers] = useState<NewsOffer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('aurum_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aurum_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Customization workspace item
  const [customizingItem, setCustomizingItem] = useState<JewelryItem | null>(null);

  // Full-page Admin Dashboard view state
  const [showAdminPage, setShowAdminPage] = useState<boolean>(false);

  // Full-page Customer Orders view state
  const [showOrdersPage, setShowOrdersPage] = useState<boolean>(false);

  // Full-page Customer Profile view state
  const [showProfilePage, setShowProfilePage] = useState<boolean>(false);

  // Full-page Shopping Bag view state
  const [showCartPage, setShowCartPage] = useState<boolean>(false);

  // Modals controllers
  const [activeModal, setActiveModal] = useState<'auth' | 'admin' | 'orders' | null>(null);

  // Success Order Overlay
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Synchronize cart to local storage
  useEffect(() => {
    localStorage.setItem('aurum_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync user state to local storage
  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('aurum_user', JSON.stringify(user));
    // Fetch orders if admin
    if (user.role === 'admin') {
      fetchOrders();
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aurum_user');
    localStorage.removeItem('aurum_token');
    setOrders([]);
    setActiveModal(null);
    setShowAdminPage(false);
    setShowOrdersPage(false);
    setShowProfilePage(false);
    setShowCartPage(false);
    setCustomizingItem(null);
  };

  // Fetch items and news posts on mount
  useEffect(() => {
    fetchItems();
    fetchNewsOffers();
    if (currentUser) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [currentUser]);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  };

  const fetchNewsOffers = async () => {
    try {
      const res = await fetch('/api/news-offers');
      const data = await res.json();
      setNewsOffers(data);
    } catch (err) {
      console.error('Failed to load news posts:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('aurum_token');
      if (!token || !currentUser) return;
      const endpoint = currentUser.role === 'admin' ? '/api/orders' : '/api/users/orders';
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  // Add Item (Admin Dispatch)
  const handleAddItem = async (itemData: Omit<JewelryItem, 'id' | 'rating'>) => {
    const token = localStorage.getItem('aurum_token');
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      await fetchItems(); // reload
    } else {
      throw new Error('Could not add item');
    }
  };

  const handleUpdateItem = async (itemId: string, itemData: Partial<JewelryItem>) => {
    const token = localStorage.getItem('aurum_token');
    const res = await fetch(`/api/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      await fetchItems();
    } else {
      throw new Error('Could not update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const token = localStorage.getItem('aurum_token');
    const res = await fetch(`/api/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      await fetchItems();
    } else {
      throw new Error('Could not delete item');
    }
  };

  // Add News/Offer (Admin Dispatch)
  const handleAddPost = async (postData: Omit<NewsOffer, 'id' | 'date'>) => {
    const token = localStorage.getItem('aurum_token');
    const res = await fetch('/api/news-offers', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });
    if (res.ok) {
      await fetchNewsOffers(); // reload
    } else {
      throw new Error('Could not post bulletin');
    }
  };

  // Update News/Offer (Admin Dispatch)
  const handleUpdatePost = async (postId: string, postData: Partial<NewsOffer>) => {
    const token = localStorage.getItem('aurum_token');
    const res = await fetch(`/api/news-offers/${postId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });
    if (res.ok) {
      await fetchNewsOffers(); // reload
    } else {
      throw new Error('Could not update bulletin');
    }
  };

  // Delete News/Offer (Admin Dispatch)
  const handleDeletePost = async (postId: string) => {
    const token = localStorage.getItem('aurum_token');
    const res = await fetch(`/api/news-offers/${postId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      await fetchNewsOffers(); // reload
    } else {
      throw new Error('Could not delete bulletin');
    }
  };

  // Save/Update Customer Address
  const handleSaveUserAddress = async (address: SavedAddress) => {
    if (!currentUser) return;
    const token = localStorage.getItem('aurum_token');
    const res = await fetch('/api/users/update-address', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ mobile: currentUser.mobile, address })
    });
    if (res.ok) {
      const updatedUser = await res.json();
      handleUserLogin(updatedUser); // sync local storage & react state
    }
  };

  // Update Customer Profile and sync
  const handleUpdateProfile = async (updatedData: {
    name: string;
    email: string;
    mobile: string;
    savedAddress?: SavedAddress;
    savedAddresses?: SavedAddress[];
  }) => {
    const token = localStorage.getItem('aurum_token');
    if (!token || !currentUser) return;

    const res = await fetch('/api/users/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('aurum_token', data.token);
      handleUserLogin(data.user); // sync local storage & react state
    } else {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update credentials.');
    }
  };

  // Update Order Status (Admin Dispatch)
  const handleUpdateOrderStatus = async (orderId: string, status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => {
    const token = localStorage.getItem('aurum_token');
    const res = await fetch('/api/orders/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId, status })
    });
    if (res.ok) {
      await fetchOrders(); // Reload orders
    } else {
      const data = await res.json();
      throw new Error(data.error || 'Could not update status');
    }
  };

  // Update Order Item Status (Admin Dispatch)
  const handleUpdateOrderItemStatus = async (orderId: string, itemId: string, status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => {
    const token = localStorage.getItem('aurum_token');
    const res = await fetch('/api/orders/update-item-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId, itemId, status })
    });
    if (res.ok) {
      await fetchOrders(); // Reload orders
    } else {
      const data = await res.json();
      throw new Error(data.error || 'Could not update item status');
    }
  };

  // Cart Handlers
  const handleAddToCart = (item: JewelryItem, selectedSize: string, selectedCustomizations?: Record<string, string>) => {
    setCart(prev => {
      const customStr = JSON.stringify(selectedCustomizations || {});
      const existingIdx = prev.findIndex(ci => 
        ci.item.id === item.id && 
        ci.selectedSize === selectedSize && 
        JSON.stringify(ci.selectedCustomizations || {}) === customStr
      );
      if (existingIdx > -1) {
        return prev.map((ci, idx) => 
          idx === existingIdx ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      } else {
        return [...prev, { item, quantity: 1, selectedSize, selectedCustomizations }];
      }
    });
    // Open cart page instantly for immediate checkout feedback
    setShowCartPage(true);
    setShowAdminPage(false);
    setShowOrdersPage(false);
    setCustomizingItem(null);
  };

  const handleUpdateCartQuantity = (itemId: string, selectedSize: string, change: number) => {
    setCart(prev => {
      return prev.map(ci => {
        if (ci.item.id === itemId && ci.selectedSize === selectedSize) {
          const newQty = ci.quantity + change;
          if (newQty <= 0) return null;
          return { ...ci, quantity: newQty };
        }
        return ci;
      }).filter((ci): ci is CartItem => ci !== null);
    });
  };

  const handleRemoveFromCart = (itemId: string, selectedSize: string) => {
    setCart(prev => prev.filter(ci => !(ci.item.id === itemId && ci.selectedSize === selectedSize)));
  };

  // SHORT-CIRCUIT: COMPLETE SEPARATION FOR ADMIN WORKSPACE
  if (currentUser && currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="admin-workspace-view">
        {/* Modern minimal admin top bar */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 py-4 px-6 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl font-serif text-[#C5A059] font-bold tracking-widest">AURELIAN</span>
            <span className="text-xs bg-[#C5A059]/20 text-[#C5A059] font-mono px-2 py-0.5 rounded tracking-wide uppercase font-bold">Admin Console</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Administrator: {currentUser.name} ({currentUser.mobile || currentUser.email})</span>
            <button
              onClick={() => {
                setCurrentUser(null);
                localStorage.removeItem('aurum_token');
                localStorage.removeItem('aurum_user');
                setShowAdminPage(false);
              }}
              className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </header>

        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <AdminPanel
            onClose={() => {
              // Stay on admin workspace screen
            }}
            items={items}
            posts={newsOffers}
            orders={orders}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddPost={handleAddPost}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateOrderItemStatus={handleUpdateOrderItemStatus}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex flex-col justify-between selection:bg-gold selection:text-dark-rich font-sans">
      
      {/* 1. STICKY LUXURY HEADER */}
      <Header
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('aurum_user');
          setCustomizingItem(null);
          setShowAdminPage(false);
          setShowOrdersPage(false);
          setShowProfilePage(false);
          setShowCartPage(false);
        }}
        onOpenAuth={() => setActiveModal('auth')}
        onOpenCart={() => {
          setShowCartPage(true);
          setShowAdminPage(false);
          setShowOrdersPage(false);
          setShowProfilePage(false);
          setCustomizingItem(null);
        }}
        onOpenAdmin={() => {
          setShowAdminPage(true);
          setShowOrdersPage(false);
          setShowProfilePage(false);
          setShowCartPage(false);
          setCustomizingItem(null);
        }}
        onOpenOrders={() => {
          setShowOrdersPage(true);
          setCustomizingItem(null);
          setShowAdminPage(false);
          setShowProfilePage(false);
          setShowCartPage(false);
        }}
        onOpenProfile={() => {
          setShowProfilePage(true);
          setCustomizingItem(null);
          setShowAdminPage(false);
          setShowOrdersPage(false);
          setShowCartPage(false);
        }}
        cartCount={cart.reduce((sum, ci) => sum + ci.quantity, 0)}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          setCustomizingItem(null);
          setShowAdminPage(false);
          setShowOrdersPage(false);
          setShowProfilePage(false);
          setShowCartPage(false);
        }}
        selectedCategory={selectedCategory}
        onNavigateToItems={() => {
          setShowAdminPage(false);
          setShowOrdersPage(false);
          setShowProfilePage(false);
          setShowCartPage(false);
          setCustomizingItem(null);
          setTimeout(() => {
            document.getElementById('jewelry-items')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onNavigateToOffers={() => {
          setShowAdminPage(false);
          setShowOrdersPage(false);
          setShowProfilePage(false);
          setShowCartPage(false);
          setCustomizingItem(null);
          setTimeout(() => {
            document.getElementById('news-offers-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onNavigateToContact={() => {
          setShowAdminPage(false);
          setShowOrdersPage(false);
          setShowProfilePage(false);
          setShowCartPage(false);
          setCustomizingItem(null);
          setTimeout(() => {
            document.getElementById('boutique-footer')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onLogoClick={() => {
          setShowAdminPage(false);
          setShowOrdersPage(false);
          setShowProfilePage(false);
          setShowCartPage(false);
          setCustomizingItem(null);
          setSelectedCategory('All');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MAIN STORYBOARD */}
      <main className="flex-1 pt-20">
        {showProfilePage ? (
          <UserProfilePage
            currentUser={currentUser}
            onClose={() => setShowProfilePage(false)}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleUserLogout}
            onNavigateToOrders={() => {
              setShowProfilePage(false);
              setShowOrdersPage(true);
            }}
          />
        ) : showOrdersPage ? (
          <CustomerOrdersPage
            onClose={() => setShowOrdersPage(false)}
            orders={orders}
            onExploreProducts={() => setShowOrdersPage(false)}
          />
        ) : showCartPage ? (
          <ShoppingBagPage
            onClose={() => setShowCartPage(false)}
            cart={cart}
            currentUser={currentUser}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onSaveUserAddress={handleSaveUserAddress}
            onOpenAuth={() => setActiveModal('auth')}
            onOrderSuccess={(order) => {
              setSuccessOrder(order);
              setCart([]);
              fetchOrders();
              setShowCartPage(false);
              setShowOrdersPage(true); // Navigate instantly to orders
            }}
            onSelectItem={(item) => {
              setCustomizingItem(item);
              setShowCartPage(false);
            }}
          />
        ) : customizingItem ? (
          <ProductCustomizeAndBuy
            item={customizingItem}
            currentUser={currentUser}
            onClose={() => setCustomizingItem(null)}
            onOpenAuth={() => setActiveModal('auth')}
            onAddToCart={handleAddToCart}
            offers={newsOffers}
          />
        ) : (
          <>
            {/* 2. MAJESTIC BANNER & STORY */}
            <Banner />

            {/* 3. CATEGORY-WISE INTERACTIVE ITEMS EXHIBIT */}
            <ItemsSection
              items={items}
              selectedCategory={selectedCategory}
              onCategorySelect={(cat) => {
                setSelectedCategory(cat);
                setCustomizingItem(null);
              }}
              searchQuery={searchQuery}
              onAddToCart={handleAddToCart}
              onCustomizeAndBuy={(item) => setCustomizingItem(item)}
            />

            {/* 4. NEWS BULLETIN BOARD & SAVINGS COUPONS */}
            <OffersNews posts={newsOffers} />
          </>
        )}
      </main>

      {/* 5. OWNERS VIP CONTACT AND RICH FOOTER */}
      <Footer />

      {/* --- OVERLAYS AND MODALS PANEL --- */}
      <AnimatePresence>
        {/* 1. AUTHENTICATION SHIELD */}
        {activeModal === 'auth' && (
          <AuthModal
            onClose={() => setActiveModal(null)}
            onLogin={handleUserLogin}
          />
        )}







        {/* 4. ORDER PLACED EXQUISITE RECEIPT OVERLAY */}
        {successOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-dark-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-gold shadow-2xl text-white text-center relative gold-glow"
              id="order-success-modal"
            >
              {/* Close Overlay */}
              <button
                onClick={() => setSuccessOrder(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full border border-gold/20 hover:border-gold text-gold transition-colors"
                id="close-success-order-modal"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-emerald-500/15 rounded-full border border-emerald-500/30 text-emerald-400">
                  <CheckCircle size={40} className="animate-bounce" />
                </div>

                <div>
                  <span className="text-[10px] text-gold font-mono tracking-widest uppercase">TRANSACTION SECURED</span>
                  <h3 className="font-serif text-2xl font-extrabold text-gold-light mt-1">
                    Your Order Has Been Placed!
                  </h3>
                </div>

                <div className="h-px w-24 bg-gold/25 my-2" />

                <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
                  Thank you, <strong className="text-gold-light">{successOrder.customerName}</strong>. Your custom jewelry request is now registered. Master artisans are preparing your bespoke velvet-wrapped selection.
                </p>

                {/* Micro Invoice Receipt details */}
                <div className="w-full bg-dark-rich/80 rounded-2xl p-4 border border-gold/10 text-left space-y-2 text-xs">
                  <div className="flex justify-between border-b border-gold/10 pb-2">
                    <span className="font-mono text-[10px] text-gray-500">Receipt No:</span>
                    <span className="font-mono font-semibold text-gold">{successOrder.id}</span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-gray-500">Ordered Items:</p>
                    {successOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-gray-300">
                        <span>{it.name} <span className="text-gold font-mono text-[10px]">({it.selectedSize})</span> x{it.quantity}</span>
                        <span className="font-mono">₹{it.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gold/10 pt-2 flex justify-between font-bold text-gold-bright text-sm">
                    <span>Valued Amount Paid:</span>
                    <span className="font-mono">₹{successOrder.totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="border-t border-gold/5 pt-2 text-[10px] text-gray-400">
                    <p className="font-bold uppercase text-gold/60 mb-0.5">Shipping Destination:</p>
                    <p>{successOrder.address.streetAddress}, {successOrder.address.city}, {successOrder.address.state} {successOrder.address.zipCode}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSuccessOrder(null)}
                  className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-bright text-dark-rich font-bold tracking-widest uppercase text-xs py-3.5 rounded-xl transition-all shadow-lg hover:shadow-gold/20 flex items-center justify-center gap-1"
                >
                  <span>Continue Exploring Masterworks</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
