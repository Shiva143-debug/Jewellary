import re

with open('src/components/ProductCustomizeAndBuy.tsx', 'r') as f:
    content = f.read()

# 1. Remove states
content = re.sub(
    r"// Customization States\n.*?// Dynamic customizations",
    "// Dynamic customizations",
    content,
    flags=re.DOTALL
)

# 2. Remove size retrieval and default setting
content = re.sub(
    r"// Retrieve sizes.*?// Pricing math: Purity & Material uplift calculations",
    "// Pricing math",
    content,
    flags=re.DOTALL
)

# 3. Simplify pricing math
pricing_math = """const calculatePricing = () => {
    let basePrice = item.price;
    const subtotal = basePrice;
    const tax = subtotal * 0.05;
    const totalBeforeDiscount = subtotal + tax;
    const grandTotal = Math.max(10, totalBeforeDiscount - appliedDiscount);

    return {
      basePrice,
      subtotal,
      tax,
      discount: appliedDiscount,
      total: grandTotal
    };
  };

  const prices = calculatePricing();"""

content = re.sub(
    r"const calculatePricing = \(\) => \{.*?const prices = calculatePricing\(\);",
    pricing_math,
    content,
    flags=re.DOTALL
)

# 4. Simplify AddToCart
add_to_cart = """const handleAddToCartAndCheckout = () => {
    setIsAdding(true);

    const customOptionsStr = Object.entries(selectedCustomizations).map(([k, v]) => `${k}: ${v}`).join(', ');
    const nameSuffix = [customOptionsStr].filter(Boolean).join(', ');

    const customizedItem: JewelryItem = {
      ...item,
      id: `${item.id}-custom-${Date.now()}`,
      name: nameSuffix ? `${item.name} (${nameSuffix})` : item.name,
      price: Number(prices.total.toFixed(2)),
    };

    setTimeout(() => {
      onAddToCart(customizedItem, 'Standard', selectedCustomizations);
      setIsAdding(false);
    }, 450);
  };"""

content = re.sub(
    r"const handleAddToCartAndCheckout = \(\) => \{.*?\}, 450\);\n  \};",
    add_to_cart,
    content,
    flags=re.DOTALL
)

# 5. Remove UI blocks from HTML
# Custom Engraving Live Ribbon Visualizer
content = re.sub(
    r"\{/\* Custom Engraving Live Ribbon Visualizer \*/\}.*?</div>\n            \}\)\n\n          </div>",
    "          </div>",
    content,
    flags=re.DOTALL
)

# Toolkits
content = re.sub(
    r"\{/\* 1\. GOLD PURITY / METAL ALLOY CONTROLS \*/\}.*?\{/\* DYNAMIC CUSTOMIZATIONS \*/\}",
    "{/* DYNAMIC CUSTOMIZATIONS */}",
    content,
    flags=re.DOTALL
)

# Inner engraving card
content = re.sub(
    r"\{/\* 3\. COMPLIMENTARY INNER ENGRAVING CARD \*/\}.*?\{/\* WHITE GLOVE DELIVERY COVERAGE CARD \*/\}",
    "{/* WHITE GLOVE DELIVERY COVERAGE CARD */}",
    content,
    flags=re.DOTALL
)

# Pricing breakdown
pricing_breakdown = """{/* PRICING BREAKDOWN DETAILS */}
            <div className="glass p-5 rounded-2xl border border-white/10 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Base Price:</span>
                <span>₹{prices.basePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>VAT / Tax (5% Index):</span>
                <span>+₹{prices.tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              {prices.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
                  <span>Applied Royal Discount:</span>
                  <span>-₹{prices.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div className="h-px bg-gold/15 my-3" />
              
              <div className="flex justify-between text-base font-serif font-black text-gold items-end">
                <span>VALUED ORDER TOTAL:</span>
                <div className="flex flex-col items-end">
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-xs text-gray-500 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                  <span>₹{prices.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>"""

content = re.sub(
    r"\{/\* PRICING BREAKDOWN DETAILS \*/\}.*?\{/\* MAIN PURCHASE INITIATION CTA \(CART REDIRECT\) \*/\}",
    pricing_breakdown + "\n\n            {/* MAIN PURCHASE INITIATION CTA (CART REDIRECT) */}",
    content,
    flags=re.DOTALL
)


with open('src/components/ProductCustomizeAndBuy.tsx', 'w') as f:
    f.write(content)
