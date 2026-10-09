import { useState } from 'react';
import { 
  ArrowLeft, Receipt, MapPin, CreditCard, ChevronRight, 
  Package, Truck, CheckCircle2, ShoppingBag, ExternalLink, Star 
} from 'lucide-react';
import { Order } from '../types';

interface CustomerOrdersPageProps {
  onClose: () => void;
  orders: Order[];
  onExploreProducts: () => void;
}

export default function CustomerOrdersPage({ onClose, orders, onExploreProducts }: CustomerOrdersPageProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  // Bounds-safe active item tracking
  const activeItemIndex = selectedOrder && selectedItemIndex < selectedOrder.items.length ? selectedItemIndex : 0;
  const activeItem = selectedOrder?.items?.[activeItemIndex];
  const activeItemStatus = activeItem?.status || selectedOrder?.status || 'Processing';

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Processing':
        return 0;
      case 'Shipped':
        return 1;
      case 'Delivered':
        return 2;
      default:
        return 0;
    }
  };

  const steps = [
    { label: 'Processing', desc: 'Handcrafted by expert royal artisans' },
    { label: 'Shipped', desc: 'Dispatched via insured secure courier' },
    { label: 'Delivered', desc: 'Hand-delivered to your coordinates' }
  ];

  return (
    <div className="bg-dark-rich text-white min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans animate-fadeIn" id="customer-orders-page-view">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono tracking-widest text-gold hover:text-gold-bright transition-all bg-white/5 border border-gold/20 hover:border-gold p-2.5 sm:px-4 sm:py-2 rounded-full cursor-pointer"
            id="orders-back-to-landing"
            title="Back to Curations"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">BACK TO CURATIONS</span>
          </button>
          
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase">
            <span>AURUM CONCIERGE</span>
            <ChevronRight size={10} />
            <span className="text-gold-light font-bold">MY BESPOKE ORDERS ({orders.length})</span>
          </div>
        </div>

        {/* Outer Grid */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 bg-white/[0.01] rounded-3xl border border-white/5">
            <div className="p-5 bg-white/5 rounded-full border border-white/10 text-gold/40">
              <ShoppingBag size={56} />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-gold-light">No Sovereign Orders Found</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                You have not initiated any customized royal requests yet. Every bespoke creation you purchase will display its craft status and delivery timeline in real-time here.
              </p>
            </div>
            <button
              onClick={onExploreProducts}
              className="bg-gradient-to-r from-gold-dark via-gold to-gold-bright text-dark-rich font-bold tracking-widest text-xs px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-gold/20 cursor-pointer uppercase"
            >
              Explore Royal Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= LEFT COLUMN: ORDERS LIST ================= */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-mono tracking-widest text-gray-400 uppercase">
                  ORDER CHRONOLOGY
                </span>
                <span className="text-[10px] text-gold-light font-mono bg-gold/15 border border-gold/25 px-2.5 py-0.5 rounded-full font-bold">
                  {orders.length} Custom Requests
                </span>
              </div>

              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                {orders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  const itemNames = order.items.map(it => it.name).join(', ');
                  const isCancelled = order.status === 'Cancelled';

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-gold/10 border-gold/60 shadow-lg shadow-gold/5'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                      }`}
                      id={`order-card-row-${order.id}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-bold text-gold-light">
                            {order.id}
                          </span>
                          <p className="text-[10px] text-gray-500 font-mono">
                            Placed on {order.date}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[9px] uppercase tracking-wide px-2 py-0.5 rounded font-mono font-bold ${
                          isCancelled
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            : order.status === 'Delivered'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Summary lines */}
                      <p className="text-xs text-gray-300 truncate mb-3">
                        {itemNames}
                      </p>

                      <div className="flex justify-between items-center border-t border-white/5 pt-2.5 mt-1">
                        <span className="text-[10px] text-gray-500 uppercase font-mono">
                          {order.items.length} {order.items.length === 1 ? 'Masterpiece' : 'Masterpieces'}
                        </span>
                        <span className="text-xs font-serif font-bold text-gold">
                          ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= RIGHT COLUMN: INTERACTIVE ORDER DETAILS & LIVE TRACKER ================= */}
            <div className="lg:col-span-7">
              {selectedOrder ? (
                <div className="glass p-6 rounded-3xl border border-white/10 space-y-6" id="order-details-focus-pane">
                  
                  {/* Title Header */}
                  <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gold font-mono tracking-widest uppercase">CONCIERGE DESK DETAILED LOG</span>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-2">
                        <Receipt size={16} className="text-gold" />
                        <span>Order {selectedOrder.id}</span>
                      </h2>
                    </div>

                    <div className="flex flex-col sm:items-end text-xs">
                      <span className="text-gray-400 font-mono">Date Placed</span>
                      <span className="text-gold-light font-bold font-mono">{selectedOrder.date}</span>
                    </div>
                  </div>

                  {/* 1. Progress Tracking Section */}
                  {selectedOrder.status !== 'Cancelled' && activeItemStatus !== 'Cancelled' ? (
                    <div className="space-y-4">
                      <div className="border-b border-white/5 pb-2">
                        <h3 className="text-xs font-mono font-bold tracking-widest text-gold uppercase">
                          LIVE DELIVERY LOGISTICS: <span className="text-white normal-case font-sans font-bold">{activeItem?.name || 'Selected Piece'}</span>
                        </h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                          Individual Track Status: <span className="text-gold-light font-bold">{activeItemStatus}</span>
                        </p>
                      </div>

                      <div className="relative flex justify-between items-center mt-3 px-1.5">
                        {/* Tracker Background track */}
                        <div className="absolute left-0 right-0 h-0.5 bg-white/10 top-2.5 z-0" />
                        {/* Tracker Fill line */}
                        <div 
                          className="absolute left-0 h-0.5 bg-gold top-2.5 transition-all duration-700 z-0" 
                          style={{ width: `${(getStepIndex(activeItemStatus) / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((st, sidx) => {
                          const isActive = sidx <= getStepIndex(activeItemStatus);
                          const isCurrent = sidx === getStepIndex(activeItemStatus);
                          return (
                            <div key={sidx} className="flex flex-col items-center relative z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all text-[10px] ${
                                isCurrent
                                  ? 'bg-gold border-gold text-dark-rich font-black ring-4 ring-gold/25'
                                  : isActive
                                  ? 'bg-gold/20 border-gold text-gold'
                                  : 'bg-dark-card border-white/20 text-gray-500'
                              }`}>
                                {sidx + 1}
                              </div>
                              <span className={`text-[9px] font-bold mt-2 font-mono uppercase tracking-wider ${
                                isActive ? 'text-gold' : 'text-gray-500'
                              }`}>
                                {st.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Current Status Box */}
                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-start gap-3.5 text-xs text-gray-300">
                        {getStepIndex(activeItemStatus) === 1 ? (
                          <Truck className="text-gold animate-bounce shrink-0 mt-0.5" size={18} />
                        ) : getStepIndex(activeItemStatus) === 2 ? (
                          <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                        ) : (
                          <Package className="text-gold shrink-0 mt-0.5" size={18} />
                        )}
                        <div>
                          <p className="font-serif font-bold text-white text-xs sm:text-sm">
                            {steps[getStepIndex(activeItemStatus)].label} Status Verified
                          </p>
                          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                            {steps[getStepIndex(activeItemStatus)].desc} — Artisan ledger confirmed. Individually tracked for maximum security.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 space-y-1">
                      <p className="font-serif font-bold text-sm">Item or Order Cancelled</p>
                      <p className="text-xs text-rose-300/80">
                        This item or the complete design order has been cancelled/placed on hold for manual verification by the boutique.
                      </p>
                    </div>
                  )}

                  {/* 2. Items Ordered List */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h3 className="text-xs font-mono font-bold tracking-widest text-gold uppercase">
                        SPECIFICATIONS & INCLUDED ITEMS
                      </h3>
                      <span className="text-[9px] font-mono text-gray-400 uppercase">Click item to track separately</span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedOrder.items.map((it, idx) => {
                        const isTrackingThis = idx === activeItemIndex;
                        const itemStatus = it.status || selectedOrder.status || 'Processing';
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedItemIndex(idx)}
                            className={`p-3.5 rounded-2xl border transition-all text-xs cursor-pointer ${
                              isTrackingThis 
                                ? 'bg-gold/10 border-gold/40 shadow-inner' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex justify-between items-center gap-4">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  {isTrackingThis && <div className="w-1.5 h-1.5 rounded-full bg-gold animate-ping shrink-0" />}
                                  <p className={`font-bold transition-colors ${isTrackingThis ? 'text-gold' : 'text-white'}`}>{it.name}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 font-mono">
                                  <span>Size: <strong className="text-gold-light">{it.selectedSize}</strong></span>
                                  <span>•</span>
                                  <span>Qty: <strong>{it.quantity}</strong></span>
                                  <span>•</span>
                                  <span>Track: <strong className="text-gold">{itemStatus}</strong></span>
                                </div>
                              </div>
                              <span className="font-mono text-gray-300 font-semibold shrink-0 text-right">
                                ₹{it.price.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      <div className="h-px bg-white/5 my-2" />

                      <div className="flex justify-between text-xs font-mono px-1">
                        <span className="text-gray-400">Transaction ID:</span>
                        <span className="text-gray-300 select-all truncate max-w-[180px]" title={(selectedOrder as any).razorpayPaymentId || selectedOrder.stripeSessionId}>
                          {(selectedOrder as any).razorpayPaymentId || selectedOrder.stripeSessionId || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Shipping & Payment Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-2">
                      <h4 className="text-[10px] font-mono tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
                        <MapPin size={12} className="text-gold" />
                        <span>DISPATCH COORDINATES</span>
                      </h4>
                      <div className="text-xs text-gray-300 space-y-0.5">
                        <p className="font-bold text-white">{selectedOrder.address.fullName}</p>
                        <p className="truncate" title={selectedOrder.address.streetAddress}>{selectedOrder.address.streetAddress}</p>
                        <p>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipCode}</p>
                        <p className="font-mono text-[10px] text-gray-500 mt-1">{selectedOrder.address.phone}</p>
                      </div>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-2">
                      <h4 className="text-[10px] font-mono tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
                        <CreditCard size={12} className="text-gold" />
                        <span>ROYAL SETTLEMENT METHOD</span>
                      </h4>
                      <div className="text-xs text-gray-300 space-y-1">
                        <p className="font-bold text-white uppercase">
                          {selectedOrder.paymentMethod === 'COD' 
                            ? 'Cash On Delivery (COD)' 
                            : `Paid via ${selectedOrder.paymentMethod || 'Razorpay'} Secure`}
                        </p>
                        <p className="text-gray-400 text-[11px]">
                          {selectedOrder.paymentMethod === 'COD'
                            ? 'Collect cash during premium hand-delivery.'
                            : 'Authentic encrypted transaction completed via Razorpay.'}
                        </p>
                        <p className="text-gold font-bold font-mono text-[11px] mt-1">
                          Total Paid: ₹{selectedOrder.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* 4. Support and Help desk options */}
                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
                    <p className="flex items-center gap-1.5">
                      <Star size={12} className="text-gold fill-gold" />
                      <span>Complimentary lifetime exchange is active on this order.</span>
                    </p>
                    <a 
                      href="#concierge-support"
                      className="text-gold hover:text-gold-bright transition-all font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>CONCIERGE DESK SUPPORT</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>

                </div>
              ) : null}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
