import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, MapPin, Plus, Trash2, ArrowLeft, Save, ShieldCheck, Check, X, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { User as UserType, SavedAddress } from '../types';

interface UserProfilePageProps {
  currentUser: UserType | null;
  onClose: () => void;
  onUpdateProfile: (updatedUserData: {
    name: string;
    email: string;
    mobile: string;
    savedAddress?: SavedAddress;
    savedAddresses?: SavedAddress[];
  }) => Promise<void>;
  onLogout: () => void;
  onNavigateToOrders?: () => void;
}

export default function UserProfilePage({ currentUser, onClose, onUpdateProfile, onLogout, onNavigateToOrders }: UserProfilePageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  
  // Unified Saved Addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);
  const [showAddresses, setShowAddresses] = useState(false);

  // Dialog states for Add Address
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [dialogFullName, setDialogFullName] = useState('');
  const [dialogPhone, setDialogPhone] = useState('');
  const [dialogStreet, setDialogStreet] = useState('');
  const [dialogCity, setDialogCity] = useState('');
  const [dialogState, setDialogState] = useState('');
  const [dialogZip, setDialogZip] = useState('');
  const [dialogCountry, setDialogCountry] = useState('India');
  const [dialogIsPrimary, setDialogIsPrimary] = useState(false);
  const [dialogError, setDialogError] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state with current user
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setMobile(currentUser.mobile || '');
      
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
          console.error('Error synchronizing local saved addresses in profile sync:', e);
        }
      }

      setAddresses(list);
      setPrimaryIndex(0); // Mark first one as default/primary
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg('Mobile Number is required.');
      return;
    }

    setSaving(true);

    try {
      const primaryAddress = addresses[primaryIndex] || undefined;
      const altAddresses = addresses.filter((_, idx) => idx !== primaryIndex);

      await onUpdateProfile({
        name,
        email,
        mobile,
        savedAddress: primaryAddress,
        savedAddresses: altAddresses
      });

      // Synchronize back to local storage so checkout is updated immediately
      if (currentUser) {
        const storageKey = `aurum_saved_addresses_${currentUser.id}`;
        localStorage.setItem(storageKey, JSON.stringify(addresses));
      }

      setSuccessMsg('Your boutique profile coordinates have been successfully secured.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not update your profile coordinates.');
    } finally {
      setSaving(false);
    }
  };

  const handleDialogAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError('');

    if (!dialogFullName.trim() || !dialogPhone.trim() || !dialogStreet.trim() || !dialogCity.trim() || !dialogZip.trim()) {
      setDialogError('Please fill out all required address fields.');
      return;
    }

    const newAddress: SavedAddress = {
      fullName: dialogFullName.trim(),
      phone: dialogPhone.trim(),
      streetAddress: dialogStreet.trim(),
      city: dialogCity.trim(),
      state: dialogState.trim() || 'NY',
      zipCode: dialogZip.trim(),
      country: dialogCountry.trim() || 'India'
    };

    setAddresses(prev => {
      const updated = [...prev];
      if (dialogIsPrimary) {
        updated.unshift(newAddress);
        setPrimaryIndex(0);
      } else {
        updated.push(newAddress);
        if (updated.length === 1) {
          setPrimaryIndex(0);
        }
      }
      return updated;
    });

    // Reset alt fields
    setDialogFullName('');
    setDialogPhone('');
    setDialogStreet('');
    setDialogCity('');
    setDialogState('');
    setDialogZip('');
    setDialogCountry('India');
    setDialogIsPrimary(false);
    setIsAddDialogOpen(false);
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (primaryIndex === index) {
        setPrimaryIndex(0);
      } else if (primaryIndex > index) {
        setPrimaryIndex(p => p - 1);
      }
      return updated;
    });
  };

  const handleSetPrimary = (index: number) => {
    setPrimaryIndex(index);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-white min-h-[75vh]" id="user-profile-screen">
      {/* Back & Breadcrumbs */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-mono tracking-widest text-gold hover:text-white transition-colors uppercase cursor-pointer bg-white/5 border border-gold/20 hover:border-gold p-2.5 sm:px-4 sm:py-2 rounded-full sm:rounded-none sm:bg-transparent sm:border-0"
          id="profile-back-btn"
          title="Return to Boutique"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Return to Boutique</span>
        </button>
      </div>

      {/* Header section with Logout Button */}
      <div className="mb-10 border-b border-gold/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-dark via-gold to-gold-bright text-dark-rich font-black flex items-center justify-center font-serif text-xl tracking-wider uppercase shadow-lg shadow-gold/10">
              {name.split(' ').map(n => n[0]).join('').slice(0, 2) || <User size={24} />}
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-3xl font-extrabold tracking-wide text-gold-light uppercase">
                {name || 'Client Profile'}
              </h1>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Refine, manage, and verify your credentials and secure shipping points.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            {onNavigateToOrders && (
              <button
                type="button"
                onClick={onNavigateToOrders}
                className="bg-gold/15 hover:bg-gold text-gold hover:text-dark-rich border border-gold/20 hover:border-gold px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer font-bold flex items-center gap-1.5 shadow-md shadow-gold/5"
                id="profile-my-orders-btn"
              >
                <ShoppingBag size={13} />
                <span>My Orders</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-400 px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer font-bold"
              id="profile-logout-btn"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Save / Error / Success alerts */}
      <AnimatePresence mode="wait">
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono flex items-center gap-2"
          >
            <Check size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-mono"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1: Identity / Profile Credentials (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-2xl p-6 border border-gold/10 space-y-5">
              <h2 className="text-sm font-serif font-bold text-gold uppercase tracking-wider border-b border-gold/5 pb-2.5 flex items-center gap-2">
                <User size={15} />
                <span>Client Identification</span>
              </h2>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-3.5 top-3.5 text-gold/60" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-white text-xs rounded-xl pl-9 pr-4 py-3 transition-all"
                    placeholder="E.g. Charlotte Rose"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Email Address (Optional)</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-3.5 text-gold/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-white text-xs rounded-xl pl-9 pr-4 py-3 transition-all"
                    placeholder="E.g. member@aurum.com"
                  />
                </div>
              </div>

              {/* Mobile Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Mobile Number</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3.5 top-3.5 text-gold/60" />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-white text-xs rounded-xl pl-9 pr-4 py-3 transition-all"
                    placeholder="E.g. +91 99666 00000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Col 2 & 3: Unified Address Book (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Toggle Button with chevron up/down icons */}
            <button
              type="button"
              onClick={() => setShowAddresses(!showAddresses)}
              className="w-full flex items-center justify-between bg-gold/10 hover:bg-gold/15 text-gold border border-gold/20 hover:border-gold/30 px-5 py-4 rounded-2xl text-xs sm:text-sm font-mono tracking-wider uppercase transition-all font-bold cursor-pointer shadow-md shadow-gold/5"
              id="profile-toggle-addresses-btn"
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-gold animate-pulse" />
                <span>My Saved Addresses ({addresses.length})</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400 font-normal normal-case">
                <span>{showAddresses ? 'Close Address Details' : 'Show Saved Addresses'}</span>
                {showAddresses ? (
                  <ChevronUp size={16} className="text-gold" />
                ) : (
                  <ChevronDown size={16} className="text-gold" />
                )}
              </span>
            </button>

            {/* Collapsible Content */}
            <AnimatePresence initial={false}>
              {showAddresses && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="glass rounded-2xl p-6 border border-gold/10 flex flex-col h-full min-h-[250px]">
                    <div className="flex justify-between items-center border-b border-gold/5 pb-2.5 mb-5">
                      <h3 className="text-xs font-serif font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                        <MapPin size={14} />
                        <span>Coordinate Registry</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddDialogOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-gold/10 text-gold hover:bg-gold/25 hover:text-white border border-gold/30 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all font-bold cursor-pointer"
                        id="add-new-address-btn"
                      >
                        <Plus size={12} />
                        <span>Add Address</span>
                      </button>
                    </div>

                    {/* Addresses List/Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      {addresses.length === 0 ? (
                        <div className="col-span-full py-10 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                          <MapPin size={24} className="text-gold/30 mb-2" />
                          <h4 className="text-xs font-serif font-bold text-gold-light mb-1">No Saved Addresses Found</h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed max-w-sm">
                            Please register address coordinates for your premium physical delivery. Click 'Add Address' to proceed.
                          </p>
                        </div>
                      ) : (
                        addresses.map((addr, idx) => {
                          const isPrimary = idx === primaryIndex;
                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-4 relative ${
                                isPrimary 
                                  ? 'border-gold bg-gold/[0.03] shadow-md shadow-gold/5' 
                                  : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                              }`}
                            >
                              <div className="space-y-1.5 text-left">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-serif font-extrabold text-xs text-gold-light truncate uppercase">
                                    {addr.fullName}
                                  </span>
                                  {isPrimary ? (
                                    <span className="text-[9px] font-mono font-bold bg-gold text-dark-rich px-2 py-0.5 rounded shadow">
                                      PRIMARY
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-mono bg-white/10 text-gray-400 px-1.5 py-0.5 rounded">
                                      ALT
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5 mt-1">
                                  <Phone size={11} className="text-gold/60 shrink-0" /> 
                                  <span>{addr.phone}</span>
                                </p>
                                
                                <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2">
                                  {addr.streetAddress}<br />
                                  {addr.city}, {addr.state} - <span className="font-mono text-white font-bold">{addr.zipCode}</span><br />
                                  <span className="text-gray-500 text-[10px] uppercase font-mono">{addr.country}</span>
                                </p>
                              </div>

                              <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                                {!isPrimary ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimary(idx)}
                                    className="text-[10px] font-mono text-gold hover:text-white hover:underline uppercase tracking-wider cursor-pointer"
                                  >
                                    Set As Primary
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                    <Check size={11} /> Default Destination
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemoveAddress(idx)}
                                  className="text-gray-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer shrink-0"
                                  title="Remove Address"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* My Orders Section - Directly below My Saved Addresses */}
            {onNavigateToOrders && (
              <div className="glass rounded-2xl p-6 border border-gold/10 space-y-4">
                <div className="flex justify-between items-center border-b border-gold/5 pb-2.5">
                  <h3 className="text-xs font-serif font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag size={14} />
                    <span>My Orders & Dispatch Tracking</span>
                  </h3>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded tracking-widest uppercase font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Access your premium order history, luxury dispatch coordinates, real-time white-glove transit status, and itemized invoice details.
                </p>
                <button
                  type="button"
                  onClick={onNavigateToOrders}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold-dark via-gold to-gold-bright text-black font-extrabold font-mono text-[11px] tracking-widest uppercase px-5 py-3.5 rounded-xl hover:scale-[1.01] transition-all shadow-md shadow-gold/10 cursor-pointer"
                  id="profile-tracking-navigation-btn"
                >
                  <ShoppingBag size={13} />
                  <span>Track My Orders &rarr;</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Submit Bar */}
        <div className="border-t border-gold/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 font-mono text-center sm:text-left leading-relaxed">
            By updating, your changes are registered permanently onto the secure database of Aurum Fine Jewelry Co.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-mono uppercase text-xs tracking-wider px-6 py-3.5 rounded-xl transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold-dark via-gold to-gold-bright text-dark-rich font-bold tracking-widest uppercase text-xs px-8 py-3.5 rounded-xl shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50 cursor-pointer"
              id="save-profile-coordinates-btn"
            >
              <Save size={14} />
              <span>{saving ? 'SECURING...' : 'SAVE ALL CHANGES'}</span>
            </button>
          </div>
        </div>

      </form>

      {/* 2. CENTER POPUP DIALOG FOR ADDING ADDRESS */}
      <AnimatePresence>
        {isAddDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative glass-dark w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 text-white border border-gold/20 admin-glow"
              id="add-address-dialog"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsAddDialogOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full border border-gold/15 hover:border-gold hover:bg-gold/10 text-gold transition-colors cursor-pointer"
                id="close-address-dialog"
              >
                <X size={16} />
              </button>

              <div className="mb-6">
                <h3 className="font-serif text-lg sm:text-xl font-extrabold tracking-wide text-gold-light">
                  Add Delivery Destination
                </h3>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Register secure delivery coordinates for fulfillment dispatch.
                </p>
              </div>

              {dialogError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                  {dialogError}
                </div>
              )}

              <form onSubmit={handleDialogAddAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Recipient Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={dialogFullName}
                      onChange={(e) => setDialogFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-white text-xs rounded-xl px-4 py-3 transition-all"
                      placeholder="Charlotte Rose"
                    />
                  </div>

                  {/* Recipient Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      value={dialogPhone}
                      onChange={(e) => setDialogPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-white text-xs rounded-xl px-4 py-3 transition-all"
                      placeholder="+91 99666 00000"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={dialogStreet}
                    onChange={(e) => setDialogStreet(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-white text-xs rounded-xl px-4 py-3 transition-all"
                    placeholder="E.g. 104, Royal Crescent Apartments"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">City *</label>
                    <input
                      type="text"
                      required
                      value={dialogCity}
                      onChange={(e) => setDialogCity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-white text-xs rounded-xl px-4 py-3 transition-all"
                      placeholder="Mumbai"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">State / Region</label>
                    <input
                      type="text"
                      value={dialogState}
                      onChange={(e) => setDialogState(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-white text-xs rounded-xl px-4 py-3 transition-all"
                      placeholder="MH"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* ZIP */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={dialogZip}
                      onChange={(e) => setDialogZip(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-white text-xs rounded-xl px-4 py-3 transition-all font-mono"
                      placeholder="400001"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Country</label>
                    <input
                      type="text"
                      value={dialogCountry}
                      onChange={(e) => setDialogCountry(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-white text-xs rounded-xl px-4 py-3 transition-all"
                      placeholder="India"
                    />
                  </div>
                </div>

                {/* Make Primary Checkbox */}
                <div className="flex items-center gap-2 pt-2 pb-1">
                  <input
                    type="checkbox"
                    id="dialog-is-primary"
                    checked={dialogIsPrimary}
                    onChange={(e) => setDialogIsPrimary(e.target.checked)}
                    className="w-4 h-4 bg-white/5 border border-white/10 rounded accent-gold cursor-pointer"
                  />
                  <label htmlFor="dialog-is-primary" className="text-xs text-gray-300 font-sans select-none cursor-pointer">
                    Designate as default primary delivery destination
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-mono uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-gold-dark via-gold to-gold-bright text-dark-rich font-bold tracking-widest uppercase text-[10px] rounded-xl shadow-lg hover:shadow-gold/20 transition-all cursor-pointer"
                  >
                    Add Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
