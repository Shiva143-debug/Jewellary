const fs = require('fs');
let content = fs.readFileSync('src/components/ShoppingBagPage.tsx', 'utf8');

const oldLogic = `  const handleApplyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === 'ROYALGOLD10' && subtotal >= 2000) {
      setDiscountMultiplier(0.9);
      setCouponSuccess('ROYALGOLD10 Applied (10% discount)');
    } else {
      setCouponSuccess('');
      setDiscountMultiplier(1);
    }
  };`;

const newLogic = `  const handleApplyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    
    // Check dynamic offers first
    const activeOffer = offers.find(o => 
      o.type === 'offer' && 
      o.discountCode && 
      o.discountCode.toUpperCase() === formatted
    );

    if (activeOffer) {
      if (activeOffer.expiryDate && new Date(activeOffer.expiryDate) < new Date()) {
        setCouponSuccess('');
        setDiscountMultiplier(1);
        setCheckoutError('This offer code has expired.');
        return;
      }
      
      if (activeOffer.discountType === 'percentage') {
        const val = activeOffer.discountValue || 0;
        setDiscountMultiplier(1 - (val / 100));
        setCouponSuccess(\`\${formatted} Applied (\${val}% discount)\`);
      } else if (activeOffer.discountType === 'fixed') {
        const val = activeOffer.discountValue || 0;
        // Approximation for multiplier based on current subtotal to fit existing logic
        // It's better to calculate discount Amount directly, but ShoppingBagPage uses discountMultiplier
        // We will adapt the multiplier:
        const newMultiplier = Math.max(0, 1 - (val / subtotal));
        setDiscountMultiplier(newMultiplier);
        setCouponSuccess(\`\${formatted} Applied (₹\${val} discount)\`);
      }
      setCheckoutError('');
      return;
    }

    // Fallback logic
    if (formatted === 'ROYALGOLD10' && subtotal >= 2000) {
      setDiscountMultiplier(0.9);
      setCouponSuccess('ROYALGOLD10 Applied (10% discount)');
      setCheckoutError('');
    } else {
      setCouponSuccess('');
      setDiscountMultiplier(1);
      setCheckoutError('Invalid coupon code. Try ROYALGOLD10.');
    }
  };`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/ShoppingBagPage.tsx', content);
