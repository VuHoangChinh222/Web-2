import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';
import productImageService from '../../services/productImageService';

const ProductFormModal = ({
  isOpen,
  onClose,
  modalType,
  productData,
  categoriesProduct,
  resolveImageUrl,
  uploadImage,
  onSubmit
}) => {
  const [form, setForm] = useState({
    id: '',
    name: '',
    price: '',
    salePrice: '',
    stock: '0',
    categoryId: '',
    image: '',
    status: 'Active',
    description: ''
  });

  const [additionalImages, setAdditionalImages] = useState([]);
  const [isVariableProduct, setIsVariableProduct] = useState(false);
  const [activePickerColor, setActivePickerColor] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (modalType === 'add') {
        setForm({
          id: '',
          name: '',
          price: '',
          salePrice: '',
          stock: '0',
          categoryId: categoriesProduct[0]?.id || '',
          image: '',
          status: 'Active',
          description: ''
        });
        setAdditionalImages([]);
        setIsVariableProduct(false);
        setActivePickerColor(null);
      } else if (productData) {
        setForm({
          ...productData,
          price: productData.price !== undefined && productData.price !== null ? String(productData.price) : '',
          salePrice: productData.salePrice !== undefined && productData.salePrice !== null ? String(productData.salePrice) : '',
          stock: productData.stock !== undefined && productData.stock !== null ? String(productData.stock) : '0'
        });

        // Set variable state based on existence of variants
        const hasVariants = productData.variants && productData.variants.length > 0;
        setIsVariableProduct(hasVariants);
        setActivePickerColor(null);

        // Tải ảnh phụ đã lưu
        productImageService.getByProductId(productData.id).then(res => {
          setAdditionalImages(res);
        }).catch(err => console.log("Error loading additional images", err));
      }
    }
  }, [isOpen, modalType, productData, categoriesProduct]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setForm(prev => ({ ...prev, image: url }));
      } catch (err) {
        alert("Error uploading cover image: " + err.message);
      }
    }
  };

  const handleMultipleImageUpload = async (e) => {
    let files = Array.from(e.target.files);

    // Giới hạn tối đa 50 hình ảnh cho một sản phẩm
    if (additionalImages.length + files.length > 50) {
      alert("You can only upload up to 50 gallery images per product.");
      const allowedSlots = 50 - additionalImages.length;
      files = files.slice(0, allowedSlots);
      if (files.length === 0) return;
    }

    if (files.length > 0) {
      try {
        const uploadPromises = files.map(file => uploadImage(file));
        const urls = await Promise.all(uploadPromises);

        const newImages = urls.map(url => ({ id: null, imageUrl: url, isNew: true, color: null }));
        setAdditionalImages(prev => [...prev, ...newImages]);
      } catch (err) {
        alert("Error uploading gallery: " + err.message);
      }
    }
  };

  const handleDeleteAdditionalImage = async (image, index) => {
    if (image.id) {
      try {
        await productImageService.delete(image.id);
        setAdditionalImages(prev => prev.filter(img => img.id !== image.id));
      } catch (err) {
        alert("Error deleting image from system: " + err.message);
      }
    } else {
      setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateImageColor = (index, value) => {
    setAdditionalImages(prev => prev.map((img, i) => i === index ? { ...img, color: value } : img));
  };

  const handleSetColorThumbnail = (targetImage) => {
    setAdditionalImages(prev => {
      const sameColorImages = prev.filter(img => img.color && img.color.trim().toLowerCase() === targetImage.color.trim().toLowerCase());
      const otherImages = prev.filter(img => !img.color || img.color.trim().toLowerCase() !== targetImage.color.trim().toLowerCase());

      const targetIndex = sameColorImages.findIndex(img => img.imageUrl === targetImage.imageUrl);
      if (targetIndex > -1) {
        const [moved] = sameColorImages.splice(targetIndex, 1);
        sameColorImages.unshift(moved);
      }
      return [...otherImages, ...sameColorImages];
    });
  };

  // Nhóm màu sắc không phân biệt chữ hoa/chữ thường, khoảng trắng dư thừa
  const getColorGroups = () => {
    if (!productData || !productData.variants) return [];
    const colorsMap = {};
    productData.variants.forEach(v => {
      if (v.color) {
        const norm = v.color.trim().toLowerCase();
        if (!colorsMap[norm]) {
          colorsMap[norm] = v.color.trim();
        }
      }
    });
    return Object.values(colorsMap);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("Please enter the product name.");
      return;
    }

    if (!form.image) {
      alert("Primary thumbnail is required for storefront display!");
      return;
    }

    let priceNum = 0;
    let salePriceNum = 0;
    let stockNum = 0;

    if (isVariableProduct) {
      // Tự động tìm giá thấp nhất từ các biến thể để thỏa mãn ràng buộc NOT NULL của DB
      if (productData && productData.variants && productData.variants.length > 0) {
        const prices = productData.variants.map(v => parseFloat(v.price)).filter(p => !isNaN(p) && p > 0);
        if (prices.length > 0) {
          priceNum = Math.min(...prices);
        }
      }
      if (priceNum === 0) {
        priceNum = 1000; // Giá mặc định cực thấp để tránh DB Constraint Error
      }
      salePriceNum = priceNum;
      stockNum = 0; // Tồn kho của Variable Product được tính bằng tổng các biến thể tự động bên Backend/Entity
    } else {
      if (!form.price) {
        alert("Please enter the price.");
        return;
      }
      priceNum = parseFloat(form.price);
      salePriceNum = form.salePrice ? parseFloat(form.salePrice) : priceNum;
      stockNum = parseInt(form.stock || '0', 10);
    }

    onSubmit({
      ...form,
      price: priceNum,
      salePrice: salePriceNum,
      stock: stockNum,
      additionalImages
    });
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'add' ? 'Add New Product' : 'Edit Product Details'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Ja1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Toggle Simple vs Variable Product */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <input
            type="checkbox"
            id="isVariableProduct"
            checked={isVariableProduct}
            onChange={(e) => setIsVariableProduct(e.target.checked)}
            className="w-4 h-4 rounded border-white/10 accent-purple-600 bg-transparent text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="isVariableProduct" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
            This product has variants (color, size, etc.)
          </label>
        </div>

        {/* Pricing & Stock Configuration */}
        {!isVariableProduct ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base Price (VND) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  placeholder="999.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs glass-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sale Price (VND)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs glass-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock Count *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="100"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
            <i className="fa-solid fa-circle-info mt-0.5 shrink-0"></i>
            <span>
              This product has multiple variants. Price and stock count will be managed per variant in the <strong>Manage Variants</strong> section.
            </span>
          </div>
        )}

        {/* Category */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category *</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224] text-white"
          >
            {categoriesProduct.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-[#0F1224] text-white">{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Status Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Publish Status</label>
          <div className="flex gap-4">
            {['Active', 'OutOfStock', 'Draft'].map(s => (
              <label key={s} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="modal-status"
                  checked={form.status === s}
                  onChange={() => setForm({ ...form, status: s })}
                  className="accent-purple-600"
                />
                <span>{s === 'OutOfStock' ? 'Out of Stock' : s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cover Image Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Thumbnail *</label>
          <div className="flex items-center gap-4">
            {form.image && (
              <img src={resolveImageUrl(form.image)} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-purple-500/20" />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 block mt-1">Primary display image of the product.</span>
            </div>
          </div>
        </div>

        {/* Gallery Images (Multiple) */}
        <div className="space-y-1.5 pt-4 border-t border-white/5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Product Gallery (Max: 50 Images) - {additionalImages.length}/50
          </label>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImageUpload}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30 file:cursor-pointer glass-input cursor-pointer"
            />
          </div>

          {/* Gallery Preview */}
          {additionalImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3 p-2 bg-[#0F1224]/30 rounded-lg border border-white/5">
              {additionalImages.map((img, index) => (
                <div key={img.id || index} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                  <img src={resolveImageUrl(img.imageUrl)} className="w-full h-full object-cover" />
                  {img.color && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-600/80 text-white truncate max-w-[90%]">
                      {img.color}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteAdditionalImage(img, index)}
                    className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Delete this image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Color Grouping Section */}
        {isVariableProduct && getColorGroups().length > 0 && (
          <div className="space-y-2 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Link Images to Color Groups</label>
              <span className="text-[9px] text-amber-400/80 italic font-medium">* The first image in each group will be the color thumbnail in cart & storefront</span>
            </div>
            <div className="space-y-2.5">
              {getColorGroups().map(color => {
                const colorImages = additionalImages.filter(img => img.color && img.color.trim().toLowerCase() === color.trim().toLowerCase());
                return (
                  <div key={color} className="p-3 rounded-lg bg-[#0F1224]/30 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-purple-300">Color: {color}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({colorImages.length} images linked)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePickerColor(color)}
                        className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 text-[10px] font-medium transition-colors"
                      >
                        Select from Gallery
                      </button>
                    </div>
                    {colorImages.length > 0 ? (
                      <div className="grid grid-cols-6 gap-2">
                        {colorImages.map((img, idx) => {
                          const isThumbnail = idx === 0;
                          return (
                            <div
                              key={img.id || idx}
                              className={`relative group aspect-square rounded overflow-hidden border transition-all ${isThumbnail ? 'border-amber-400/85 ring-1 ring-amber-400/30 scale-[1.02]' : 'border-white/10'
                                }`}
                            >
                              <img src={resolveImageUrl(img.imageUrl)} className="w-full h-full object-cover" />
                              {isThumbnail ? (
                                <div className="absolute top-0.5 left-0.5 bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-lg" title="Main Color Thumbnail">
                                  <i className="fa-solid fa-star text-[8px]"></i>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetColorThumbnail(img)}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                  title="Set as Color Thumbnail"
                                >
                                  <i className="fa-regular fa-star text-white hover:text-amber-400 text-xs"></i>
                                </button>
                              )}
                              {isThumbnail && (
                                <span className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-white text-[7px] font-bold text-center py-0.5 uppercase tracking-wider">
                                  Thumbnail
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">No images linked to this color yet</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
          <textarea
            rows="3"
            placeholder="Write product specs or overview..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="glass-btn px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="glass-btn-primary px-5 py-2 rounded-xl text-xs font-semibold"
          >
            Save Product
          </button>
        </div>
      </form>

      {/* Visual Image Picker Modal */}
      {activePickerColor && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0F1224] border border-white/10 rounded-2xl p-4 w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Select Images for Color: <span className="text-blue-400">{activePickerColor}</span></h3>
              <button
                type="button"
                onClick={() => setActivePickerColor(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 py-4 overflow-y-auto flex-1 my-2 min-h-[200px]">
              {additionalImages.map((img, index) => {
                const isSelected = img.color && img.color.trim().toLowerCase() === activePickerColor.trim().toLowerCase();
                return (
                  <div
                    key={img.id || index}
                    onClick={() => {
                      const newColor = isSelected ? null : activePickerColor;
                      handleUpdateImageColor(index, newColor);
                    }}
                    className={`relative cursor-pointer aspect-square rounded-lg overflow-hidden border-2 transition-all group ${isSelected ? 'border-emerald-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'
                      }`}
                  >
                    <img src={resolveImageUrl(img.imageUrl)} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setActivePickerColor(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </GlassModal>
  );
};

export default ProductFormModal;
