import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';

const BannerFormModal = ({
  isOpen,
  onClose,
  modalType,
  bannerData,
  resolveImageUrl,
  uploadImage,
  onSubmit
}) => {
  const [form, setForm] = useState({
    id: '',
    title: '',
    subtitle: '',
    image: '',
    link: '',
    active: true
  });

  useEffect(() => {
    if (isOpen) {
      if (modalType === 'add') {
        setForm({
          id: '',
          title: '',
          subtitle: '',
          image: '',
          link: '',
          active: true
        });
      } else if (bannerData) {
        setForm(bannerData);
      }
    }
  }, [isOpen, modalType, bannerData]);

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
    if (!form.title || !form.image) {
      alert("Title and Image are required.");
      return;
    }
    onSubmit(form);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'add' ? 'Create Promo Banner' : 'Edit Banner Details'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Title & Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Super Sale"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subtitle Description</label>
            <input
              type="text"
              placeholder="e.g. Up to 50% discount on collections"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
        </div>

        {/* Hyperlink Destination */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Redirect Link (URL)</label>
          <input
            type="text"
            placeholder="e.g. /product-category/summer-sales or https://..."
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Status Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visibility Status</label>
          <select
            value={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224] text-white"
          >
            <option value="true" className="bg-[#0F1224] text-white">Active (Display on Homepage Slider)</option>
            <option value="false" className="bg-[#0F1224] text-white">Disabled (Hidden from Slider)</option>
          </select>
        </div>

        {/* Image File Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Background Image *</label>
          <div className="flex items-center gap-4">
            {form.image && (
              <img src={resolveImageUrl(form.image)} alt="Preview" className="w-20 h-10 rounded object-cover border border-purple-500/20" />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 block mt-1">Select a wide aspect ratio image file.</span>
            </div>
          </div>
        </div>

        {/* Submit Action Buttons */}
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
            Save Banner
          </button>
        </div>
      </form>
    </GlassModal>
  );
};

export default BannerFormModal;
