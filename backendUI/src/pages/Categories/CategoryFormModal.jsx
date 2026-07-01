import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';

const CategoryFormModal = ({
  isOpen,
  onClose,
  activeTab,
  modalType,
  categoryData,
  resolveImageUrl,
  uploadImage,
  onSubmit
}) => {
  const [form, setForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    productCount: 0
  });

  useEffect(() => {
    if (isOpen) {
      if (modalType === 'add') {
        setForm({
          id: '',
          name: '',
          slug: '',
          description: '',
          imageUrl: '',
          productCount: 0
        });
      } else if (categoryData) {
        setForm({
          ...categoryData,
          imageUrl: categoryData.imageUrl || categoryData.image || ''
        });
      }
    }
  }, [isOpen, modalType, categoryData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setForm(prev => ({ ...prev, imageUrl: url }));
      } catch (err) {
        alert("Lỗi tải lên hình ảnh: " + err.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      alert("Name and slug are required fields.");
      return;
    }
    onSubmit(form);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'add' ? `Add ${activeTab === 'product' ? 'Product' : 'Blog'} Category` : 'Edit Category Details'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name & Slug */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Running Shoes"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Slug (URL segment) *</label>
            <input
              type="text"
              required
              placeholder="e.g. running-shoes"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
        </div>

        {/* Banner cover Image */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Banner Image</label>
          <div className="flex items-center gap-4">
            {form.imageUrl ? (
              <img
                src={resolveImageUrl(form.imageUrl)}
                alt="Preview"
                className="w-12 h-10 rounded object-cover border border-purple-500/20"
              />
            ) : (
              <div className="w-12 h-10 rounded bg-purple-600/10 border border-dashed border-purple-500/30 flex items-center justify-center text-slate-500 text-[9px]">No Pic</div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 block mt-1">Upload a category icon/banner from your device.</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
          <textarea
            rows="3"
            placeholder="Provide a description for classification guidelines..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Submit controls */}
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
            Save Category
          </button>
        </div>
      </form>
    </GlassModal>
  );
};

export default CategoryFormModal;
