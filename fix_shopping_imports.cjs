const fs = require('fs');
let content = fs.readFileSync('src/components/ShoppingBagPage.tsx', 'utf8');

content = content.replace(
  "import { CartItem, SavedAddress, User as UserType, Order } from '../types';",
  "import { CartItem, SavedAddress, User as UserType, Order, NewsOffer } from '../types';"
);

fs.writeFileSync('src/components/ShoppingBagPage.tsx', content);
