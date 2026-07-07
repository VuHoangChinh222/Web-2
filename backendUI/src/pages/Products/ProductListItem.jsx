import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';

const ProductListItem = ({ prod, categoriesProduct, getStatusBadge, resolveImageUrl, handleOpenView, handleOpenEdit, handleDelete }) => {
  return (
    <tr className="hover:bg-white/[0.01] transition-colors">
      <td className="py-2.5 pr-2">
        <img src={resolveImageUrl(prod.image)} alt={prod.name} className="w-10 h-7 rounded object-cover border border-white/10" />
      </td>
      <td className="py-2.5 font-semibold text-white max-w-[200px] truncate" title={prod.name}>
        {prod.name}
      </td>
      <td className="py-2.5 text-slate-400">
        {categoriesProduct.find(c => c.id === prod.categoryId)?.name || 'Uncategorized'}
      </td>
      <td className="py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white">${prod.salePrice.toFixed(2)}</span>
          {prod.salePrice < prod.price && (
            <span className="text-[10px] text-slate-500 line-through">${prod.price.toFixed(2)}</span>
          )}
        </div>
      </td>
      <td className="py-2.5 font-mono">{prod.stock}</td>
      <td className="py-2.5">{getStatusBadge(prod.status)}</td>
      <td className="py-2.5 text-right">
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleOpenView(prod)}
            className="p-1.5 rounded glass-btn text-emerald-400 hover:border-emerald-500/40"
            title="Xem chi tiết"
          >
            <Eye size={12} />
          </button>
          <button
            onClick={() => handleOpenEdit(prod)}
            className="p-1.5 rounded glass-btn text-blue-400 hover:border-blue-500/40"
            title="Chỉnh sửa"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => handleDelete(prod.id)}
            className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
            title="Xóa"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductListItem;
