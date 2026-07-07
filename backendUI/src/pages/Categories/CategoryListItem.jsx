import React from 'react';
import { Edit2, Trash2, Link as LinkIcon } from 'lucide-react';

const CategoryListItem = ({ cat, activeTab, resolveImageUrl, handleOpenEdit, handleDelete }) => {
  return (
    <tr className="hover:bg-white/[0.01] transition-colors">
      <td className="py-3.5 pr-2 font-mono text-slate-400">{cat.id}</td>
      <td className="py-3.5 font-bold text-white text-sm">
        <div className="flex items-center gap-3">
          <img 
            src={resolveImageUrl(cat.imageUrl || cat.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80')} 
            alt="" 
            className="w-10 h-8 rounded object-cover border border-white/10 flex-shrink-0"
          />
          <span>{cat.name}</span>
        </div>
      </td>
      <td className="py-3.5 font-mono text-purple-400 text-[11px]">
        <div className="flex items-center gap-1">
          <LinkIcon size={10} className="text-slate-500" />
          <span>{cat.slug}</span>
        </div>
      </td>
      <td className="py-3.5 text-slate-400 max-w-[280px] truncate" title={cat.description}>
        {cat.description}
      </td>
      <td className="py-3.5 text-slate-200 font-semibold font-mono">
        {activeTab === 'product' ? cat.productCount : cat.postCount || 0} items
      </td>
      <td className="py-3.5 text-right">
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(cat)}
            className="p-1.5 rounded glass-btn text-blue-400 hover:border-blue-500/40"
            title="Edit Category"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => handleDelete(cat.id)}
            className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
            title="Delete Category"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CategoryListItem;
