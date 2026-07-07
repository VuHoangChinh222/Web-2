import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layout, Link as LinkIcon, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import BannerFormModal from './BannerFormModal';
import bannerService from '../../services/bannerService';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const mapBannerFromBackend = (banner) => {
  if (!banner) return null;
  return {
    id: banner.id,
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    image: banner.imageUrl || '',
    link: banner.linkUrl || '',
    active: banner.status === 1,
    position: banner.position || 0
  };
};

// Component thẻ cho phép kéo thả
const SortableBannerCard = ({ banner, handleToggleStatus, handleOpenEdit, handleDelete, resolveImageUrl }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 99 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <GlassCard hoverEffect={!isDragging} className={`flex flex-col justify-between h-full relative overflow-hidden group ${isDragging ? 'ring-2 ring-purple-500 shadow-2xl scale-105 bg-slate-900/80' : ''}`}>
        {/* Drag Handle (Chỉ cầm vào đây mới kéo được) */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 left-4 z-20 p-1.5 bg-black/60 rounded-md text-white hover:text-purple-300 backdrop-blur-md transition-colors cursor-grab active:cursor-grabbing"
          title="Kéo thả để hoán đổi vị trí"
        >
          <GripVertical size={16} />
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          {banner.active ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">Active</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Disabled</span>
          )}
        </div>

        {/* Banner Details */}
        <div>
          {/* Banner Image Preview */}
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden mb-4 border border-white/5 bg-slate-900 mt-2">
            <img
              src={resolveImageUrl(banner.image)}
              alt=""
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!banner.active ? 'opacity-50 grayscale' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06070B]/80 via-[#06070B]/20 to-transparent flex flex-col justify-end p-4">
              <h4 className="text-sm font-extrabold text-white leading-tight flex items-center gap-2">
                {banner.title}
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full" title="Thứ tự hiển thị">#{banner.position}</span>
              </h4>
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
            onClick={() => handleToggleStatus(banner)}
            className={`p-2 rounded-lg glass-btn ${banner.active ? 'text-amber-400 hover:border-amber-500/40' : 'text-emerald-400 hover:border-emerald-500/40'}`}
            title={banner.active ? "Tạm ngưng (Disable)" : "Kích hoạt (Active)"}
          >
            {banner.active ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            onClick={() => handleOpenEdit(banner)}
            className="p-2 rounded-lg glass-btn text-blue-400 hover:border-blue-500/40"
            title="Chỉnh sửa (Edit)"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDelete(banner.id)}
            className="p-2 rounded-lg glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
            title="Xóa banner (Delete)"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

const Banners = () => {
  const { banners, setBanners, uploadImage, resolveImageUrl } = useAdmin();

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentBanner, setCurrentBanner] = useState(null);

  // Drag and drop setup
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Tránh nhấp nhầm thành kéo
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Map banners locally and sort by position
  const mappedBanners = (banners || []).map(mapBannerFromBackend).filter(Boolean).sort((a, b) => a.position - b.position);

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

  const handleToggleStatus = async (banner) => {
    try {
      const newStatus = banner.active ? 0 : 1;
      const body = {
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.image,
        linkUrl: banner.link,
        position: banner.position,
        status: newStatus
      };
      const updated = await bannerService.update(banner.id, body);
      setBanners(prev => prev.map(b => b.id === banner.id ? updated : b));
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái Banner: " + err.message);
    }
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

  // DND Handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = mappedBanners.findIndex((b) => b.id === active.id);
    const newIndex = mappedBanners.findIndex((b) => b.id === over.id);

    // Tính toán trên mảng raw để không mất trường dữ liệu gốc (imageUrl)
    const rawList = [...(banners || [])].sort((a, b) => (a.position || 0) - (b.position || 0));

    // Đảo vị trí (Shift Array)
    const reorderedList = arrayMove(rawList, oldIndex, newIndex);

    // Gán lại position
    const updatedRawList = reorderedList.map((b, i) => ({ ...b, position: i + 1 }));

    // Optimistic UI update
    setBanners(updatedRawList);

    // Call API ngầm
    try {
      await Promise.all(updatedRawList.map(b =>
        bannerService.update(b.id, {
          title: b.title,
          imageUrl: b.imageUrl,
          position: b.position,
          status: b.status
        })
      ));
    } catch (err) {
      alert("Lỗi khi đồng bộ vị trí: " + err.message);
    }
  };

  const activeBanner = mappedBanners.find(b => b.id === activeId);
  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
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

      {/* Grid of Banners with Dnd-Kit */}
      {mappedBanners.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
          <Layout size={24} className="text-slate-600 mb-2" />
          <p className="text-xs font-semibold">No banners configured yet.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={mappedBanners.map(b => b.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mappedBanners.map((banner) => (
                <SortableBannerCard
                  key={banner.id}
                  banner={banner}
                  handleToggleStatus={handleToggleStatus}
                  handleOpenEdit={handleOpenEdit}
                  handleDelete={handleDelete}
                  resolveImageUrl={resolveImageUrl}
                />
              ))}
            </div>
          </SortableContext>

          {/* Lớp overlay hiển thị mờ khi đang nhấc một thẻ lên */}
          <DragOverlay dropAnimation={dropAnimation}>
            {activeBanner ? (
              <div className="opacity-90 scale-105 ring-2 ring-purple-500 rounded-2xl bg-[#0F1224]">
                <SortableBannerCard
                  banner={activeBanner}
                  handleToggleStatus={() => { }}
                  handleOpenEdit={() => { }}
                  handleDelete={() => { }}
                  resolveImageUrl={resolveImageUrl}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

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
