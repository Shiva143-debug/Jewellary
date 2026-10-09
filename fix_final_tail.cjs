const fs = require('fs');
let content = fs.readFileSync('src/components/ProductCustomizeAndBuy.tsx', 'utf8');

// Replace the tail with exactly 4 closing divs
content = content.replace(/(\s*<\/div>\n)+  \);\n\}/, '\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}');

fs.writeFileSync('src/components/ProductCustomizeAndBuy.tsx', content);
