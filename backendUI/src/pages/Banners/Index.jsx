import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layout, Link as LinkIcon } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import BannerFormModal from './BannerFormModal';
import bannerService from '../../services/bannerService';

const mapBannerFromBackend = (banner) => {
  if (!banner) return null;
  return {
    id: banner.id,
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    image: banner.imageUrl || '',
    link: banner.linkUrl || '',
    active: banner.status === 1
  };
};

const Banners = () => {
  const { banners, setBanners, uploadImage, resolveImageUrl } = useAdmin();

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentBanner, setCurrentBanner] = useState(null);

  // Map banners locally
  const mappedBanners = (banners || []).map(mapBannerFromBackend).filter(Boolean);

  const handleOpenAdd = () => {
    setCurrentBanner(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setCurrentBanner(banner);
    setModalType('edit');
    setIsModalOpen(true);
  };

  // Submit Operations
  const handleFormSubmit = async (formData) => {
    const body = {
      title: formData.title,
      subtitle: formData.subtitle,
      imageUrl: formData.image || formData.imageUrl || '',
      linkUrl: formData.link || formData.linkUrl || '',
      status: formData.active ? 1 : 0
    };

    try {
      if (modalType === 'add') {
        const newBanner = await bannerService.create(body);
        setBanners(prev => [newBanner, ...prev]);
      } else {
        const updated = await bannerService.update(formData.id, body);
        setBanners(prev => prev.map(b => b.id === formData.id ? updated : b));
      }
    } catch (err) {
      alert("Lỗi thao tác Banner: " + err.message);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this promotional banner?")) {
      try {
        await bannerService.delete(id);
        setBanners(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        alert("Lỗi khi xóa Banner: " + err.message);
      }
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
        {mappedBanners.length === 0 ? (
          <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
            <Layout size={24} className="text-slate-600 mb-2" />
            <p className="text-xs font-semibold">No banners configured yet.</p>
          </div>
        ) : (
          mappedBanners.map((banner) => (
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
      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        bannerData={currentBanner}
        resolveImageUrl={resolveImageUrl}
        uploadImage={uploadImage}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Banners;
