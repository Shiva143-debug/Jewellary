const fs = require('fs');
let content = fs.readFileSync('src/components/ProductCustomizeAndBuy.tsx', 'utf8');

// Import NewsOffer
content = content.replace(
  "import { JewelryItem, User } from '../types';",
  "import { JewelryItem, User, NewsOffer } from '../types';"
);

// Add to props
content = content.replace(
  "  onAddToCart: (item: JewelryItem, selectedSize: string, selectedCustomizations?: Record<string, string>) => void;\n}",
  "  onAddToCart: (item: JewelryItem, selectedSize: string, selectedCustomizations?: Record<string, string>) => void;\n  offers?: NewsOffer[];\n}"
);

content = content.replace(
  "  onAddToCart\n}: ProductCustomizeAndBuyProps) {",
  "  onAddToCart,\n  offers = []\n}: ProductCustomizeAndBuyProps) {"
);

fs.writeFileSync('src/components/ProductCustomizeAndBuy.tsx', content);
