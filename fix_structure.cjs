const fs = require('fs');
let content = fs.readFileSync('src/components/ProductCustomizeAndBuy.tsx', 'utf8');

content = content.replace(
  '            {/* ================= RIGHT FLOATING COLUMN: CUSTOMIZER TOOLKIT ================= */}',
  '              </div>\n            </div>\n            {/* ================= RIGHT FLOATING COLUMN: CUSTOMIZER TOOLKIT ================= */}'
);

fs.writeFileSync('src/components/ProductCustomizeAndBuy.tsx', content);
