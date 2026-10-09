const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "              onSelectItem={handleSelectItem}",
  "              onSelectItem={handleSelectItem}\n              offers={newsOffers}"
);

fs.writeFileSync('src/App.tsx', content);
