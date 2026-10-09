import { useState, useEffect, FormEvent } from 'react';
import { 
  Trash2, Lock, ArrowLeft, Loader2, Sparkles, Check, CheckCircle2, Plus, MapPin, X, Home, Phone, User, Globe
} from 'lucide-react';
import { CartItem, SavedAddress, User as UserType, Order, NewsOffer } from '../types';
import whiteGlovePic from '../assets/images/white_glove_presentation_1783256942377.jpg';

interface ShoppingBagPageProps {
  onClose: () => void;
  cart: CartItem[];
  currentUser: UserType | null;
  onUpdateCartQuantity: (itemId: string, selectedSize: string, change: number) => void;
  onRemoveFromCart: (itemId: string, selectedSize: string) => void;
  onSaveUserAddress: (address: SavedAddress) => Promise<void>;
  onOpenAuth?: () => void;
  onOrderSuccess?: (order: Order) => void;
  onOpenProfile?: () => void;
  onSelectItem?: (item: any) => void;
  offers?: NewsOffer[];
}

export default function ShoppingBagPage({
  onClose,
  cart,
  currentUser,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onSaveUserAddress,
  onOpenAuth,
  onOrderSuccess,
  onOpenProfile,
  onSelectItem,
  offers = []
}: ShoppingBagPageProps) {
  // Payment methods
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');

  // Address-related states
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);

  // Address Dialog state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreetAddress, setNewStreetAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('NY');
  const [newZipCode, setNewZipCode] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [dialogError, setDialogError] = useState('');

  // Statuses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discountMultiplier, setDiscountMultiplier] = useState(1);
  const [couponSuccess, setCouponSuccess] = useState('');

  // Sync user addresses from local storage and user profile
  useEffect(() => {
    if (currentUser) {
      const list: SavedAddress[] = [];
      
      // 1. Add primary address if it exists
      if (currentUser.savedAddress && currentUser.savedAddress.streetAddress) {
        list.push(currentUser.savedAddress);
      }
      
      // 2. Add alternative addresses from user profile
      if (currentUser.savedAddresses && currentUser.savedAddresses.length > 0) {
        currentUser.savedAddresses.forEach(addr => {
          const isDup = list.some(
            p => p.streetAddress?.toLowerCase().trim() === addr.streetAddress?.toLowerCase().trim() && 
                 p.city?.toLowerCase().trim() === addr.city?.toLowerCase().trim()
          );
          if (!isDup) {
            list.push(addr);
          }
        });
      }
      
      // 3. Fallback/Sync with local storage list if available
      const storageKey = `aurum_saved_addresses_${currentUser.id}`;
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            parsed.forEach(addr => {
              const isDup = list.some(
                p => p.streetAddress?.toLowerCase().trim() === addr.streetAddress?.toLowerCase().trim() && 
                     p.city?.toLowerCase().trim() === addr.city?.toLowerCase().trim()
              );
              if (!isDup) {
                list.push(addr);
              }
            });
          }
        } catch (e) {
          console.error('Error synchronizing local saved addresses in cart:', e);
        }
      }

      setSavedAddresses(list);
      if (list.length > 0) {
        setSelectedAddressIndex(0);
      } else {
        setSelectedAddressIndex(-1);
      }
    }
  }, [currentUser]);

  // Handle addition of a new address from the Dialog
  const handleAddNewAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDialogError('');

    if (!newStreetAddress || !newCity || !newZipCode) {
      setDialogError('Please fill out all required fields.');
      return;
    }

    const finalFullName = currentUser?.name || 'Valued Client';
    const finalPhone = currentUser?.mobile || 'No Phone Provided';

    const newAddress: SavedAddress = {
      fullName: finalFullName,
      phone: finalPhone,
      streetAddress: newStreetAddress,
      city: newCity,
      state: newState || 'NY',
      zipCode: newZipCode,
      country: newCountry || 'United States'
    };

    if (currentUser) {
      const storageKey = `aurum_saved_addresses_${currentUser.id}`;
      const updatedList = [...savedAddresses, newAddress];
      setSavedAddresses(updatedList);
      setSelectedAddressIndex(updatedList.length - 1);
      localStorage.setItem(storageKey, JSON.stringify(updatedList));

      // Persist to server
      try {
        const token = localStorage.getItem('aurum_token');
        if (token) {
          const res = await fetch('/api/users/update-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: currentUser.name,
              email: currentUser.email,
              mobile: currentUser.mobile,
              savedAddress: currentUser.savedAddress || newAddress,
              savedAddresses: updatedList.filter((_, idx) => idx !== 0)
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              // Note: our local state is already updated, but syncing user profile will notify other components
              localStorage.setItem('aurum_token', data.token);
            }
          }
        } else {
          // Fallback to onSaveUserAddress
          await onSaveUserAddress(newAddress);
        }
      } catch (err) {
        console.error('Failed to sync address to database:', err);
      }
    }

    // Reset dialog fields
    setNewFullName('');
    setNewPhone('');
    setNewStreetAddress('');
    setNewCity('');
    setNewState('NY');
    setNewZipCode('');
    setNewCountry('United States');
    setIsAddressModalOpen(false);
  };

  // Cart Calculations
  const subtotal = cart.reduce((acc, ci) => acc + (ci.item.price * ci.quantity), 0);
  const discountAmount = subtotal * (1 - discountMultiplier);
  const taxableAmount = subtotal - discountAmount;
  const estimatedTax = taxableAmount * 0.08; // 8% calculated tax
  const totalAmount = taxableAmount + estimatedTax;

  const handleApplyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    
    // Check dynamic offers first
    const activeOffer = offers.find(o => 
      o.type === 'offer' && 
      o.discountCode && 
      o.discountCode.toUpperCase() === formatted
    );

    if (activeOffer) {
      if (activeOffer.expiryDate && new Date(activeOffer.expiryDate) < new Date()) {
        setCouponSuccess('');
        setDiscountMultiplier(1);
        setCheckoutError('This offer code has expired.');
        return;
      }
      
      if (activeOffer.discountType === 'percentage') {
        const val = activeOffer.discountValue || 0;
        setDiscountMultiplier(1 - (val / 100));
        setCouponSuccess(`${formatted} Applied (${val}% discount)`);
      } else if (activeOffer.discountType === 'fixed') {
        const val = activeOffer.discountValue || 0;
        // Approximation for multiplier based on current subtotal to fit existing logic
        // It's better to calculate discount Amount directly, but ShoppingBagPage uses discountMultiplier
        // We will adapt the multiplier:
        const newMultiplier = Math.max(0, 1 - (val / subtotal));
        setDiscountMultiplier(newMultiplier);
        setCouponSuccess(`${formatted} Applied (₹${val} discount)`);
      }
      setCheckoutError('');
      return;
    }

    // Fallback logic
    if (formatted === 'ROYALGOLD10' && subtotal >= 2000) {
      setDiscountMultiplier(0.9);
      setCouponSuccess('ROYALGOLD10 Applied (10% discount)');
      setCheckoutError('');
    } else {
      setCouponSuccess('');
      setDiscountMultiplier(1);
      setCheckoutError('Invalid coupon code. Try ROYALGOLD10.');
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!currentUser) {
      setCheckoutError('Please log in before placing an order.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (cart.length === 0) {
      setCheckoutError('Your shopping bag is empty.');
      return;
    }

    const activeAddress = savedAddresses[selectedAddressIndex];
    if (!activeAddress) {
      setCheckoutError('Please add or select a shipping address to place your order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('aurum_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (paymentMethod !== 'COD') {
        const res = await loadRazorpay();
        if (!res) {
          setCheckoutError('Razorpay SDK failed to load. Are you online?');
          setIsSubmitting(false);
          return;
        }

        const orderData = await fetch('/api/create-razorpay-order', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: Number(totalAmount.toFixed(2)),
            receipt: 'receipt_' + Date.now()
          })
        }).then(t => t.json());

        if (orderData.error) {
           throw new Error(orderData.error);
        }

        const configReq = await fetch('/api/config');
        const configData = await configReq.json();
        const rzpKey = configData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        if (!rzpKey) {
           setCheckoutError('Missing RAZORPAY_KEY_ID. Please add your Razorpay API keys in the Settings to enable the checkout popup.');
           setIsSubmitting(false);
           return;
        }

          // Format phone to 10 digits so Razorpay assumes India (+91) and shows UPI & Wallets
          let phoneStr = activeAddress.phone || '';
          let phoneDigits = phoneStr.replace(/\D/g, '');
          if (phoneDigits.length > 10) {
            phoneDigits = phoneDigits.slice(-10);
          }
          if (phoneDigits.length < 10) {
            phoneDigits = '9999999999';
          }

          const options = {
            key: rzpKey,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Aurum Jewelry',
            description: 'Payment for luxury jewelry',
            order_id: orderData.id,
            handler: async function (response: any) {
              // Payment successful, submit order to backend
              try {
                const res2 = await fetch('/api/orders', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    customerEmail: currentUser.email || null,
                    customerMobile: currentUser.mobile,
                    customerName: activeAddress.fullName,
                    items: cart.map(ci => ({
                      itemId: ci.item.id,
                      name: ci.item.name,
                      price: ci.item.price,
                      quantity: ci.quantity,
                      selectedSize: ci.selectedSize || 'Standard',
                      status: 'Processing'
                    })),
                    totalAmount: Number(totalAmount.toFixed(2)),
                    address: activeAddress,
                    status: 'Processing',
                    paymentMethod: paymentMethod,
                    razorpayOrderId: response.razorpay_order_id || orderData.id,
                    razorpayPaymentId: response.razorpay_payment_id || 'MOCK_PAY_' + Date.now()
                  })
                });
                
                if (res2.ok) {
                  const newOrder = await res2.json();
                  if (onOrderSuccess) {
                    onOrderSuccess(newOrder);
                  }
                } else {
                  setCheckoutError('Failed to record payment in our database.');
                }
              } catch (err: any) {
                 setCheckoutError('Server error while saving order.');
              }
              setIsSubmitting(false);
            },
            prefill: {
              name: activeAddress.fullName,
              email: currentUser.email || '',
              contact: currentUser.mobile || ('+91' + phoneDigits)
            },
            theme: {
              color: '#C5A059'
            }
          };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
          setCheckoutError(response.error.description || 'Payment Failed');
          setIsSubmitting(false);
        });
        rzp1.open();
      } else {
        // Submit COD order directly to database
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            customerEmail: currentUser.email || null,
            customerMobile: currentUser.mobile,
            customerName: activeAddress.fullName,
            items: cart.map(ci => ({
              itemId: ci.item.id,
              name: ci.item.name,
              price: ci.item.price,
              quantity: ci.quantity,
              selectedSize: ci.selectedSize || 'Standard',
              status: 'Processing'
            })),
            totalAmount: Number(totalAmount.toFixed(2)),
            address: activeAddress,
            status: 'Processing',
            paymentMethod: 'COD'
          })
        });

        if (response.ok) {
          const newOrder = await response.json();
          if (onOrderSuccess) {
            onOrderSuccess(newOrder);
          }
        } else {
          const errData = await response.json();
          throw new Error(errData.error || 'Checkout transaction rejected.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || 'Payment system error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#111111] text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fadeIn" id="shopping-bag-page-view">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation back button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono tracking-widest text-[#C5A059] hover:text-white transition-colors mb-8 cursor-pointer uppercase bg-white/5 border border-gold/20 hover:border-gold p-2.5 sm:px-4 sm:py-2 rounded-full sm:rounded-none sm:bg-transparent sm:border-0"
          id="back-to-curations-btn"
          title="Continue Browsing"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Continue Browsing</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ================= LEFT MAIN COLUMN: BAG ITEMS & SAVED ADDRESSES ================= */}
          <div className={`${cart.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12 max-w-2xl mx-auto w-full'} space-y-10`}>
            
            {/* Header titles */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-serif text-[#C5A059] tracking-tight font-medium">Shopping Bag</h1>
              <p className="text-xs sm:text-sm text-gray-400 font-sans">Review items and choose delivery address</p>
            </div>

            {/* Shopping List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-4 bg-white/[0.02] rounded-2xl border border-gold/15 p-8">
                <p className="font-serif text-lg text-gray-300">Your bag is empty.</p>
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      document.getElementById('jewelry-items')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="bg-[#C5A059] text-black font-bold font-mono text-xs tracking-widest uppercase px-6 py-3 rounded hover:bg-[#D4AF37] transition-all cursor-pointer"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white/[0.02] border border-gold/15 p-4 rounded-xl">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">
                    🛒 Selected Items Checklist
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        document.getElementById('jewelry-items')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="inline-flex items-center gap-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                    id="cart-add-more-items-btn"
                  >
                    <Plus size={14} />
                    <span>+ Add More Items</span>
                  </button>
                </div>

                <div className="space-y-6 divide-y divide-gold/10 bg-white/[0.02] p-4 sm:p-8 rounded-2xl border border-gold/15 shadow-sm" id="bag-items-list">
                  {cart.map((cartItem, idx) => (
                    <div 
                      key={`${cartItem.item.id}-${cartItem.selectedSize}`} 
                      className={`flex gap-4 sm:gap-6 pt-6 ${idx === 0 ? 'pt-0' : ''}`}
                      id={`bag-item-row-${cartItem.item.id}`}
                    >
                      {/* Item Image */}
                      <img
                        src={cartItem.item.imageUrl}
                        alt={cartItem.item.name}
                        className="w-20 h-20 sm:w-28 sm:h-28 rounded object-cover border border-gold/15 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                        referrerPolicy="no-referrer"
                        onClick={() => onSelectItem?.(cartItem.item)}
                      />

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 min-w-0">
                          <div className="cursor-pointer group min-w-0" onClick={() => onSelectItem?.(cartItem.item)}>
                            <h3 className="text-sm sm:text-lg font-serif font-medium text-white group-hover:text-gold transition-colors leading-tight">
                              {cartItem.item.name}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-gray-400 mt-1 font-sans">
                              {cartItem.item.material} - Size {cartItem.selectedSize || 'Standard'}
                            </p>
                          </div>

                          {/* Price */}
                          <span className="text-sm sm:text-lg font-serif text-[#C5A059] font-medium shrink-0">
                            ₹{(cartItem.item.price * cartItem.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                      {/* Quantity Selector & Remove Action */}
                      <div className="flex items-center justify-between mt-4">
                        {/* Minus / Plus button row */}
                        <div className="flex items-center border border-gold/15 rounded bg-white/[0.05]">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(cartItem.item.id, cartItem.selectedSize || 'Standard', -1)}
                            className="px-2.5 py-1 text-gray-400 hover:text-gold transition-colors font-mono cursor-pointer text-sm"
                          >
                            &minus;
                          </button>
                          <span className="px-2.5 py-1 text-xs font-mono font-medium min-w-[20px] text-center text-gold-light">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(cartItem.item.id, cartItem.selectedSize || 'Standard', 1)}
                            className="px-2.5 py-1 text-gray-400 hover:text-gold transition-colors font-mono cursor-pointer text-sm"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Action text button with trash icon */}
                        <button
                          type="button"
                          onClick={() => onRemoveFromCart(cartItem.item.id, cartItem.selectedSize || 'Standard')}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

            {cart.length > 0 && (
              <>
                {/* ================= SAVED ADDRESSES SECTION (MYNTRA STYLE) ================= */}
                <div className="pt-8 border-t border-gold/15 space-y-6">
              <div className="flex justify-between items-center border-b border-[#C5A059]/30 pb-3">
                <h2 className="text-lg sm:text-xl font-serif text-gold-light font-medium tracking-tight flex items-center gap-1.5 sm:gap-2">
                  <MapPin size={16} className="text-[#C5A059]" />
                  <span>Select Delivery Address</span>
                </h2>
                {currentUser && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059] hover:text-white border border-[#C5A059]/30 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all font-bold cursor-pointer"
                      id="cart-add-address-trigger"
                    >
                      <Plus size={14} />
                      <span>+ Add Address</span>
                    </button>
                    {onOpenProfile && (
                      <button
                        type="button"
                        onClick={onOpenProfile}
                        className="inline-flex items-center gap-1.5 text-xs text-[#C5A059] hover:text-white transition-colors font-mono font-bold uppercase tracking-wider cursor-pointer"
                        id="cart-profile-edit-trigger"
                        title="Edit name, email, mobile, and addresses in your Profile"
                      >
                        <User size={14} />
                        <span className="hidden sm:inline">Manage Profile &rarr;</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {!currentUser ? (
                <div className="border border-dashed border-[#C5A059]/30 rounded-2xl p-6 text-center space-y-3 bg-white/[0.02]">
                  <Lock size={20} className="text-[#C5A059] mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <p className="font-serif text-sm font-semibold text-white">Account Sign-In Required</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">Please sign in to select a delivery address and complete checkout.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="inline-flex items-center gap-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold font-mono text-[10px] tracking-wider uppercase px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Sign In or Register
                  </button>
                </div>
              ) : savedAddresses.length === 0 ? (
                <div className="border-2 border-dashed border-gold/15 rounded-2xl p-8 text-center space-y-4 bg-white/[0.02]">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gold-light">
                    <MapPin size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-sm font-semibold text-white">No Shipping Coordinates Saved</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Only verified coordinates registered in your profile are allowed for white-glove dispatch.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenProfile}
                      className="mt-3 inline-flex items-center gap-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold font-mono text-[10px] tracking-wider uppercase px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <User size={12} />
                      <span>Manage Profile & Addresses</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="saved-addresses-grid">
                    {savedAddresses.map((address, index) => {
                      const isSelected = selectedAddressIndex === index;
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedAddressIndex(index)}
                          className={`border-2 rounded-2xl p-5 bg-white/[0.02] cursor-pointer relative transition-all flex flex-col justify-between ${
                            isSelected 
                              ? 'border-[#C5A059] bg-gold/10 shadow-sm shadow-gold/5' 
                              : 'border-gold/10 hover:border-gold/30'
                          }`}
                          id={`saved-address-card-${index}`}
                        >
                          {/* Selector check indicator */}
                          <div className="absolute top-4 right-4 flex items-center justify-center">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#C5A059] bg-[#C5A059]' : 'border-gold/20'
                            }`}>
                              {isSelected && <Check size={10} className="text-white" />}
                            </div>
                          </div>

                          {/* Address content details */}
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-gold/10 text-gold-light font-mono px-2 py-0.5 rounded tracking-wider uppercase font-bold flex items-center gap-1">
                                <Home size={10} />
                                <span>{index === 0 ? 'Home / Default' : `Office ${index}`}</span>
                              </span>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs font-mono font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                                <User size={12} className="text-[#C5A059]" />
                                {address.fullName}
                              </p>
                              <p className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                                <Phone size={12} className="text-gray-400" />
                                {address.phone}
                              </p>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed font-sans pt-1">
                              {address.streetAddress}, {address.city}, {address.state} - <span className="font-mono font-bold text-[#C5A059]">{address.zipCode}</span>
                              <br />
                              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{address.country}</span>
                            </p>
                          </div>
                          
                          {isSelected && (
                            <div className="border-t border-[#C5A059]/10 pt-3 mt-3 text-[10px] font-mono font-bold tracking-wider text-[#C5A059] uppercase flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>Delivery Destination Selected</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-300 italic bg-white/[0.02] p-3 rounded-xl border border-gold/10 mt-2">
                    💡 <strong>Delivery coordinates management:</strong> Additional coordinates must be added or removed under your <strong>Profile Icon menu</strong> in the top header. This keeps checkout focused and secure.
                  </p>
                </div>
              )}
            </div>

            {/* ================= PAYMENT METHOD SELECTION ================= */}
            <div className="pt-8 border-t border-gold/15 space-y-6">
              <h2 className="text-lg sm:text-xl font-serif text-gold-light font-medium tracking-tight border-b border-[#C5A059]/30 pb-2">
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* UPI option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`border p-4 rounded flex items-center justify-between text-left transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#C5A059] bg-gold/10'
                      : 'border-gold/15 hover:border-gold/35 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'UPI' ? 'border-[#C5A059]' : 'border-gold/20'
                    }`}>
                      {paymentMethod === 'UPI' && (
                        <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold tracking-wide text-gray-300">UPI Apps (GPay, PhonePe, Paytm)</span>
                  </div>
                  <span className="text-xs text-gray-400">📱</span>
                </button>

                {/* COD option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`border p-4 rounded flex items-center justify-between text-left transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#C5A059] bg-gold/10'
                      : 'border-gold/15 hover:border-gold/35 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-[#C5A059]' : 'border-gold/20'
                    }`}>
                      {paymentMethod === 'COD' && (
                        <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold tracking-wide text-gray-300">Cash on Delivery (COD)</span>
                  </div>
                  <span className="text-xs text-gray-400">💵</span>
                </button>

              </div>

            </div>
          </>
        )}

          </div>

          {/* ================= RIGHT FLOATING COLUMN: ORDER SUMMARY ================= */}
          {cart.length > 0 && (
            <div className="lg:col-span-5 lg:sticky lg:top-10 space-y-6">
            
            <div className="bg-white/[0.02] border border-gold/15 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm shadow-gold/5">
              <h3 className="text-lg sm:text-xl font-serif text-gold-light font-medium tracking-tight">
                Order Summary
              </h3>

              {/* Coupon Form inside order summary */}
              {cart.length > 0 && (
                <div className="space-y-2 border-b border-gold/10 pb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE (e.g. ROYALGOLD10)"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="flex-1 bg-white/5 border border-gold/15 focus:border-[#C5A059] focus:outline-none text-xs rounded px-3 py-2 text-white font-mono placeholder-gray-500 uppercase tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(coupon)}
                      className="bg-[#C5A059] text-black font-bold hover:bg-[#D4AF37] transition-all px-4 py-2 text-xs font-mono tracking-widest uppercase rounded shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-400 font-medium">✓ {couponSuccess}</p>
                  )}
                  {subtotal >= 100000 && !couponSuccess && (
                    <p className="text-[10px] text-[#C5A059] font-medium animate-pulse">
                      Code "ROYALGOLD10" is active for 10% discount!
                    </p>
                  )}
                </div>
              )}

              {/* Breakdown lines */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-white">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono font-semibold">
                      -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-[#C5A059] font-medium">Complimentary</span>
                </div>

                <div className="flex justify-between text-gray-500">
                  <span>Tax (Calculated)</span>
                  <span className="font-mono font-semibold text-white">
                    ₹{estimatedTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t border-gold/10 pt-4 flex justify-between items-baseline">
                  <span className="text-base font-serif font-medium text-white">Total</span>
                  <span className="text-2xl font-serif text-[#C5A059] font-bold">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-xs text-rose-400 text-center font-medium">{checkoutError}</p>
              )}

              {/* COMPLETE PURCHASE ACTION BUTTON */}
              <button
                type="button"
                onClick={handleCheckoutSubmit}
                disabled={isSubmitting || cart.length === 0 || (currentUser !== null && selectedAddressIndex === -1)}
                className="w-full bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 text-black font-bold font-mono tracking-widest text-xs py-4 rounded transition-all uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                id="place-order-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing Secures...</span>
                  </>
                ) : !currentUser ? (
                  <>
                    <span>Sign In to Buy</span>
                    <Lock size={13} />
                  </>
                ) : (
                  <>
                    <span>Complete Purchase</span>
                    <Lock size={13} />
                  </>
                )}
              </button>

              {/* Error instruction */}
              {currentUser && selectedAddressIndex === -1 && (
                <p className="text-[10px] text-center text-amber-600 font-medium">
                  * Select or save a delivery address to complete your transaction.
                </p>
              )}

              {/* Secure Checkout details */}
              <p className="text-[10px] text-gray-400 font-mono tracking-wider text-center flex items-center justify-center gap-1.5">
                <Check size={12} className="text-emerald-500" />
                <span>SECURE 256-BIT ENCRYPTED CHECKOUT</span>
              </p>

            </div>

          </div>
        )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* ==================== +ADD NEW ADDRESS DIALOG/MODAL ===================== */}
      {/* ========================================================================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111111] text-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 relative border border-gold/15 font-sans">
            
            {/* Close Button */}
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-gold/10 hover:border-gold/30 hover:bg-white/5 text-gray-400 transition-colors cursor-pointer"
              id="close-address-modal"
            >
              <X size={16} />
            </button>

            {/* Title */}
            <div className="text-center mb-6">
              <span className="font-serif text-2xl font-bold tracking-tight text-gold-light">
                New Shipping Coordinates
              </span>
              <p className="text-[10px] tracking-wider text-gray-400 uppercase mt-1">Bespoke White-Glove Dispatch Destination</p>
            </div>

            {dialogError && (
              <p className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 text-center font-medium font-sans">
                ✘ {dialogError}
              </p>
            )}

            {/* Form */}
            <form onSubmit={handleAddNewAddressSubmit} className="space-y-4" id="add-new-address-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Street Address */}
                <div className="sm:col-span-2 flex flex-col space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={newStreetAddress}
                    onChange={(e) => setNewStreetAddress(e.target.value)}
                    placeholder="e.g. FLAT 402, GOLCONDA HERITAGE APARTMENTS"
                    className="border-b border-gold/15 bg-transparent py-2 focus:border-[#C5A059] focus:outline-none text-xs font-mono text-white placeholder-gray-500 uppercase tracking-wide"
                    required
                  />
                </div>

                {/* City */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. HYDERABAD"
                    className="border-b border-gold/15 bg-transparent py-2 focus:border-[#C5A059] focus:outline-none text-xs font-mono text-white placeholder-gray-500 uppercase tracking-wide"
                    required
                  />
                </div>

                {/* State */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    placeholder="e.g. TELANGANA"
                    className="border-b border-gold/15 bg-transparent py-2 focus:border-[#C5A059] focus:outline-none text-xs font-mono text-white placeholder-gray-500 uppercase tracking-wide"
                    required
                  />
                </div>

                {/* Zip Code */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">
                    PIN / Zip Code
                  </label>
                  <input
                    type="text"
                    value={newZipCode}
                    onChange={(e) => setNewZipCode(e.target.value)}
                    placeholder="e.g. 500008"
                    className="border-b border-gold/15 bg-transparent py-2 focus:border-[#C5A059] focus:outline-none text-xs font-mono text-white placeholder-gray-500 uppercase tracking-wide font-bold"
                    required
                  />
                </div>

                {/* Country */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    placeholder="e.g. INDIA"
                    className="border-b border-gold/15 bg-transparent py-2 focus:border-[#C5A059] focus:outline-none text-xs font-mono text-white placeholder-gray-500 uppercase tracking-wide"
                    required
                  />
                </div>

              </div>

              {/* Submit / Action Row */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-mono text-xs py-3.5 rounded-xl uppercase transition-colors cursor-pointer tracking-wider border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold font-mono text-xs py-3.5 rounded-xl uppercase transition-colors cursor-pointer tracking-wider"
                  id="dialog-save-address-btn"
                >
                  Save Address
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
