import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layout, Link as LinkIcon, Eye } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';

const Banners = () => {
  const { banners, addBanner, updateBanner, deleteBanner } = useAdmin();

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
    position: 1,
    status: 'Active'
  });



  // Open Actions
  const handleOpenAdd = () => {
    setCurrentBanner({
      id: '',
      title: '',
      subtitle: '',
      image: '',
      link: '',
      position: 1,
      status: 'Active'
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setCurrentBanner(banner);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentBanner(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Operations
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentBanner.title || !currentBanner.image) {
      alert("Banner Title and Image URL are required.");
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
    if (confirm("Are you sure you want to delete this marketing banner?")) {
      deleteBanner(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Marketing Banners</h2>
          <p className="text-xs text-slate-400">Configure promotional sliders and ads</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Create Banner
        </button>
      </div>

      {/* Banners Layout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((ban) => (
          <GlassCard key={ban.id} hoverEffect={true} className="flex flex-col justify-between h-full group relative overflow-hidden">
            {/* Status indicators */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/20 uppercase font-mono">Thứ tự: {ban.position}</span>
              {ban.status === 'Active' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Inactive</span>
              )}
            </div>

            <div>
              {/* Graphic cover */}
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-white/5 bg-slate-900">
                <img 
                  src={ban.image} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Title & details */}
              <h3 className="font-bold text-white text-base leading-snug">{ban.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ban.subtitle || 'No subtitle provided.'}</p>
            </div>

            {/* Bottom URL & Actions */}
            <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate max-w-[200px]">
                <LinkIcon size={10} className="text-slate-600 flex-shrink-0" />
                <span className="truncate">{ban.link || 'No redirect link set'}</span>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handleOpenEdit(ban)}
                  className="p-1.5 rounded-lg glass-btn text-blue-400 hover:border-blue-500/40"
                  title="Modify Banner"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(ban.id)}
                  className="p-1.5 rounded-lg glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                  title="Delete Banner"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Create Banner Space' : 'Modify Banner Space'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Banner Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Summer Cyber Sale"
              value={currentBanner.title}
              onChange={(e) => setCurrentBanner({...currentBanner, title: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subtitle / Callout</label>
            <input 
              type="text" 
              placeholder="e.g. Upgrade your gear with 40% discount"
              value={currentBanner.subtitle}
              onChange={(e) => setCurrentBanner({...currentBanner, subtitle: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Image File Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Image *</label>
            <div className="flex items-center gap-4">
              {currentBanner.image && (
                <img src={currentBanner.image} alt="Preview" className="w-20 h-10 rounded-lg object-cover border border-purple-500/20" />
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 block mt-1">Select a banner image file.</span>
              </div>
            </div>
          </div>

          {/* Positioning & Link */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target URL Link</label>
              <input 
                type="text" 
                placeholder="e.g. /promo/summer-cyber"
                value={currentBanner.link}
                onChange={(e) => setCurrentBanner({...currentBanner, link: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thứ tự hiển thị *</label>
              <input 
                type="number"
                min="1"
                required
                placeholder="Ví dụ: 1"
                value={currentBanner.position}
                onChange={(e) => setCurrentBanner({...currentBanner, position: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input 
                  type="radio" 
                  name="banner-status"
                  checked={currentBanner.status === 'Active'}
                  onChange={() => setCurrentBanner({...currentBanner, status: 'Active'})}
                  className="accent-purple-600"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input 
                  type="radio" 
                  name="banner-status"
                  checked={currentBanner.status === 'Inactive'}
                  onChange={() => setCurrentBanner({...currentBanner, status: 'Inactive'})}
                  className="accent-purple-600"
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>

          {/* Submit Actions */}
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
