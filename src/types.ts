export interface ItemCustomization {
  name: string;
  options: string[];
}

export interface JewelryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: 'Necklaces' | 'Rings' | 'Earrings' | 'Bracelets' | 'Bangles';
  material: string; // e.g. "18K Yellow Gold", "22K Solid Gold", "Rose Gold"
  weight: string; // e.g. "4.5 grams", "12.8 grams"
  rating: number;
  isBestSeller?: boolean;
  metalType?: 'Yellow Gold' | 'Rose Gold' | 'White Gold' | 'Platinum';
  gemstone?: 'Diamond' | 'Emerald' | 'Pearl' | 'Ruby' | 'Sapphire' | 'None';
  customizations?: ItemCustomization[];
}

export interface CartItem {
  item: JewelryItem;
  quantity: number;
  selectedSize?: string; // Optional e.g. ring size or bracelet length
  selectedCustomizations?: Record<string, string>;
}

export interface SavedAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  savedAddress?: SavedAddress;
  savedAddresses?: SavedAddress[];
  mobile?: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedCustomizations?: Record<string, string>;
    status?: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  }[];
  totalAmount: number;
  address: SavedAddress;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  stripeSessionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
}

export interface NewsOffer {
  id: string;
  type: 'news' | 'offer';
  title: string;
  content: string;
  imageUrl?: string;
  discountCode?: string; // Optional if it's an offer
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  expiryDate?: string;
  date: string;
}
