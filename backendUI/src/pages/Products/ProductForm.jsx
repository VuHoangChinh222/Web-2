import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Layers, Image as ImageIcon, Box, Info } from 'lucide-react';
import productImageService from '../../services/productImageService';
import productVariantService from '../../services/productVariantService';

const ProductForm = ({
  productData,
  categoriesProduct,
  resolveImageUrl,
  uploadImage,
  onSave,
  onCancel,
  isEditMode
}) => {
  const [activeTab, setActiveTab] = useState('general'); // general, variants, images
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [form, setForm] = useState({
    id: '', name: '', slug: '', shortDescription: '', description: '',
    categoryId: categoriesProduct.length > 0 ? categoriesProduct[0].id : '',
    status: 'Active', price: '', salePrice: '', stock: '0', image: ''
  });

  const [isVariableProduct, setIsVariableProduct] = useState(false);

  // Variants State (Local)
  const [variants, setVariants] = useState([]);
  const [bulkSizes, setBulkSizes] = useState('');
  const [bulkColors, setBulkColors] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('10');

  // Images State (Local)
  const [additionalImages, setAdditionalImages] = useState([]);

  useEffect(() => {
    if (isEditMode && productData) {
      setForm({
        id: productData.id,
        name: productData.name || '',
        slug: productData.slug || '',
        shortDescription: productData.shortDescription || '',
        description: productData.description || '',
        categoryId: productData.categoryId || (categoriesProduct[0]?.id || ''),
        status: productData.status,
        price: productData.price ? String(productData.price) : '',
        salePrice: productData.salePrice ? String(productData.salePrice) : '',
        stock: productData.stock ? String(productData.stock) : '0',
        image: productData.image || ''
      });

      // Load variants
      productVariantService.getByProductId(productData.id, 0, 100)
        .then(res => {
          const vList = res.content || res.Content || res || [];
          setVariants(vList);
          setIsVariableProduct(vList.length > 0);
        }).catch(err => console.log(err));

      // Load images
      productImageService.getByProductId(productData.id)
        .then(res => {
          setAdditionalImages(res || []);
        }).catch(err => console.log(err));
    } else {
      // Add mode default category
      if (categoriesProduct.length > 0) {
        setForm(prev => ({ ...prev, categoryId: categoriesProduct[0].id }));
      }
    }
  }, [isEditMode, productData, categoriesProduct]);

  // --- Handlers ---
  const handlePrimaryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setForm(prev => ({ ...prev, image: url }));
      } catch (err) {
        alert("Error uploading cover image.");
      }
    }
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (additionalImages.length + files.length > 50) {
      alert("Max 50 images allowed.");
      return;
    }
    if (files.length > 0) {
      try {
        const urls = await Promise.all(files.map(f => uploadImage(f)));
        const newImages = urls.map(url => ({ id: null, imageUrl: url, isNew: true, color: null }));
        setAdditionalImages(prev => [...prev, ...newImages]);
      } catch (err) {
        alert("Error uploading gallery images.");
      }
    }
  };

  const handleGenerateVariants = () => {
    const sizes = bulkSizes.split(',').map(s => s.trim()).filter(Boolean);
    const colors = bulkColors.split(',').map(c => c.trim()).filter(Boolean);

    if (sizes.length === 0 && colors.length === 0) {
      alert("Please enter at least one size or color.");
      return;
    }

    // If only sizes provided
    const safeSizes = sizes.length > 0 ? sizes : ['Default'];
    // If only colors provided
    const safeColors = colors.length > 0 ? colors : ['Default'];

    const newVariants = [];
    let tempIdCounter = Date.now(); // local temp id

    safeSizes.forEach(size => {
      safeColors.forEach(color => {
        // Avoid duplicates if already exists
        const exists = variants.some(v => v.size === size && v.color === color);
        if (!exists) {
          newVariants.push({
            id: `temp_${tempIdCounter++}`,
            isNew: true,
            size: size === 'Default' ? '' : size,
            color: color === 'Default' ? '' : color,
            price: bulkPrice ? parseFloat(bulkPrice) : null,
            salePrice: null,
            stockQuantity: parseInt(bulkStock) || 0,
            sku: '',
            status: 1
          });
        }
      });
    });

    if (newVariants.length > 0) {
      setVariants(prev => [...prev, ...newVariants]);
      setBulkSizes('');
      setBulkColors('');
    } else {
      alert("Variants already exist or invalid input.");
    }
  };

  const removeVariant = (id) => {
    setVariants(prev => prev.filter(v => v.id !== id));
    // If we are in edit mode, we might need to track deleted variants. 
    // For simplicity, we just filter it out. The backend handles sync when saving.
  };

  const updateVariant = (id, field, value) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const getColorGroups = () => {
    const colors = new Set();
    variants.forEach(v => {
      if (v.color && v.color.trim() !== '') {
        colors.add(v.color.trim());
      }
    });
    return Array.from(colors);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.image) {
      alert("Product Name and Primary Image are required!");
      return;
    }

    if (!form.categoryId) {
      alert("Please select a Category!");
      return;
    }

    if (isVariableProduct && variants.length === 0) {
      alert("You selected Variable Product but haven't added any variants.");
      setActiveTab('variants');
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        general: form,
        isVariable: isVariableProduct,
        variants: isVariableProduct ? variants : [],
        images: additionalImages
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1224] rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </h2>
            <p className="text-xs text-slate-400">Fill in the details below to publish.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-56 border-r border-white/5 bg-white/[0.01] p-4 space-y-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'general' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
          >
            <Box size={16} /> General Info
          </button>

          <button
            onClick={() => setActiveTab('variants')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'variants' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
          >
            <Layers size={16} /> Variants & Pricing
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'images' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
          >
            <ImageIcon size={16} /> Image Gallery
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto glass-scrollbar bg-[#0F1224]/50">

          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="max-w-3xl space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm glass-input" placeholder="Enter product name..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input bg-[#0F1224] text-white"
                  >
                    {categoriesProduct.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#0F1224] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input bg-[#0F1224] text-white"
                  >
                    <option value="Active" className="bg-[#0F1224] text-white">Active (Published)</option>
                    <option value="OutOfStock" className="bg-[#0F1224] text-white">Out of Stock</option>
                    <option value="Draft" className="bg-[#0F1224] text-white">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Thumbnail (Cover) *</label>
                <div className="flex items-center gap-4 p-4 border border-dashed border-white/20 rounded-xl bg-white/[0.02]">
                  {form.image ? (
                    <img src={resolveImageUrl(form.image)} alt="Cover" className="w-20 h-20 rounded-lg object-cover border border-white/10" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <ImageIcon size={24} className="text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handlePrimaryImageUpload} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 cursor-pointer" />
                    <p className="text-[10px] text-slate-500 mt-2">Recommended: Square image (800x800px), Max 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Short Description</label>
                <textarea rows="2" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm glass-input" placeholder="Brief summary of the product..."></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Description</label>
                <textarea rows="6" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm glass-input" placeholder="Detailed description (HTML supported)..."></textarea>
              </div>
            </div>
          )}

          {/* TAB: VARIANTS & PRICING */}
          {activeTab === 'variants' && (
            <div className="max-w-4xl space-y-6 animate-in slide-in-from-right-4 duration-300">

              <div className="p-4 border border-purple-500/30 bg-purple-500/10 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="hasVariants"
                  checked={isVariableProduct}
                  onChange={e => setIsVariableProduct(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-purple-500/50 text-purple-600 bg-transparent cursor-pointer"
                />
                <div>
                  <label htmlFor="hasVariants" className="text-sm font-bold text-purple-100 cursor-pointer">This product has multiple options (Variants)</label>
                  <p className="text-xs text-purple-300/70 mt-1">Check this if the product comes in different sizes, colors, or materials.</p>
                </div>
              </div>

              {!isVariableProduct ? (
                <div className="grid grid-cols-2 gap-6 p-6 border border-white/5 rounded-xl bg-white/[0.01]">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base Price (VND) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm glass-input" placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sale Price (VND)</label>
                    <input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm glass-input" placeholder="Optional" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock Quantity *</label>
                    <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm glass-input" placeholder="100" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Matrix Generator */}
                  <div className="p-5 border border-indigo-500/20 bg-indigo-500/5 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                      <Layers size={18} /> Auto-Generate Variant Matrix
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Sizes (Comma separated)</label>
                        <input type="text" value={bulkSizes} onChange={e => setBulkSizes(e.target.value)} placeholder="e.g. 39, 40, 41" className="w-full px-3 py-2 rounded-lg text-sm glass-input" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Colors (Comma separated)</label>
                        <input type="text" value={bulkColors} onChange={e => setBulkColors(e.target.value)} placeholder="e.g. Red, Blue, Black" className="w-full px-3 py-2 rounded-lg text-sm glass-input" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Default Base Price</label>
                        <input type="number" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} placeholder="Apply to all" className="w-full px-3 py-2 rounded-lg text-sm glass-input" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Default Stock</label>
                        <input type="number" value={bulkStock} onChange={e => setBulkStock(e.target.value)} placeholder="10" className="w-full px-3 py-2 rounded-lg text-sm glass-input" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={handleGenerateVariants} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors">
                        Generate Combinations
                      </button>
                    </div>
                  </div>

                  {/* Variants Table */}
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="p-3 text-slate-400 font-semibold">Size</th>
                          <th className="p-3 text-slate-400 font-semibold">Color</th>
                          <th className="p-3 text-slate-400 font-semibold">Base Price</th>
                          <th className="p-3 text-slate-400 font-semibold">Stock</th>
                          <th className="p-3 text-slate-400 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {variants.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-500 italic">No variants created yet. Use the generator above.</td>
                          </tr>
                        ) : (
                          variants.map((v, idx) => (
                            <tr key={v.id || idx} className="hover:bg-white/[0.02]">
                              <td className="p-2">
                                <input type="text" value={v.size || ''} onChange={e => updateVariant(v.id, 'size', e.target.value)} className="w-20 px-2 py-1 rounded glass-input text-xs" />
                              </td>
                              <td className="p-2">
                                <input type="text" value={v.color || ''} onChange={e => updateVariant(v.id, 'color', e.target.value)} className="w-24 px-2 py-1 rounded glass-input text-xs" />
                              </td>
                              <td className="p-2">
                                <input type="number" value={v.price || ''} onChange={e => updateVariant(v.id, 'price', e.target.value)} className="w-28 px-2 py-1 rounded glass-input text-xs" placeholder="Default" />
                              </td>
                              <td className="p-2">
                                <input type="number" value={v.stockQuantity} onChange={e => updateVariant(v.id, 'stockQuantity', e.target.value)} className="w-20 px-2 py-1 rounded glass-input text-xs" />
                              </td>
                              <td className="p-2 text-right">
                                <button onClick={() => removeVariant(v.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded transition-colors"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB: IMAGES */}
          {activeTab === 'images' && (
            <div className="max-w-4xl space-y-6 animate-in slide-in-from-right-4 duration-300">

              <div className="p-6 border border-dashed border-white/20 rounded-xl bg-white/[0.02] flex flex-col items-center justify-center text-center">
                <ImageIcon size={32} className="text-slate-500 mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">Upload Gallery Images</h3>
                <p className="text-xs text-slate-400 mb-4">You can upload up to 50 images. Support PNG, JPG, WEBP.</p>
                <input
                  type="file" multiple accept="image/*"
                  onChange={handleMultipleImageUpload}
                  className="text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer"
                />
              </div>

              {/* Grouping by Color */}
              {isVariableProduct && getColorGroups().length > 0 && (
                <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl flex items-start gap-3">
                  <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-100">Color-Aware Gallery Link</h4>
                    <p className="text-xs text-blue-300/70 mt-1">Assign uploaded images to specific colors to allow dynamic swapping on the storefront when customers select a color.</p>
                  </div>
                </div>
              )}

              {additionalImages.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Images ({additionalImages.length})</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {additionalImages.map((img, idx) => (
                      <div key={img.id || idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black">
                        <img src={resolveImageUrl(img.imageUrl)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

                        <button
                          onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1.5 bg-black/50 text-rose-400 rounded-full hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>

                        {isVariableProduct && getColorGroups().length > 0 && (
                          <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                            <select
                              value={img.color || ''}
                              onChange={e => {
                                const newColor = e.target.value;
                                setAdditionalImages(prev => prev.map((im, i) => i === idx ? { ...im, color: newColor } : im));
                              }}
                              className="w-full text-[9px] bg-black/50 text-white rounded border border-white/20 p-0.5"
                            >
                              <option value="" className="bg-[#0F1224] text-white">-- Link Color --</option>
                              {getColorGroups().map(c => (
                                <option key={c} value={c} className="bg-[#0F1224] text-white">{c}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default ProductForm;
