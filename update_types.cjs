const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  '  discountCode?: string; // Optional if it\'s an offer\n  expiryDate?: string;',
  '  discountCode?: string; // Optional if it\'s an offer\n  discountType?: \'percentage\' | \'fixed\';\n  discountValue?: number;\n  expiryDate?: string;'
);
fs.writeFileSync('src/types.ts', content);
