const fs = require('fs');
let content = fs.readFileSync('src/components/ProductCustomizeAndBuy.tsx', 'utf8');

const oldLogic = `  // Coupon application handler
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'ROYAL10' || code === 'AURUM10') {
      const discountVal = prices.subtotal * 0.10; // 10% discount
      setAppliedDiscount(Number(discountVal.toFixed(2)));
      setCouponMessage(\`👑 Code "\${code}" applied successfully! 10% off custom orders saved.\`);
      setIsCouponError(false);
    } else if (code === 'LEGACY40000') {
      setAppliedDiscount(40000);
      setCouponMessage(\`👑 Code "\${code}" applied successfully! ₹40,000 royal credit granted.\`);
      setIsCouponError(false);
    } else {
      setCouponMessage('Invalid coupon code. Try using "ROYAL10" or "LEGACY40000".');
      setIsCouponError(true);
      setAppliedDiscount(0);
    }
  };`;

const newLogic = `  // Coupon application handler
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Check dynamic offers first
    const activeOffer = offers.find(o => 
      o.type === 'offer' && 
      o.discountCode && 
      o.discountCode.toUpperCase() === code
    );

    if (activeOffer) {
      if (activeOffer.expiryDate && new Date(activeOffer.expiryDate) < new Date()) {
        setCouponMessage('This offer code has expired.');
        setIsCouponError(true);
        setAppliedDiscount(0);
        return;
      }
      
      let discountVal = 0;
      if (activeOffer.discountType === 'percentage') {
        discountVal = prices.subtotal * ((activeOffer.discountValue || 0) / 100);
      } else if (activeOffer.discountType === 'fixed') {
        discountVal = activeOffer.discountValue || 0;
      }

      setAppliedDiscount(Number(discountVal.toFixed(2)));
      setCouponMessage(\`👑 Code "\${code}" applied successfully! \${activeOffer.discountType === 'percentage' ? activeOffer.discountValue + '%' : '₹' + activeOffer.discountValue} royal credit granted.\`);
      setIsCouponError(false);
      return;
    }

    // Fallback hardcoded offers
    if (code === 'ROYAL10' || code === 'AURUM10') {
      const discountVal = prices.subtotal * 0.10; // 10% discount
      setAppliedDiscount(Number(discountVal.toFixed(2)));
      setCouponMessage(\`👑 Code "\${code}" applied successfully! 10% royal credit granted.\`);
      setIsCouponError(false);
    } else if (code === 'LEGACY40000') {
      setAppliedDiscount(40000);
      setCouponMessage(\`👑 Code "\${code}" applied successfully! ₹40,000 royal credit granted.\`);
      setIsCouponError(false);
    } else {
      setCouponMessage('Invalid coupon code. Please check your active offers or try "ROYAL10".');
      setIsCouponError(true);
      setAppliedDiscount(0);
    }
  };`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/ProductCustomizeAndBuy.tsx', content);
