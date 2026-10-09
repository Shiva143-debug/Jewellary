const fs = require('fs');
let content = fs.readFileSync('src/components/ProductCustomizeAndBuy.tsx', 'utf8');

// Replace selectedColor occurrences
content = content.replace(/key=\{selectedColor\}/g, "key={'Yellow Gold'}");
content = content.replace(/selectedColor === 'Yellow Gold' \? 'bg-amber-400' :/g, "'bg-amber-400'");
content = content.replace(/selectedColor === 'Rose Gold' \? 'bg-orange-300' :/g, "");
content = content.replace(/selectedColor === 'White Gold' \? 'bg-slate-300' : 'bg-teal-200'/g, "");

content = content.replace(/selectedColor === 'Yellow Gold' \? 'brightness-105 contrast-105 hue-rotate-0' :/g, "'brightness-105 contrast-105 hue-rotate-0'");
content = content.replace(/selectedColor === 'Rose Gold' \? 'brightness-100 contrast-105 saturate-\[1\.2\] hue-rotate-\[320deg\]' :/g, "");
content = content.replace(/selectedColor === 'White Gold' \? 'brightness-110 contrast-100 saturate-\[0\.1\]' :/g, "");
content = content.replace(/'brightness-110 contrast-110 saturate-\[0\.05\] shadow-inner' \/\/ Platinum/g, "");

fs.writeFileSync('src/components/ProductCustomizeAndBuy.tsx', content);
