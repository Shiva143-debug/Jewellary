import re

with open('src/components/ProductCustomizeAndBuy.tsx', 'r') as f:
    text = f.read()

# Very basic tag counter
open_divs = len(re.findall(r'<div\b[^>]*>', text))
close_divs = len(re.findall(r'</div>', text))

print(f"Open divs: {open_divs}, Close divs: {close_divs}")

