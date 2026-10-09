const fs = require('fs');
let content = fs.readFileSync('src/components/ShoppingBagPage.tsx', 'utf8');

// Import
content = content.replace(
  "import { CartItem, User as UserType, SavedAddress, Order } from '../types';",
  "import { CartItem, User as UserType, SavedAddress, Order, NewsOffer } from '../types';"
);

// Props
content = content.replace(
  "  onSelectItem?: (item: any) => void;\n}",
  "  onSelectItem?: (item: any) => void;\n  offers?: NewsOffer[];\n}"
);

// Component signature
content = content.replace(
  "  onSelectItem\n}: ShoppingBagPageProps) {",
  "  onSelectItem,\n  offers = []\n}: ShoppingBagPageProps) {"
);

fs.writeFileSync('src/components/ShoppingBagPage.tsx', content);
