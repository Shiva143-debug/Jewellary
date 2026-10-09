const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// In seed data:
content = content.replace(
  "discountCode: 'ROYALGOLD10',\n      expiryDate: '2026-08-31'",
  "discountCode: 'ROYALGOLD10',\n      discountType: 'percentage',\n      discountValue: 10,\n      expiryDate: '2026-08-31'"
);

// In app.post('/api/news-offers'
content = content.replace(
  "discountCode: req.body.discountCode || '',\n    expiryDate: req.body.expiryDate || '',",
  "discountCode: req.body.discountCode || '',\n    discountType: req.body.discountType || '',\n    discountValue: req.body.discountValue ? Number(req.body.discountValue) : 0,\n    expiryDate: req.body.expiryDate || '',"
);

// In app.put('/api/news-offers/:id'
content = content.replace(
  "discountCode: req.body.discountCode !== undefined ? req.body.discountCode : currentDb.newsOffers[idx].discountCode,\n      expiryDate: req.body.expiryDate !== undefined ? req.body.expiryDate : currentDb.newsOffers[idx].expiryDate,",
  "discountCode: req.body.discountCode !== undefined ? req.body.discountCode : currentDb.newsOffers[idx].discountCode,\n      discountType: req.body.discountType !== undefined ? req.body.discountType : currentDb.newsOffers[idx].discountType,\n      discountValue: req.body.discountValue !== undefined ? Number(req.body.discountValue) : currentDb.newsOffers[idx].discountValue,\n      expiryDate: req.body.expiryDate !== undefined ? req.body.expiryDate : currentDb.newsOffers[idx].expiryDate,"
);

fs.writeFileSync('server.ts', content);
