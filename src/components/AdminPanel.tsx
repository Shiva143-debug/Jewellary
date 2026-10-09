import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Newspaper, Receipt, Package, Trash, RefreshCw, CheckCircle2, Check, LayoutGrid, Layers, ShoppingBag, Edit, Plus, X, Calendar, Tag, Image, Sparkles , Edit2, Trash2} from 'lucide-react';
import { JewelryItem, NewsOffer, Order } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  items: JewelryItem[];
  posts: NewsOffer[];
  orders: Order[];
  onAddItem: (itemData: Omit<JewelryItem, 'id' | 'rating'>) => Promise<void>;
  onUpdateItem?: (itemId: string, itemData: Partial<JewelryItem>) => Promise<void>;
  onDeleteItem?: (itemId: string) => Promise<void>;
  onAddPost: (postData: Omit<NewsOffer, 'id' | 'date'>) => Promise<void>;
  onUpdatePost?: (postId: string, postData: Partial<NewsOffer>) => Promise<void>;
  onDeletePost?: (postId: string) => Promise<void>;
  onUpdateOrderStatus?: (orderId: string, status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => Promise<void>;
  onUpdateOrderItemStatus?: (orderId: string, itemId: string, status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => Promise<void>;
}

export default function AdminPanel({
  onClose,
  items,
  posts,
  orders,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  onUpdateOrderStatus,
  onUpdateOrderItemStatus
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'orders' | 'inventory'>('inventory');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>('All');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'All' | 'COD' | 'UPI' | 'Net Banking' | 'Credit Card' | 'Razorpay'>('All');

  // Dialog & Edit states
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsOffer | null>(null);
  const [editingItem, setEditingItem] = useState<JewelryItem | null>(null);

  // Add Item form states
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemOriginalPrice, setItemOriginalPrice] = useState('');
  const [itemCategory, setItemCategory] = useState<'Necklaces' | 'Rings' | 'Earrings' | 'Bracelets' | 'Bangles'>('Rings');
  const [itemMaterial, setItemMaterial] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [itemCustomizations, setItemCustomizations] = useState<{name: string, options: string[]}[]>([]);
  const [itemMsg, setItemMsg] = useState({ text: '', type: '' });

  // Add News/Offer form states
  const [postType, setPostType] = useState<'news' | 'offer'>('news');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postCode, setPostCode] = useState('');
  const [postDiscountType, setPostDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [postDiscountValue, setPostDiscountValue] = useState('');
  const [postExpiry, setPostExpiry] = useState('');
  const [postMsg, setPostMsg] = useState({ text: '', type: '' });

  const categories = ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Bangles'] as const;

  const handleAddItemSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !itemMaterial || !itemWeight || !itemDesc) {
      setItemMsg({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    try {
      if (editingItem && onUpdateItem) {
        await onUpdateItem(editingItem.id, {
          name: itemName,
          description: itemDesc,
          price: Number(itemPrice),
          originalPrice: itemOriginalPrice ? Number(itemOriginalPrice) : undefined,
          imageUrl: itemImage || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop',
          category: itemCategory,
          material: itemMaterial,
          weight: itemWeight,
          isBestSeller,
          customizations: itemCustomizations.filter(c => c.name && c.options.some(o => o.trim())).map(c => ({
            name: c.name,
            options: c.options.map(o => o.trim()).filter(o => o)
          }))
        });
        setItemMsg({ text: 'Jewelry item updated successfully!', type: 'success' });
      } else {
        await onAddItem({
          name: itemName,
          description: itemDesc,
          price: Number(itemPrice),
          originalPrice: itemOriginalPrice ? Number(itemOriginalPrice) : undefined,
          imageUrl: itemImage || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop',
          category: itemCategory,
          material: itemMaterial,
          weight: itemWeight,
          isBestSeller,
          customizations: itemCustomizations.filter(c => c.name && c.options.some(o => o.trim())).map(c => ({
            name: c.name,
            options: c.options.map(o => o.trim()).filter(o => o)
          }))
        });
        setItemMsg({ text: 'Jewelry item added successfully!', type: 'success' });
      }
      // Reset
      setItemName('');
      setItemPrice('');
      setItemOriginalPrice('');
      setItemMaterial('');
      setItemWeight('');
      setItemDesc('');
      setItemImage('');
      setIsBestSeller(false);
      setItemCustomizations([]);
      
      setTimeout(() => {
        setItemMsg({ text: '', type: '' });
        setIsItemDialogOpen(false);
      }, 1500);
    } catch (err: any) {
      setItemMsg({ text: 'Failed to add item.', type: 'error' });
    }
  };

  const handleAddPostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) {
      setPostMsg({ text: 'Title and content are required.', type: 'error' });
      return;
    }

    try {
      if (editingPost) {
        if (onUpdatePost) {
          await onUpdatePost(editingPost.id, {
            type: postType,
            title: postTitle,
            content: postContent,
            imageUrl: postImage || '',
            discountCode: postType === 'offer' ? postCode : '',
            expiryDate: postType === 'offer' ? postExpiry : ''
          });
          setPostMsg({ text: 'News/Offer bulletin updated successfully!', type: 'success' });
        }
      } else {
        await onAddPost({
          type: postType,
          title: postTitle,
          content: postContent,
          imageUrl: postImage || undefined,
          discountCode: postType === 'offer' ? postCode : undefined,
          expiryDate: postType === 'offer' ? postExpiry : undefined
        });
        setPostMsg({ text: 'News/Offer bulletin posted successfully!', type: 'success' });
      }

      setPostTitle('');
      setPostContent('');
      setPostImage('');
      setPostCode('');
      setPostDiscountType('percentage');
      setPostDiscountValue('');
      setPostExpiry('');
      setEditingPost(null);
      
      setTimeout(() => {
        setPostMsg({ text: '', type: '' });
        setIsPostDialogOpen(false);
      }, 1500);
    } catch (err: any) {
      setPostMsg({ text: editingPost ? 'Failed to update bulletin.' : 'Failed to post bulletin.', type: 'error' });
    }
  };

  const handleDeletePostClick = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this bulletin/offer?')) {
      try {
        if (onDeletePost) {
          await onDeletePost(postId);
        }
      } catch (err) {
        alert('Failed to delete news/offer post');
      }
    }
  };

  const handleEditPostClick = (post: NewsOffer) => {
    setEditingPost(post);
    setPostType(post.type);
    setPostTitle(post.title);
    setPostContent(post.content);
    setPostImage(post.imageUrl || '');
    setPostCode(post.discountCode || '');
    setPostDiscountType(post.discountType || 'percentage');
    setPostDiscountValue(post.discountValue ? String(post.discountValue) : '');
    setPostExpiry(post.expiryDate || '');
    setPostMsg({ text: '', type: '' });
    setIsPostDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white py-6 sm:py-8 font-sans" id="admin-panel-view">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 animate-fadeIn">
        
        {/* Simple spacing since the header was removed */}
        <div className="pt-4"></div>

        {/* Dashboard Navigation Tabs - Full width line, luxury underline styling */}
        <div 
          className="flex overflow-x-auto whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap items-center gap-1 sm:gap-2 mb-8 border-b border-white/10 pb-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {(['inventory', 'news', 'orders'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels = {
              inventory: 'Store Inventory',
              news: 'News & Offers',
              orders: `Customer Orders (${orders.length})`
            };
            const icons = {
              inventory: <Package size={14} className="shrink-0" />,
              news: <Newspaper size={14} className="shrink-0" />,
              orders: <Receipt size={14} className="shrink-0" />
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer font-sans border-b-2 shrink-0 ${
                  isActive
                    ? 'text-gold border-gold font-extrabold'
                    : 'text-gray-400 hover:text-white border-transparent'
                }`}
                id={`tab-${tab}`}
              >
                {icons[tab]}
                <span>{labels[tab]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents - Flat, Full Page */}
        <div className="w-full py-2 font-sans" id="admin-tab-content">

          {/* TAB 1: NEWS & OFFERS CARDS VIEW */}
          {activeTab === 'news' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gold-light font-sans uppercase tracking-wider">Broadcast Offers & Chronicles</h3>
                  <p className="text-xs text-gray-400 font-sans mt-0.5">Manage promotional events, coupon declarations, and editorial columns with direct update and deletion controls.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setPostTitle('');
                    setPostContent('');
                    setPostImage('');
                    setPostCode('');
                    setPostExpiry('');
                    setPostMsg({ text: '', type: '' });
                    setIsPostDialogOpen(true);
                  }}
                  className="bg-gold hover:bg-gold-light text-dark-rich px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer font-sans self-start shadow-lg shadow-gold/10 hover:shadow-gold/20"
                >
                  <Plus size={16} />
                  <span>Add News & Offer</span>
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <Newspaper className="text-gold/20 mx-auto h-16 w-16 mb-4 animate-pulse" />
                  <p className="text-base text-gold-light font-bold font-sans">No broadcast bulletins active</p>
                  <p className="text-xs text-gray-400 font-sans mt-1">Click the "+ Add News & Offer" button above to launch your first publication.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <div 
                      key={post.id} 
                      className="bg-white/[0.02] border border-white/10 hover:border-gold/20 rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
                          <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider font-sans ${
                            post.type === 'offer'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-gold/10 text-gold-light border-gold/20'
                          }`}>
                            {post.type === 'offer' ? '🏷️ VIP Offer Event' : '📰 Boutique Editorial'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                            <Calendar size={11} />
                            {post.date}
                          </span>
                        </div>

                        {post.imageUrl && (
                          <div className="w-full h-40 rounded-xl overflow-hidden mb-4 border border-white/10">
                            <img 
                              src={post.imageUrl} 
                              alt={post.title} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <h4 className="text-base font-serif font-extrabold text-gold-light leading-snug">{post.title}</h4>
                        <p className="text-xs text-gray-300 leading-relaxed mt-2.5 whitespace-pre-wrap">{post.content}</p>

                        {post.type === 'offer' && (
                          <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag size={13} className="text-gold" />
                              <span className="text-xs font-bold text-gray-300">Code:</span>
                              <code className="text-xs font-mono font-bold text-gold bg-black/40 px-2 py-0.5 rounded border border-gold/20 uppercase tracking-widest">{post.discountCode || 'N/A'}</code>
                            </div>
                            {post.expiryDate && (
                              <span className="text-[10px] text-gray-400 font-sans">Expires: {post.expiryDate}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-5">
                        <button
                          onClick={() => handleEditPostClick(post)}
                          className="flex-1 bg-white/5 hover:bg-gold/10 text-gray-300 hover:text-gold border border-white/10 hover:border-gold/30 py-2 rounded-xl text-xs font-bold transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePostClick(post.id)}
                          className="flex-1 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 hover:border-rose-500/30 py-2 rounded-xl text-xs font-bold transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                        >
                          <Trash size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTOMER ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-gold-light font-sans">Customer Orders Fulfillment</h3>
                  <p className="text-xs text-gray-400 font-sans mt-0.5">View transaction histories, requested ring/bracelet sizes, addresses, and update fulfillment milestones.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  {/* Payment Type Dropdown Filter */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 flex-1 sm:flex-initial">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono uppercase tracking-wider shrink-0">Payment:</span>
                    <select
                      value={paymentTypeFilter}
                      onChange={(e) => setPaymentTypeFilter(e.target.value as any)}
                      className="bg-[#1A1A1A] text-gold-light border border-white/10 rounded-lg text-xs font-bold px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-gold min-w-[110px]"
                    >
                      <option value="All">All Types</option>
                      <option value="COD">COD</option>
                      <option value="UPI">UPI</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Razorpay">Razorpay</option>
                    </select>
                  </div>

                  {/* Status Dropdown Filter */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 flex-1 sm:flex-initial">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono uppercase tracking-wider shrink-0">Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                      className="bg-[#1A1A1A] text-gold-light border border-white/10 rounded-lg text-xs font-bold px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-gold min-w-[110px]"
                    >
                      <option value="All">All Orders</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {(() => {
                let filteredOrders = orders;
                if (orderStatusFilter !== 'All') {
                  filteredOrders = filteredOrders.filter(o => o.status === orderStatusFilter || o.items.some(it => (it.status || o.status || 'Processing') === orderStatusFilter));
                }
                if (paymentTypeFilter !== 'All') {
                  filteredOrders = filteredOrders.filter(o => {
                    const method = o.paymentMethod || 'Razorpay';
                    return method === paymentTypeFilter;
                  });
                }

                if (filteredOrders.length === 0) {
                  return (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                      <Receipt className="text-gold/20 mx-auto h-16 w-16 mb-4 animate-pulse" />
                      <p className="text-base text-gold-light font-bold font-sans">No matching orders found</p>
                      <p className="text-xs text-gray-400 font-sans mt-1">Try changing the status dropdown filter option above.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* DESKTOP VIEW TABLE (Visible on lg screens and above) */}
                    <div className="hidden lg:block overflow-x-auto rounded-xl border border-white/10 bg-white/[0.01]">
                      <table className="w-full text-left border-collapse text-xs font-sans">
                        <thead>
                          <tr className="bg-white/5 text-gold font-bold uppercase text-[10px] border-b border-white/10 tracking-wider">
                            <th className="p-4 font-sans">Order ID</th>
                            <th className="p-4 font-sans">Customer</th>
                            <th className="p-4 font-sans">Items</th>
                            <th className="p-4 font-sans">Total Amount</th>
                            <th className="p-4 font-sans">Payment Type</th>
                            <th className="p-4 font-sans">Transaction ID</th>
                            <th className="p-4 font-sans">Shipping Destination</th>
                            <th className="p-4 font-sans">Order Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-4 font-mono font-bold text-gold-light">{order.id}</td>
                              <td className="p-4">
                                <p className="font-bold text-white font-sans">{order.customerName}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{order.customerEmail}</p>
                              </td>
                              <td className="p-4 space-y-2.5 max-w-sm">
                                {order.items.map((it, idx) => {
                                  return (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-2.5 rounded-lg space-y-1.5 leading-tight">
                                      <p className="font-bold text-gray-200 font-sans">{it.name}</p>
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="text-[10px] text-gray-400 font-mono">
                                          <span>Qty: <strong>{it.quantity}</strong>, Size: <strong className="text-gold">{it.selectedSize}</strong></span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </td>
                              <td className="p-4">
                                <p className="font-mono font-bold text-gold text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                              </td>
                              <td className="p-4">
                                <p className={`text-[9px] uppercase font-bold font-sans inline-block px-2 py-0.5 rounded border ${
                                  order.paymentMethod === 'COD' 
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {order.paymentMethod === 'COD' ? '💵 COD' : `💳 ${order.paymentMethod || 'Razorpay'}`}
                                </p>
                              </td>
                              <td className="p-4">
                                {(order as any).razorpayPaymentId || (order as any).stripeSessionId ? (
                                  <div className="text-[9px] text-gray-400 font-mono">
                                    <span className="text-gray-300 break-all">{(order as any).razorpayPaymentId || (order as any).stripeSessionId}</span>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-gray-500 font-mono">N/A</span>
                                )}
                              </td>
                              <td className="p-4 text-gray-300 leading-normal max-w-xs font-sans">
                                <p className="font-bold text-[10px] uppercase text-gold/90 mb-1">{order.address.fullName}</p>
                                <p className="text-[11px]">{order.address.streetAddress}</p>
                                <p className="text-[11px]">{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                                <p className="text-[10px] text-gray-400 mt-1">📞 {order.address.phone}</p>
                              </td>
                              <td className="p-4">
                                <select
                                  value={order.status}
                                  onChange={async (e) => {
                                    if (onUpdateOrderStatus) {
                                      try {
                                        await onUpdateOrderStatus(order.id, e.target.value as any);
                                      } catch (err) {
                                        alert('Failed to update status');
                                      }
                                    }
                                  }}
                                  className={`px-3 py-2 rounded-xl font-sans text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold bg-[#1A1A1A] ${
                                    order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    order.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                    order.status === 'Processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}
                                >
                                  <option value="Processing" className="bg-[#1A1A1A] text-white">Processing</option>
                                  <option value="Shipped" className="bg-[#1A1A1A] text-white">Shipped</option>
                                  <option value="Delivered" className="bg-[#1A1A1A] text-white">Delivered</option>
                                  <option value="Cancelled" className="bg-[#1A1A1A] text-white">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE VIEW CARDS (Visible on mobile and tablet) */}
                    <div className="block lg:hidden space-y-4">
                      {filteredOrders.map((order) => (
                        <div 
                          key={order.id} 
                          className="bg-white/[0.02] border border-white/10 hover:border-gold/25 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md transition-all relative overflow-hidden"
                        >
                          {/* Order Header / Status */}
                          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5">
                            <div>
                              <span className="text-[9px] text-gold font-mono tracking-wider uppercase block">Order Identification</span>
                              <p className="font-mono font-bold text-gold-light text-xs sm:text-sm">{order.id}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-gray-400 font-mono tracking-wider uppercase block mb-1">Fulfillment Status</span>
                              <select
                                value={order.status}
                                onChange={async (e) => {
                                  if (onUpdateOrderStatus) {
                                    try {
                                      await onUpdateOrderStatus(order.id, e.target.value as any);
                                    } catch (err) {
                                      alert('Failed to update status');
                                    }
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-xl font-sans text-[10px] font-bold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold bg-[#1A1A1A] ${
                                  order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  order.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                  order.status === 'Processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}
                              >
                                <option value="Processing" className="bg-[#1A1A1A] text-white">Processing</option>
                                <option value="Shipped" className="bg-[#1A1A1A] text-white">Shipped</option>
                                <option value="Delivered" className="bg-[#1A1A1A] text-white">Delivered</option>
                                <option value="Cancelled" className="bg-[#1A1A1A] text-white">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {/* Customer & Address Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                            <div className="space-y-1 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                              <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Customer Details</span>
                              <p className="font-bold text-white text-xs">{order.customerName}</p>
                              <p className="text-[10px] text-gray-400 font-mono break-all mt-0.5">{order.customerEmail}</p>
                            </div>
                            
                            <div className="space-y-1 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                              <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Shipping Destination</span>
                              <p className="font-bold text-[10px] uppercase text-gold/90">{order.address.fullName}</p>
                              <p className="text-[11px] text-gray-300 leading-normal mt-0.5">{order.address.streetAddress}</p>
                              <p className="text-[11px] text-gray-300 leading-normal">{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                              <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">📞 {order.address.phone}</p>
                            </div>
                          </div>

                          {/* Items Section */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Purchased Fine Masterworks ({order.items.length})</span>
                            <div className="space-y-2">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between gap-3 leading-tight">
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-200 text-xs truncate">{it.name}</p>
                                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                                      <span>Quantity: <strong>{it.quantity}</strong> • Size Selection: <strong className="text-gold">{it.selectedSize}</strong></span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Financials & Payment Details */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <p className={`text-[9px] uppercase font-bold font-sans inline-block px-2 py-0.5 rounded border ${
                                  order.paymentMethod === 'COD' 
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {order.paymentMethod === 'COD' ? '💵 COD' : `💳 ${order.paymentMethod || 'Razorpay'}`}
                                </p>
                              </div>
                              {((order as any).razorpayPaymentId || (order as any).stripeSessionId) && (
                                <span className="text-[9px] text-gray-400 font-mono max-w-[150px] truncate" title={(order as any).razorpayPaymentId || (order as any).stripeSessionId}>
                                  TXID: {((order as any).razorpayPaymentId || (order as any).stripeSessionId)}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-gray-400 font-sans block">Consolidated Amount</span>
                              <p className="font-mono font-bold text-gold text-sm sm:text-base">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: STORE INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gold-light font-sans uppercase tracking-wider">Active Boutique Inventory</h3>
                  <p className="text-xs text-gray-400 font-sans mt-0.5">Verify active items cataloged, weight ratios, and standard prices on display.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setItemName('');
                    setItemPrice('');
                    setItemOriginalPrice('');
                    setItemMaterial('');
                    setItemWeight('');
                    setItemDesc('');
                    setItemImage('');
                    setIsBestSeller(false);
                    setItemCustomizations([]);
                    setItemMsg({ text: '', type: '' });
                    setIsItemDialogOpen(true);
                  }}
                  className="bg-gold hover:bg-gold-light text-dark-rich px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer font-sans self-start shadow-lg shadow-gold/10 hover:shadow-gold/20"
                >
                  <Plus size={16} />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white/[0.02] border border-white/10 hover:border-gold/30 p-4 rounded-xl flex items-center gap-4 transition-all">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 font-sans">
                      <h4 className="text-xs font-bold text-gold-light truncate font-sans">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 font-sans mt-0.5">{item.category} • {item.weight}</p>
                      <p className="text-xs font-mono font-bold text-gold mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setItemName(item.name);
                          setItemPrice(item.price.toString());
                          setItemOriginalPrice(item.originalPrice ? item.originalPrice.toString() : '');
                          setItemMaterial(item.material);
                          setItemWeight(item.weight);
                          setItemDesc(item.description);
                          setItemImage(item.imageUrl);
                          setItemCategory(item.category);
                          setIsBestSeller(item.isBestSeller || false);
                          setItemCustomizations(item.customizations ? item.customizations.map(c => ({ name: c.name, options: [...c.options] })) : []);
                          setIsItemDialogOpen(true);
                        }}
                        className="text-gold hover:text-gold-light p-1.5 bg-white/5 rounded transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${item.name}?`) && onDeleteItem) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1.5 bg-white/5 rounded transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* --- FLOATING DIALOGS OVERLAYS --- */}
      <AnimatePresence>
        
        {/* 1. DIALOG: ADD JEWELRY LISTING */}
        {isItemDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] w-full max-w-2xl rounded-3xl p-5 sm:p-8 border border-gold/30 shadow-2xl relative max-h-[90vh] overflow-y-auto gold-glow text-white"
              id="add-jewelry-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsItemDialogOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                id="close-item-dialog"
              >
                <X size={20} />
              </button>

              <div className="mb-6 pr-8">
                <h3 className="text-lg sm:text-xl font-bold text-gold font-sans uppercase tracking-wider">
                  {editingItem ? 'Edit Fine Masterwork' : 'Catalog New Fine Masterwork'}
                </h3>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  {editingItem ? 'Update details of the handcrafted item.' : 'Introduce handcrafted necklaces, bands, rings, and bangles directly to the public showcase.'}
                </p>
              </div>

              {itemMsg.text && (
                <div className={`p-4 rounded-xl text-xs font-medium border font-sans mb-5 ${
                  itemMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {itemMsg.text}
                </div>
              )}

              <form onSubmit={handleAddItemSubmit} className="space-y-5 text-left" id="add-item-form-dialog">
                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Item Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Imperial Ruby Sovereign Ring"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Price (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 150000"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Original Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 180000"
                      value={itemOriginalPrice}
                      onChange={(e) => setItemOriginalPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Category *</label>
                    <select
                      value={itemCategory}
                      onChange={(e: any) => setItemCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-gold-light cursor-pointer font-sans"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#1A1A1A] text-white">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Net Weight (Grams) *</label>
                    <input
                      type="text"
                      placeholder="e.g. 6.2g"
                      value={itemWeight}
                      onChange={(e) => setItemWeight(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Material Composition *</label>
                    <input
                      type="text"
                      placeholder="e.g. 18K Solid Gold & Rubies"
                      value={itemMaterial}
                      onChange={(e) => setItemMaterial(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="bestseller-checkbox-dialog"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="bestseller-checkbox-dialog" className="text-xs font-sans text-gray-300 select-none cursor-pointer">
                    Mark as Featured "Best Seller" on storefront
                  </label>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[11px] font-bold tracking-wider text-gray-400 uppercase font-sans">Customizations</label>
                    <button
                      type="button"
                      onClick={() => setItemCustomizations([...itemCustomizations, { name: '', options: [''] }])}
                      className="text-xs text-gold hover:text-gold-light transition-colors font-sans flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} /> Add Customization
                    </button>
                  </div>
                  <div className="space-y-4">
                    {itemCustomizations.map((cust, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Customization Name (e.g. Size, Engraving Style)"
                            value={cust.name}
                            onChange={(e) => {
                              const newCust = [...itemCustomizations];
                              newCust[index].name = e.target.value;
                              setItemCustomizations(newCust);
                            }}
                            className="flex-1 bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2.5 text-white transition-colors font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newCust = [...itemCustomizations];
                              newCust.splice(index, 1);
                              setItemCustomizations(newCust);
                            }}
                            className="text-gray-500 hover:text-rose-400 p-2.5 bg-white/5 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {cust.name.trim() !== '' && (
                          <div className="pl-2 border-l border-white/10 space-y-2 mt-2">
                            <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase font-sans block mb-1">Options for {cust.name}</label>
                            {cust.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Option value (e.g. 7, Yellow Gold)"
                                  value={opt}
                                  onChange={(e) => {
                                    const newCust = [...itemCustomizations];
                                    newCust[index].options[optIndex] = e.target.value;
                                    setItemCustomizations(newCust);
                                  }}
                                  className="flex-1 bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2 text-white transition-colors font-sans"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newCust = [...itemCustomizations];
                                    newCust[index].options.splice(optIndex, 1);
                                    setItemCustomizations(newCust);
                                  }}
                                  className="text-gray-500 hover:text-rose-400 p-2"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newCust = [...itemCustomizations];
                                newCust[index].options.push('');
                                setItemCustomizations(newCust);
                              }}
                              className="text-[11px] text-gold/70 hover:text-gold transition-colors font-sans flex items-center gap-1 mt-2 cursor-pointer"
                            >
                              <Plus size={12} /> Add another option
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {itemCustomizations.length === 0 && (
                    <p className="text-xs text-gray-500 italic font-sans mt-2">No customizations added.</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Curator Description *</label>
                  <textarea
                    placeholder="e.g. Recalling the vintage designs of 19th-century royal dynasties, this solid gold masterpiece features custom filigree..."
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Image URL (Unsplash or CDN link)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans"
                  />
                  <p className="text-[10px] text-gray-500 font-sans mt-1">
                    Tip: Leave empty to automatically use a premium placeholder luxury gold ring photograph.
                  </p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsItemDialogOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold tracking-wider uppercase text-xs py-3.5 rounded-xl transition-all border border-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-gold-dark to-gold text-dark-rich font-extrabold tracking-wider uppercase text-xs py-3.5 rounded-xl transition-all shadow-lg hover:shadow-gold/20 cursor-pointer hover:brightness-110"
                  >
                    {editingItem ? 'Save Changes' : 'Publish Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 2. DIALOG: ADD/EDIT NEWS & BULLETINS */}
        {isPostDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] w-full max-w-2xl rounded-3xl p-5 sm:p-8 border border-gold/30 shadow-2xl relative max-h-[90vh] overflow-y-auto gold-glow text-white"
              id="add-post-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsPostDialogOpen(false);
                  setEditingPost(null);
                }}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                id="close-post-dialog"
              >
                <X size={20} />
              </button>

              <div className="mb-6 pr-8">
                <h3 className="text-lg sm:text-xl font-bold text-gold font-sans uppercase tracking-wider">
                  {editingPost ? 'Refine Bulletin / Offer' : 'Broadcast Offers & Chronicles'}
                </h3>
                <p className="text-xs text-gray-400 font-sans mt-1">
                  {editingPost ? 'Modify an existing boutique announcement or promotional discount event.' : 'Publish limited-edition promotional discount codes or boutique editorial announcements.'}
                </p>
              </div>

              {postMsg.text && (
                <div className={`p-4 rounded-xl text-xs font-medium border font-sans mb-5 ${
                  postMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {postMsg.text}
                </div>
              )}

              <form onSubmit={handleAddPostSubmit} className="space-y-5 text-left" id="add-post-form-dialog">
                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Broadcast Bulletin Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPostType('news')}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer font-sans ${
                        postType === 'news'
                          ? 'bg-gold border-gold text-dark-rich font-extrabold'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      Boutique News / Editorial
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostType('offer')}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer font-sans ${
                        postType === 'offer'
                          ? 'bg-gold border-gold text-dark-rich font-extrabold'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      Promotional Offer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Bulletin Title *</label>
                  <input
                    type="text"
                    placeholder={postType === 'news' ? 'e.g. Unveiling our Florence Craft Week' : 'e.g. Special Holiday 15% VIP Reduction'}
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Bulletin Content *</label>
                  <textarea
                    placeholder="Write your beautiful announcement details or discount eligibility conditions here..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans resize-none"
                    required
                  />
                </div>

                {postType === 'offer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Coupon Code (Uppercase)</label>
                      <input
                        type="text"
                        placeholder="e.g. DIAMOND15"
                        value={postCode}
                        onChange={(e) => setPostCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white tracking-wider font-mono transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Expiry Date</label>
                      <input
                        type="date"
                        value={postExpiry}
                        onChange={(e) => setPostExpiry(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-gold-light transition-colors font-sans cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Promo Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white transition-colors font-sans"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPostDialogOpen(false);
                      setEditingPost(null);
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold tracking-wider uppercase text-xs py-3.5 rounded-xl transition-all border border-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-gold-dark to-gold text-dark-rich font-extrabold tracking-wider uppercase text-xs py-3.5 rounded-xl transition-all shadow-lg hover:shadow-gold/20 cursor-pointer hover:brightness-110"
                  >
                    {editingPost ? 'Apply Edits' : 'Broadcast Bulletin'}
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
