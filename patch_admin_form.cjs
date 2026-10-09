const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const searchBlock = `                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Coupon Code (Uppercase)</label>
                      <input
                        type="text"
                        placeholder="e.g. DIAMOND15"
                        value={postCode}
                        onChange={(e) => setPostCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white tracking-wider font-mono transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Expiry Date</label>
                      <input
                        type="date"
                        value={postExpiry}
                        onChange={(e) => setPostExpiry(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-gold-light transition-colors font-sans cursor-pointer"
                      />
                    </div>
                  </div>`;

const replaceBlock = `                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Coupon Code (Uppercase)</label>
                      <input
                        type="text"
                        placeholder="e.g. DIAMOND15"
                        value={postCode}
                        onChange={(e) => setPostCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white tracking-wider font-mono transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Discount Type</label>
                      <select
                        value={postDiscountType}
                        onChange={(e) => setPostDiscountType(e.target.value as 'percentage' | 'fixed')}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white tracking-wider font-mono transition-colors appearance-none"
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
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-white tracking-wider font-mono transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold tracking-wider text-gray-400 block mb-1.5 uppercase font-sans">Expiry Date</label>
                      <input
                        type="date"
                        value={postExpiry}
                        onChange={(e) => setPostExpiry(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold focus:outline-none text-sm rounded-xl p-3.5 text-gold-light transition-colors font-sans cursor-pointer"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>`;
content = content.replace(searchBlock, replaceBlock);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
