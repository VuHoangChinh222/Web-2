import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layout, Link as LinkIcon, Eye } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import GlassModal from '../../components/GlassModal';

const Banners = () => {
  const { banners, addBanner, updateBanner, deleteBanner, uploadImage, resolveImageUrl } = useAdmin();

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');

  // Form State
  const [currentBanner, setCurrentBanner] = useState({
    id: '',
    title: '',
    subtitle: '',
    image: '',
    link: '',
    active: true
  });

  const handleOpenAdd = () => {
    setCurrentBanner({
      id: '',
      title: '',
      subtitle: '',
      image: '',
      link: '',
      active: true
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setCurrentBanner(banner);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setCurrentBanner(prev => ({ ...prev, image: url }));
      } catch (err) {
        alert("Lỗi tải lên hình ảnh: " + err.message);
      }
    }
  };

  // Submit Operations
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentBanner.title || !currentBanner.image) {
      alert("Title and Image are required.");
      return;
    }

    if (modalType === 'add') {
      addBanner(currentBanner);
    } else {
      updateBanner(currentBanner);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this promotional banner?")) {
      deleteBanner(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Promotional Banners</h2>
          <p className="text-xs text-slate-400">Configure homepage sliders and marketing billboards</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.length === 0 ? (
          <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
            <Layout size={24} className="text-slate-600 mb-2" />
            <p className="text-xs font-semibold">No banners configured yet.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <GlassCard key={banner.id} hoverEffect={true} className="flex flex-col justify-between h-full relative overflow-hidden group">
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                {banner.active ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Disabled</span>
                )}
              </div>

              {/* Banner Details */}
              <div>
                {/* Banner Image Preview */}
                <div className="relative aspect-[21/9] rounded-xl overflow-hidden mb-4 border border-white/5 bg-slate-900">
                  <img
                    src={resolveImageUrl(banner.image)}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06070B]/70 via-transparent to-transparent flex flex-col justify-end p-4">
                    <h4 className="text-sm font-extrabold text-white leading-tight">{banner.title}</h4>
                    <p className="text-[10px] text-slate-300 font-medium mt-0.5">{banner.subtitle}</p>
                  </div>
                </div>

                {/* Destination link */}
                <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium px-1">
                  <LinkIcon size={12} className="text-slate-500" />
                  <span className="truncate max-w-[280px]" title={banner.link}>{banner.link || 'No hyperlink attached'}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-white/5 flex justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(banner)}
                  className="p-2 rounded-lg glass-btn text-blue-400 hover:border-blue-500/40"
                  title="Edit banner details"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 rounded-lg glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                  title="Delete banner"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
                value={currentBanner.title}
                onChange={(e) => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subtitle Description</label>
              <input
                type="text"
                placeholder="e.g. Up to 50% discount on collections"
                value={currentBanner.subtitle}
                onChange={(e) => setCurrentBanner({ ...currentBanner, subtitle: e.target.value })}
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
              value={currentBanner.link}
              onChange={(e) => setCurrentBanner({ ...currentBanner, link: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visibility Status</label>
            <select
              value={currentBanner.active}
              onChange={(e) => setCurrentBanner({ ...currentBanner, active: e.target.value === 'true' })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
            >
              <option value="true">Active (Display on Homepage Slider)</option>
              <option value="false">Disabled (Hidden from Slider)</option>
            </select>
          </div>

          {/* Image File Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Background Image *</label>
            <div className="flex items-center gap-4">
              {currentBanner.image && (
                <img src={resolveImageUrl(currentBanner.image)} alt="Preview" className="w-20 h-10 rounded object-cover border border-purple-500/20" />
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
              onClick={() => setIsModalOpen(false)}
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
    </div>
  );
};

export default Banners;
