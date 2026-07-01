import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';

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
    stock: '',
    categoryId: '',
    image: '',
    status: 'Active',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (modalType === 'add') {
        setForm({
          id: '',
          name: '',
          price: '',
          salePrice: '',
          stock: '',
          categoryId: categoriesProduct[0]?.id || '',
          image: '',
          status: 'Active',
          description: ''
        });
      } else if (productData) {
        setForm({
          ...productData,
          price: productData.price !== undefined && productData.price !== null ? String(productData.price) : '',
          salePrice: productData.salePrice !== undefined && productData.salePrice !== null ? String(productData.salePrice) : '',
          stock: productData.stock !== undefined && productData.stock !== null ? String(productData.stock) : ''
        });
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
        alert("Lỗi tải lên hình ảnh: " + err.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || form.stock === '') {
      alert("Please fill in all required fields.");
      return;
    }

    const priceNum = parseFloat(form.price);
    const salePriceNum = form.salePrice ? parseFloat(form.salePrice) : priceNum;
    const stockNum = parseInt(form.stock, 10);

    onSubmit({
      ...form,
      price: priceNum,
      salePrice: salePriceNum,
      stock: stockNum
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
            placeholder="e.g. Aether Phone 15 Pro"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Pricing Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original Price ($) *</label>
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sale Price ($)</label>
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

        {/* Stock & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock Count *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="50"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
            >
              {categoriesProduct.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
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

        {/* Image File Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Image *</label>
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
              <span className="text-[9px] text-slate-500 block mt-1">Select an image file from your device.</span>
            </div>
          </div>
        </div>

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
    </GlassModal>
  );
};

export default ProductFormModal;
