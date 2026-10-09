import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

# Change itemCustomizations state to string[]
content = re.sub(
    r"const \[itemCustomizations, setItemCustomizations\] = useState<\{name: string, options: string\}\[\]>\(\[\]\);",
    "const [itemCustomizations, setItemCustomizations] = useState<{name: string, options: string[]}[]>([]);",
    content
)

# Change setItemCustomizations on edit
content = content.replace(
    "setItemCustomizations(item.customizations ? item.customizations.map(c => ({ name: c.name, options: c.options.join(', ') })) : []);",
    "setItemCustomizations(item.customizations ? item.customizations.map(c => ({ name: c.name, options: [...c.options] })) : []);"
)

# Change payload in handleAddItemSubmit
new_payload = """customizations: itemCustomizations.filter(c => c.name && c.options.some(o => o.trim())).map(c => ({
            name: c.name,
            options: c.options.map(o => o.trim()).filter(o => o)
          }))"""
content = re.sub(
    r"customizations: itemCustomizations\.filter\(c => c\.name && c\.options\)\.map\(c => \(\{\n\s*name: c\.name,\n\s*options: c\.options\.split\(\',\'\)\.map\(o => o\.trim\(\)\)\.filter\(o => o\)\n\s*\}\)\)",
    new_payload,
    content,
    flags=re.MULTILINE
)

# Change UI block
old_ui_block = r"""                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-\[11px\] font-bold tracking-wider text-gray-400 uppercase font-sans">Customizations</label>
                    <button
                      type="button"
                      onClick=\{.*?setItemCustomizations.*?\}
                      className="text-xs text-gold hover:text-gold-light transition-colors font-sans flex items-center gap-1"
                    >
                      <Plus size=\{14\} /> Add Option
                    </button>
                  </div>
                  \{itemCustomizations\.map\(\(cust, index\) => \(
                    <div key=\{index\} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="e\.g\. Size"
                        value=\{cust\.name\}
                        onChange=\{\(e\) => \{
                          const newCust = \[\.\.\.itemCustomizations\];
                          newCust\[index\]\.name = e\.target\.value;
                          setItemCustomizations\(newCust\);
                        \}\}
                        className="w-1/3 bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-xl p-3 text-white transition-colors font-sans"
                      />
                      <input
                        type="text"
                        placeholder="Options \(comma separated, e\.g\. 7, 8, 9\)"
                        value=\{cust\.options\}
                        onChange=\{\(e\) => \{
                          const newCust = \[\.\.\.itemCustomizations\];
                          newCust\[index\]\.options = e\.target\.value;
                          setItemCustomizations\(newCust\);
                        \}\}
                        className="flex-1 bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-xl p-3 text-white transition-colors font-sans"
                      />
                      <button
                        type="button"
                        onClick=\{\(\) => \{
                          const newCust = \[\.\.\.itemCustomizations\];
                          newCust\.splice\(index, 1\);
                          setItemCustomizations\(newCust\);
                        \}\}
                        className="text-gray-500 hover:text-rose-400 p-3"
                      >
                        <X size=\{16\} />
                      </button>
                    </div>
                  \)\)\}
                  \{itemCustomizations\.length === 0 && \(
                    <p className="text-xs text-gray-500 italic font-sans mb-1">No customizations added\.</p>
                  \)\}
                </div>"""

new_ui_block = """                <div className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[11px] font-bold tracking-wider text-gray-400 uppercase font-sans">Customizations</label>
                    <button
                      type="button"
                      onClick={() => setItemCustomizations([...itemCustomizations, { name: '', options: [''] }])}
                      className="text-xs text-gold hover:text-gold-light transition-colors font-sans flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} /> Add Customization
                    </button>
                  </div>
                  <div className="space-y-4">
                    {itemCustomizations.map((cust, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Customization Name (e.g. Size, Engraving Style)"
                            value={cust.name}
                            onChange={(e) => {
                              const newCust = [...itemCustomizations];
                              newCust[index].name = e.target.value;
                              setItemCustomizations(newCust);
                            }}
                            className="flex-1 bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2.5 text-white transition-colors font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newCust = [...itemCustomizations];
                              newCust.splice(index, 1);
                              setItemCustomizations(newCust);
                            }}
                            className="text-gray-500 hover:text-rose-400 p-2.5 bg-white/5 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {cust.name.trim() !== '' && (
                          <div className="pl-2 border-l border-white/10 space-y-2 mt-2">
                            <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase font-sans block mb-1">Options for {cust.name}</label>
                            {cust.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Option value (e.g. 7, Yellow Gold)"
                                  value={opt}
                                  onChange={(e) => {
                                    const newCust = [...itemCustomizations];
                                    newCust[index].options[optIndex] = e.target.value;
                                    setItemCustomizations(newCust);
                                  }}
                                  className="flex-1 bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-sm rounded-lg p-2 text-white transition-colors font-sans"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newCust = [...itemCustomizations];
                                    newCust[index].options.splice(optIndex, 1);
                                    setItemCustomizations(newCust);
                                  }}
                                  className="text-gray-500 hover:text-rose-400 p-2"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newCust = [...itemCustomizations];
                                newCust[index].options.push('');
                                setItemCustomizations(newCust);
                              }}
                              className="text-[11px] text-gold/70 hover:text-gold transition-colors font-sans flex items-center gap-1 mt-2 cursor-pointer"
                            >
                              <Plus size={12} /> Add another option
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {itemCustomizations.length === 0 && (
                    <p className="text-xs text-gray-500 italic font-sans mt-2">No customizations added.</p>
                  )}
                </div>"""

content = re.sub(old_ui_block, new_ui_block, content, flags=re.DOTALL)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)

