const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "            onAddToCart={handleAddToCart}",
  "            onAddToCart={handleAddToCart}\n            offers={newsOffers}"
);

fs.writeFileSync('src/App.tsx', content);
