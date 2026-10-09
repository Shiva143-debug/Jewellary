const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add states
content = content.replace(
  "const [postCode, setPostCode] = useState('');\n  const [postExpiry, setPostExpiry] = useState('');",
  "const [postCode, setPostCode] = useState('');\n  const [postDiscountType, setPostDiscountType] = useState<'percentage' | 'fixed'>('percentage');\n  const [postDiscountValue, setPostDiscountValue] = useState('');\n  const [postExpiry, setPostExpiry] = useState('');"
);

// Edit post populate
content = content.replace(
  "setPostCode(post.discountCode || '');\n    setPostExpiry(post.expiryDate || '');",
  "setPostCode(post.discountCode || '');\n    setPostDiscountType(post.discountType || 'percentage');\n    setPostDiscountValue(post.discountValue ? String(post.discountValue) : '');\n    setPostExpiry(post.expiryDate || '');"
);

// Form submission
content = content.replace(
  "discountCode: postType === 'offer' ? postCode : undefined,\n        expiryDate: postType === 'offer' ? postExpiry : undefined,",
  "discountCode: postType === 'offer' ? postCode : undefined,\n        discountType: postType === 'offer' ? postDiscountType : undefined,\n        discountValue: postType === 'offer' ? Number(postDiscountValue) : undefined,\n        expiryDate: postType === 'offer' ? postExpiry : undefined,"
);

// Reset form
content = content.replace(
  "setPostCode('');\n      setPostExpiry('');",
  "setPostCode('');\n      setPostDiscountType('percentage');\n      setPostDiscountValue('');\n      setPostExpiry('');"
);

// Add fields to form UI
const searchString = `                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Promo Code</label>
                      <input
                        type="text"
                        placeholder="e.g. ROYAL20"
                        value={postCode}
                        onChange={(e) => setPostCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2.5 text-white transition-colors font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Expiry Date</label>
                      <input
                        type="date"
                        value={postExpiry}
                        onChange={(e) => setPostExpiry(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2.5 text-white transition-colors font-sans"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>`;

const replaceString = `                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Promo Code</label>
                      <input
                        type="text"
                        placeholder="e.g. ROYAL20"
                        value={postCode}
                        onChange={(e) => setPostCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2.5 text-white transition-colors font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Discount Type</label>
                      <select
                        value={postDiscountType}
                        onChange={(e) => setPostDiscountType(e.target.value as 'percentage' | 'fixed')}
                        className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2.5 text-white transition-colors font-sans appearance-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Discount Value</label>
                      <input
                        type="number"
                        placeholder={postDiscountType === 'percentage' ? "e.g. 10" : "e.g. 1000"}
                        value={postDiscountValue}
                        onChange={(e) => setPostDiscountValue(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2.5 text-white transition-colors font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Expiry Date</label>
                      <input
                        type="date"
                        value={postExpiry}
                        onChange={(e) => setPostExpiry(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2.5 text-white transition-colors font-sans"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>`;
content = content.replace(searchString, replaceString);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
