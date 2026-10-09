import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'aurum-bespoke-secret-2026';

// Path to persistent data storage
const DB_FILE = path.join(process.cwd(), 'data.json');

// Helper to initialize Razorpay lazily
let razorpayClient: any = null;
function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    console.error('Available RAZORPAY env vars:', Object.keys(process.env).filter(k => k.includes('RAZORPAY')));
    throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing');
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayClient;
}

// Initial Mock Seed Data
const initialData = {
  items: [
    {
      id: '1',
      name: 'Empress Solitaire Diamond Ring',
      description: 'An exquisite 1.5 Carat round-cut VVS1 diamond set in a pristine claw mount of 18K polished Yellow Gold. The perfect token of eternal love.',
      price: 2499,
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop',
      category: 'Rings',
      material: '18K Yellow Gold & Diamond',
      weight: '4.2g',
      rating: 4.9,
      isBestSeller: true
    },
    {
      id: '2',
      name: 'Royal Heritage Gold Choker',
      description: 'A spectacular handcrafted choker made of premium 22K Solid Yellow Gold. Showcases elaborate ancient Indian filigree and royal craftsmanship.',
      price: 4850,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop',
      category: 'Necklaces',
      material: '22K Solid Yellow Gold',
      weight: '18.5g',
      rating: 5.0,
      isBestSeller: true
    },
    {
      id: '3',
      name: 'Aura Celestial Hoop Earrings',
      description: 'Stunning textured earrings in 18K Polished Yellow Gold representing orbits of celestial stars. Classy, minimalist, and perfectly balanced.',
      price: 890,
      imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop',
      category: 'Earrings',
      material: '18K Polished Gold',
      weight: '3.8g',
      rating: 4.7
    },
    {
      id: '4',
      name: 'Gilded Harmony Chain Bracelet',
      description: 'Contemporary bold interlocking link chain in 18K Italian Yellow Gold. Sleek toggle clasp closure with polished structural finish.',
      price: 1250,
      imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop',
      category: 'Bracelets',
      material: '18K Italian Yellow Gold',
      weight: '8.2g',
      rating: 4.8
    },
    {
      id: '5',
      name: 'Elysian Emerald Halo Pendant',
      description: 'Breathtaking 18K Rose Gold pendant showcasing an oval-cut Colombian Emerald surrounded by a micro-paved halo of brilliant conflict-free diamonds.',
      price: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&auto=format&fit=crop',
      category: 'Necklaces',
      material: '18K Rose Gold, Colombian Emerald & Diamond',
      weight: '5.1g',
      rating: 4.9,
      isBestSeller: true
    },
    {
      id: '6',
      name: 'Dynasty Filigree Gold Bangle',
      description: 'A timeless masterpieces of jewelry craftsmanship. This heavy 22K Yellow Gold bangle is carved with intricate traditional floral patterns.',
      price: 2200,
      imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop',
      category: 'Bangles',
      material: '22K Solid Gold',
      weight: '14.0g',
      rating: 4.8
    },
    {
      id: '7',
      name: 'Eternity Diamond Band',
      description: 'Elegant, modern stackable ring in 18K Yellow Gold encrusted in a continuous channel of pavé-set round brilliant cut diamonds.',
      price: 1650,
      imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop',
      category: 'Rings',
      material: '18K Yellow Gold & Pavé Diamonds',
      weight: '3.1g',
      rating: 4.6
    },
    {
      id: '8',
      name: 'Regal Cascade Drop Earrings',
      description: 'Spectacular multi-tiered dangling earrings. Structured in 18K textured gold, ending with magnificent natural golden South Sea pearls.',
      price: 1980,
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop',
      category: 'Earrings',
      material: '18K Gold & Golden South Sea Pearls',
      weight: '7.6g',
      rating: 4.9
    }
  ],
  newsOffers: [
    {
      id: 'n1',
      type: 'offer',
      title: 'Akshaya Tritiya Exclusive Offer',
      content: 'Celebrate prosperity with us. Enjoy a flat 10% instant discount on any gold purchase above $2,000. Use Code: ROYALGOLD10 at checkout.',
      discountCode: 'ROYALGOLD10',
      discountType: 'percentage',
      discountValue: 10,
      expiryDate: '2026-08-31',
      date: '2026-07-04'
    },
    {
      id: 'n2',
      type: 'news',
      title: 'New Bridal Couture Collection Launched',
      content: 'We are thrilled to unveil our latest Heritage Bridal Collection. Handcrafted by master artisans with heirloom-quality 22K gold, rubies, and premium diamonds.',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop',
      date: '2026-07-01'
    }
  ],
  users: [
    {
      id: 'admin_user',
      email: 'admin@aurum.com',
      mobile: '9999999999',
      password: bcrypt.hashSync('admin123', 10), // Secure JWT-compliant bcrypt hash
      name: 'Aurum Admin',
      role: 'admin'
    },
    {
      id: 'customer_user',
      email: 'member@aurum.com',
      mobile: '8888888888',
      password: 'member123', // Server will automatically verify or hash this if not bcrypt
      name: 'Charlotte Rose',
      role: 'customer',
      savedAddress: {
        fullName: 'Charlotte Rose',
        phone: '+1 (555) 342-9988',
        streetAddress: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zipCode: '10011',
        country: 'United States'
      }
    }
  ],
  orders: []
};

// Database Initialization & Helper functions
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Auto-migrate admin user password to bcrypt in case it is plain text
    let changed = false;
    if (parsed.users) {
      parsed.users.forEach((u: any) => {
        if (u.id === 'admin_user' && u.password === 'admin123') {
          u.password = bcrypt.hashSync('admin123', 10);
          changed = true;
        }
      });
    }
    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB, using default:', err);
    return initialData;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Ensure database is initialized on server start
const db = readDb();

// JWT Middleware helper
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function authorizeAdmin(req: any, res: any, next: any) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}

// Password verification (supports plain text fallback for initial data)
async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  if (!hashed.startsWith('$2a$') && !hashed.startsWith('$2b$')) {
    return plain === hashed;
  }
  return await bcrypt.compare(plain, hashed);
}

// --- API ROUTES ---

// 1. Razorpay Webhook Endpoint
app.post('/api/webhooks/razorpay', express.json(), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_secret';
  
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('Razorpay Webhook signature matched');
    
    // Process successful payment
    if (req.body.event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      const currentDb = readDb();
      
      const customerEmail = payment.email || 'unknown@aurum.com';
      const orderExists = currentDb.orders.some((o: any) => o.razorpayPaymentId === payment.id);
      
      if (!orderExists) {
         // The order might have been created upfront, we can update it based on order_id
         const orderIdx = currentDb.orders.findIndex((o: any) => o.razorpayOrderId === payment.order_id);
         if (orderIdx > -1) {
            currentDb.orders[orderIdx].status = 'Processing';
            currentDb.orders[orderIdx].razorpayPaymentId = payment.id;
            writeDb(currentDb);
         }
      }
    }
  } else {
    console.warn('Webhook signature mismatch');
    return res.status(400).send('Webhook signature mismatch');
  }
  res.json({ status: 'ok' });
});

// Configure general JSON body parsing for remaining API routes
app.use(express.json());

// GET: Fetch all jewelry items
app.get('/api/items', (req, res) => {
  const currentDb = readDb();
  res.json(currentDb.items);
});

// POST: Add new item (Admin only)
app.post('/api/items', authenticateToken, authorizeAdmin, (req, res) => {
  const currentDb = readDb();
  const newItem = {
    id: String(Date.now()),
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price) || 0,
    originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop',
    category: req.body.category || 'Rings',
    material: req.body.material || '18K Yellow Gold',
    weight: req.body.weight || '5.0g',
    rating: 5.0,
    isBestSeller: req.body.isBestSeller || false,
    metalType: req.body.metalType || 'Yellow Gold',
    gemstone: req.body.gemstone || 'None',
    customizations: req.body.customizations || []
  };

  currentDb.items.push(newItem);
  writeDb(currentDb);
  res.status(201).json(newItem);
});

// Update Item
app.put('/api/items/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const currentDb = readDb();
  const itemIndex = currentDb.items.findIndex((item: any) => item.id === req.params.id);
  
  if (itemIndex > -1) {
    const updatedItem = {
      ...currentDb.items[itemIndex],
      name: req.body.name !== undefined ? req.body.name : currentDb.items[itemIndex].name,
      description: req.body.description !== undefined ? req.body.description : currentDb.items[itemIndex].description,
      price: req.body.price !== undefined ? Number(req.body.price) : currentDb.items[itemIndex].price,
      originalPrice: req.body.originalPrice !== undefined ? (req.body.originalPrice ? Number(req.body.originalPrice) : undefined) : currentDb.items[itemIndex].originalPrice,
      imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : currentDb.items[itemIndex].imageUrl,
      category: req.body.category !== undefined ? req.body.category : currentDb.items[itemIndex].category,
      material: req.body.material !== undefined ? req.body.material : currentDb.items[itemIndex].material,
      weight: req.body.weight !== undefined ? req.body.weight : currentDb.items[itemIndex].weight,
      isBestSeller: req.body.isBestSeller !== undefined ? req.body.isBestSeller : currentDb.items[itemIndex].isBestSeller,
      customizations: req.body.customizations !== undefined ? req.body.customizations : currentDb.items[itemIndex].customizations
    };

    currentDb.items[itemIndex] = updatedItem;
    writeDb(currentDb);
    res.json(updatedItem);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// Delete Item
app.delete('/api/items/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const currentDb = readDb();
  const itemIndex = currentDb.items.findIndex((item: any) => item.id === req.params.id);
  
  if (itemIndex > -1) {
    currentDb.items.splice(itemIndex, 1);
    writeDb(currentDb);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// GET: Fetch all news and offers
app.get('/api/news-offers', (req, res) => {
  const currentDb = readDb();
  res.json(currentDb.newsOffers);
});

// POST: Add new news or offer (Admin only)
app.post('/api/news-offers', authenticateToken, authorizeAdmin, (req, res) => {
  const currentDb = readDb();
  const newPost = {
    id: String(Date.now()),
    type: req.body.type || 'news',
    title: req.body.title,
    content: req.body.content,
    imageUrl: req.body.imageUrl || '',
    discountCode: req.body.discountCode || '',
    discountType: req.body.discountType || '',
    discountValue: req.body.discountValue ? Number(req.body.discountValue) : 0,
    expiryDate: req.body.expiryDate || '',
    date: new Date().toISOString().split('T')[0]
  };

  currentDb.newsOffers.unshift(newPost);
  writeDb(currentDb);
  res.status(201).json(newPost);
});

// PUT: Update news or offer (Admin only)
app.put('/api/news-offers/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = readDb();
  const idx = currentDb.newsOffers.findIndex((p: any) => p.id === id);
  if (idx > -1) {
    currentDb.newsOffers[idx] = {
      ...currentDb.newsOffers[idx],
      type: req.body.type || currentDb.newsOffers[idx].type,
      title: req.body.title || currentDb.newsOffers[idx].title,
      content: req.body.content || currentDb.newsOffers[idx].content,
      imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : currentDb.newsOffers[idx].imageUrl,
      discountCode: req.body.discountCode !== undefined ? req.body.discountCode : currentDb.newsOffers[idx].discountCode,
      discountType: req.body.discountType !== undefined ? req.body.discountType : currentDb.newsOffers[idx].discountType,
      discountValue: req.body.discountValue !== undefined ? Number(req.body.discountValue) : currentDb.newsOffers[idx].discountValue,
      expiryDate: req.body.expiryDate !== undefined ? req.body.expiryDate : currentDb.newsOffers[idx].expiryDate,
    };
    writeDb(currentDb);
    return res.json(currentDb.newsOffers[idx]);
  }
  res.status(404).json({ error: 'News or Offer not found' });
});

// DELETE: Remove news or offer (Admin only)
app.delete('/api/news-offers/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = readDb();
  const idx = currentDb.newsOffers.findIndex((p: any) => p.id === id);
  if (idx > -1) {
    currentDb.newsOffers.splice(idx, 1);
    writeDb(currentDb);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'News or Offer not found' });
});

// POST: Login (Both Customers and Admin)
app.post('/api/users/login', async (req, res) => {
  const { mobile, password } = req.body;
  const currentDb = readDb();

  // Support login by mobile (primary) or by email (fallback for older accounts)
  const user = currentDb.users.find((u: any) => 
    (u.mobile && u.mobile === mobile) || 
    (u.email && u.email.toLowerCase() === mobile.toLowerCase())
  );
  
  if (user) {
    const match = await verifyPassword(password, user.password);
    if (match) {
      // Sign JWT token
      const token = jwt.sign(
        { userId: user.id, mobile: user.mobile, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...safeUser } = user;
      return res.json({
        user: safeUser,
        token
      });
    }
  }

  res.status(401).json({ error: 'Invalid mobile number or password' });
});

// POST: Register customer
app.post('/api/users/register', async (req, res) => {
  const { name, mobile, email, password } = req.body;
  const currentDb = readDb();

  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  if (currentDb.users.find((u: any) => u.mobile === mobile)) {
    return res.status(400).json({ error: 'Mobile number already registered' });
  }

  if (email && currentDb.users.find((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Hash password securely with bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: String(Date.now()),
    name,
    mobile,
    email: email || undefined,
    password: hashedPassword,
    role: 'customer' as const,
    savedAddress: undefined
  };

  currentDb.users.push(newUser);
  writeDb(currentDb);

  // Sign JWT token
  const token = jwt.sign(
    { userId: newUser.id, mobile: newUser.mobile, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({
    user: safeUser,
    token
  });
});

// GET: Get Logged In User Profile (Authenticated)
app.get('/api/users/profile', authenticateToken, (req: any, res: any) => {
  const currentDb = readDb();
  const user = currentDb.users.find((u: any) => u.id === req.user.userId);
  if (user) {
    const { password, ...safeUser } = user;
    return res.json(safeUser);
  }
  res.status(404).json({ error: 'User profile not found' });
});

// POST: Update Customer Address (Authenticated)
app.post('/api/users/update-address', authenticateToken, (req: any, res: any) => {
  const { address } = req.body;
  const currentDb = readDb();

  const userIdx = currentDb.users.findIndex((u: any) => u.id === req.user.userId);
  if (userIdx > -1) {
    currentDb.users[userIdx].savedAddress = address;
    writeDb(currentDb);
    const { password, ...safeUser } = currentDb.users[userIdx];
    return res.json(safeUser);
  }

  res.status(404).json({ error: 'User not found' });
});

// POST: Update Customer Profile & Addresses (Authenticated)
app.post('/api/users/update-profile', authenticateToken, (req: any, res: any) => {
  const { name, email, mobile, savedAddress, savedAddresses } = req.body;
  const currentDb = readDb();

  const userIdx = currentDb.users.findIndex((u: any) => u.id === req.user.userId);
  if (userIdx > -1) {
    // If mobile is changing, make sure it is not taken
    if (mobile && mobile !== currentDb.users[userIdx].mobile) {
      const mobileTaken = currentDb.users.some((u: any) => u.mobile === mobile && u.id !== req.user.userId);
      if (mobileTaken) {
        return res.status(400).json({ error: 'Mobile number is already in use by another account.' });
      }
      currentDb.users[userIdx].mobile = mobile;
    }

    // If email is changing, make sure it is not taken
    if (email && email !== currentDb.users[userIdx].email) {
      const emailTaken = currentDb.users.some((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase() && u.id !== req.user.userId);
      if (emailTaken) {
        return res.status(400).json({ error: 'Email address is already in use by another client account.' });
      }
      currentDb.users[userIdx].email = email;
    }

    if (name) currentDb.users[userIdx].name = name;
    if (savedAddress !== undefined) currentDb.users[userIdx].savedAddress = savedAddress;
    if (savedAddresses !== undefined) currentDb.users[userIdx].savedAddresses = savedAddresses;

    writeDb(currentDb);
    const { password, ...safeUser } = currentDb.users[userIdx];

    // Re-sign JWT with new identity details
    const token = jwt.sign(
      { userId: safeUser.id, mobile: safeUser.mobile, email: safeUser.email, role: safeUser.role, name: safeUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({ user: safeUser, token });
  }

  res.status(404).json({ error: 'Client account not found.' });
});

// GET: Fetch customer's own orders (Authenticated)
app.get('/api/users/orders', authenticateToken, (req: any, res: any) => {
  const currentDb = readDb();
  const customerOrders = currentDb.orders.filter((o: any) => 
    (o.customerMobile && o.customerMobile === req.user.mobile) || 
    (o.customerEmail && o.customerEmail === req.user.email)
  );
  res.json(customerOrders);
});

// GET: Fetch all orders (Admin only)
app.get('/api/orders', authenticateToken, authorizeAdmin, (req, res) => {
  const currentDb = readDb();
  res.json(currentDb.orders);
});

// POST: Save direct order (Mock / Checkout success storage)
app.post('/api/orders', (req, res) => {
  const currentDb = readDb();
  const rawItems = req.body.items || [];
  const initialOrderStatus = req.body.status || 'Processing';
  
  const mappedItems = rawItems.map((it: any) => ({
    ...it,
    status: it.status || initialOrderStatus
  }));

  const newOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    customerEmail: req.body.customerEmail || null,
    customerMobile: req.body.customerMobile || null,
    customerName: req.body.customerName,
    items: mappedItems,
    totalAmount: req.body.totalAmount,
    address: req.body.address,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    status: initialOrderStatus,
    razorpayOrderId: req.body.razorpayOrderId || null,
    razorpayPaymentId: req.body.razorpayPaymentId || null,
    paymentMethod: req.body.paymentMethod || 'COD'
  };

  currentDb.orders.unshift(newOrder);
  writeDb(currentDb);
  res.status(201).json(newOrder);
});

// POST: Update Order Status (Admin only)
app.post('/api/orders/update-status', authenticateToken, authorizeAdmin, (req, res) => {
  const { orderId, status } = req.body;
  const currentDb = readDb();

  const orderIdx = currentDb.orders.findIndex((o: any) => o.id === orderId);
  if (orderIdx > -1) {
    const order = currentDb.orders[orderIdx];
    order.status = status;
    
    // Cascading update: Also update status for all items in the order to match
    order.items = (order.items || []).map((it: any) => ({
      ...it,
      status: status
    }));

    writeDb(currentDb);
    return res.json(order);
  }

  res.status(404).json({ error: 'Order not found' });
});

// POST: Update Order Item Status (Admin only)
app.post('/api/orders/update-item-status', authenticateToken, authorizeAdmin, (req, res) => {
  const { orderId, itemId, status } = req.body;
  const currentDb = readDb();

  const orderIdx = currentDb.orders.findIndex((o: any) => o.id === orderId);
  if (orderIdx > -1) {
    const order = currentDb.orders[orderIdx];
    const itemIdx = (order.items || []).findIndex((it: any) => it.itemId === itemId);
    
    if (itemIdx > -1) {
      order.items[itemIdx].status = status;

      // Optional cascade: If all items have the exact same status, let's sync the main order status too
      const uniqueStatuses = Array.from(new Set(order.items.map((it: any) => it.status || 'Processing')));
      if (uniqueStatuses.length === 1) {
        order.status = uniqueStatuses[0];
      } else {
        // If some items are shipped but some are processing, we can mark main order as 'Processing' or 'Shipped' depending on business rules
        if (order.items.some((it: any) => it.status === 'Shipped')) {
          order.status = 'Shipped';
        } else if (order.items.some((it: any) => it.status === 'Delivered')) {
          order.status = 'Processing';
        }
      }

      writeDb(currentDb);
      return res.json(order);
    }
    return res.status(404).json({ error: 'Item not found in this order' });
  }

  res.status(404).json({ error: 'Order not found' });
});

// GET: Config
app.get('/api/config', (req, res) => {
  res.json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || ''
  });
});

// POST: Create Razorpay Order
app.post('/api/create-razorpay-order', async (req, res) => {
  const { amount, receipt } = req.body;
  try {
    const razorpay = getRazorpay();
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise for INR)
      currency: "INR",
      receipt: receipt || `receipt_${Math.floor(Math.random() * 10000)}`
    };
    
    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      isMock: false
    });
  } catch (err: any) {
    console.warn('Razorpay order creation error:', err.message);
    res.status(500).json({ 
      error: 'Razorpay keys are missing or invalid. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Settings.'
    });
  }
});

// --- VITE MIDDLEWARE & STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aurum Jewelry Server listening on port ${PORT}`);
  });
}

startServer();

