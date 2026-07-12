import React, { useState } from 'react';
import { Plus, Layout, LayoutGrid, List } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import BannerFormModal from './BannerFormModal';
import BannerGridCard from './BannerGridCard';
import BannerListItem from './BannerListItem';
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
  rectSortingStrategy
} from '@dnd-kit/sortable';

const mapBannerFromBackend = (banner) => {
  if (!banner) return null;
  return {
    id: banner.id,
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    image: banner.imageUrl || '',
    active: banner.status === 1,
    position: banner.position || 0
  };
};

const Banners = () => {
  const { banners, setBanners, uploadImage, resolveImageUrl } = useAdmin();

  // Controls
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentBanner, setCurrentBanner] = useState(null);

  // Drag and drop setup
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    const targetPosition = modalType === 'add' ? ((banners || []).length + 1) : formData.position;
    const body = {
      title: formData.title,
      subtitle: formData.subtitle,
      imageUrl: formData.image || formData.imageUrl || '',
      status: formData.active ? 1 : 0,
      position: targetPosition
    };

    try {
      if (modalType === 'add') {
        const newBanner = await bannerService.create(body);
        setBanners(prev => [...(prev || []), newBanner]);
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
        const remainingRawList = [...(banners || [])]
          .filter(b => b.id !== id)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        const updatedRawList = remainingRawList.map((b, i) => ({ ...b, position: i + 1 }));
        setBanners(updatedRawList);

        await Promise.all(updatedRawList.map(b =>
          bannerService.update(b.id, {
            title: b.title,
            imageUrl: b.imageUrl,
            position: b.position,
            status: b.status
          })
        ));
      } catch (err) {
        alert("Lỗi khi xóa Banner: " + err.message);
      }
    }
  };

  // DND Handlers
  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = mappedBanners.findIndex((b) => b.id === active.id);
    const newIndex = mappedBanners.findIndex((b) => b.id === over.id);

    const rawList = [...(banners || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
    const reorderedList = arrayMove(rawList, oldIndex, newIndex);
    const updatedRawList = reorderedList.map((b, i) => ({ ...b, position: i + 1 }));

    setBanners(updatedRawList);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Promotional Banners</h2>
          <p className="text-xs text-slate-400">Configure homepage sliders and marketing billboards</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-white/5 rounded-lg p-1 bg-white/[0.02] ml-auto sm:ml-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-purple-600/30 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-purple-600/30 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Banner
          </button>
        </div>
      </div>

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
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mappedBanners.map((banner) => (
                  <BannerGridCard
                    key={banner.id}
                    banner={banner}
                    handleToggleStatus={handleToggleStatus}
                    handleOpenEdit={handleOpenEdit}
                    handleDelete={handleDelete}
                    resolveImageUrl={resolveImageUrl}
                  />
                ))}
              </div>
            ) : (
              <GlassCard hoverEffect={false}>
                <div className="overflow-x-auto glass-scrollbar -mx-5 px-5">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-medium bg-[#0F1224]/50">
                        <th className="py-3 pl-2 w-10 text-center">Move</th>
                        <th className="py-3">Cover</th>
                        <th className="py-3">Title</th>
                        <th className="py-3 text-center">Pos</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mappedBanners.map((banner) => (
                        <BannerListItem
                          key={banner.id}
                          banner={banner}
                          handleToggleStatus={handleToggleStatus}
                          handleOpenEdit={handleOpenEdit}
                          handleDelete={handleDelete}
                          resolveImageUrl={resolveImageUrl}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </SortableContext>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeBanner ? (
              viewMode === 'grid' ? (
                <div className="opacity-90 scale-105 ring-2 ring-purple-500 rounded-2xl bg-[#0F1224] w-full">
                  <BannerGridCard
                    banner={activeBanner}
                    handleToggleStatus={() => { }}
                    handleOpenEdit={() => { }}
                    handleDelete={() => { }}
                    resolveImageUrl={resolveImageUrl}
                  />
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse bg-[#0F1224]/95 ring-2 ring-purple-500 rounded-lg shadow-2xl backdrop-blur-md table-fixed">
                  <tbody>
                    <BannerListItem
                      banner={activeBanner}
                      handleToggleStatus={() => { }}
                      handleOpenEdit={() => { }}
                      handleDelete={() => { }}
                      resolveImageUrl={resolveImageUrl}
                    />
                  </tbody>
                </table>
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

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
