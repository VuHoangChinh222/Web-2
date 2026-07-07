import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';

const BannerListItem = ({ banner, handleToggleStatus, handleOpenEdit, handleDelete, resolveImageUrl }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    backgroundColor: isDragging ? 'rgba(30, 41, 59, 0.95)' : undefined,
    zIndex: isDragging ? 99 : 1,
    position: isDragging ? 'relative' : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style} className={`hover:bg-white/[0.01] transition-colors ${isDragging ? 'shadow-2xl ring-1 ring-purple-500/50' : ''}`}>
      <td className="py-2.5 pl-2 pr-2">
        <div 
          {...attributes} 
          {...listeners} 
          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5 cursor-grab active:cursor-grabbing inline-block transition-colors"
          title="Kéo thả để hoán đổi vị trí"
        >
          <GripVertical size={14} />
        </div>
      </td>
      <td className="py-2.5">
        <img src={resolveImageUrl(banner.image)} alt="" className={`w-16 h-8 rounded object-cover border border-white/10 ${!banner.active ? 'opacity-50 grayscale' : ''}`} />
      </td>
      <td className="py-2.5 font-semibold text-white max-w-[200px] sm:max-w-[300px] truncate" title={banner.title}>
        {banner.title}
      </td>
      <td className="py-2.5 text-slate-400 text-[10px] max-w-[150px] truncate hidden md:table-cell">
        {banner.link || 'No hyperlink'}
      </td>
      <td className="py-2.5 font-mono text-center text-xs">
        <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/10">#{banner.position}</span>
      </td>
      <td className="py-2.5">
        {banner.active ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Disabled</span>
        )}
      </td>
      <td className="py-2.5 text-right pr-2">
        <div className="flex justify-end gap-1.5">
          <button onClick={() => handleToggleStatus(banner)} className={`p-1.5 rounded glass-btn ${banner.active ? 'text-amber-400 hover:border-amber-500/40' : 'text-emerald-400 hover:border-emerald-500/40'}`}>
            {banner.active ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button onClick={() => handleOpenEdit(banner)} className="p-1.5 rounded glass-btn text-blue-400 hover:border-blue-500/40">
            <Edit2 size={12} />
          </button>
          <button onClick={() => handleDelete(banner.id)} className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BannerListItem;
