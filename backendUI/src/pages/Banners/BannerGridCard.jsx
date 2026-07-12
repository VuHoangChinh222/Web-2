import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const BannerGridCard = ({ banner, handleToggleStatus, handleOpenEdit, handleDelete, resolveImageUrl }) => {
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
        {/* Drag Handle */}
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

export default BannerGridCard;
