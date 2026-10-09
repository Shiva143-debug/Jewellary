import re

# Fix AdminPanel.tsx imports
with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r"import \{([^}]+)\} from 'lucide-react';",
    lambda m: f"import {{{m.group(1).rstrip(',')}, Edit2, Trash2}} from 'lucide-react';" if 'Edit2' not in m.group(1) else f"import {{{m.group(1)}}} from 'lucide-react';",
    content
)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)

# Fix ProductCustomizeAndBuy.tsx
with open('src/components/ProductCustomizeAndBuy.tsx', 'r') as f:
    content = f.read()

# Remove the visual logic that uses selectedColor
content = re.sub(
    r"key=\{selectedColor\}.*?bg-teal-200'\} />",
    r"/>",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"className=\{\`w-full h-full object-cover.*?\}\`\}",
    r"""className="w-full h-full object-cover brightness-105 contrast-105 hue-rotate-0" """,
    content,
    flags=re.DOTALL
)

# Remove the engraving string that uses engravingText
content = re.sub(
    r"\{engravingText\.trim\(\) && \(.*?\}\)",
    r"",
    content,
    flags=re.DOTALL
)


with open('src/components/ProductCustomizeAndBuy.tsx', 'w') as f:
    f.write(content)
