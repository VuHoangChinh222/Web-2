import React from 'react';
import { Edit2, Trash2, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';

const CustomerListItem = ({ cust, resolveImageUrl, handleOpenEdit, handleDelete }) => {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
      <td className="p-3 w-14">
        <img src={resolveImageUrl(cust.avatar)} alt={cust.fullname} className="w-10 h-10 rounded-full object-cover border border-purple-500/20" />
      </td>
      <td className="p-3">
        <h3 className="font-bold text-white text-sm">{cust.fullname}</h3>
        <p className="text-[10px] font-mono text-slate-500">ID: {cust.id}</p>
      </td>
      <td className="p-3 text-xs text-slate-300">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2"><Mail size={12} className="text-purple-400 flex-shrink-0" /> <span className="truncate">{cust.email}</span></div>
          <div className="flex items-center gap-2"><Phone size={12} className="text-purple-400 flex-shrink-0" /> <span>{cust.phone}</span></div>
        </div>
      </td>
      <td className="p-3 text-xs text-slate-400 max-w-[200px] truncate" title={cust.address}>
        <div className="flex items-start gap-2">
          <MapPin size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{cust.address}</span>
        </div>
      </td>
      <td className="p-3 text-xs">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1"><ShoppingBag size={11} className="text-slate-400"/> {cust.orderCount} orders</span>
          <span className="font-bold text-emerald-400">{cust.totalSpending.toLocaleString()} VND</span>
        </div>
      </td>
      <td className="p-3">
        {cust.active ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Inactive</span>
        )}
      </td>
      <td className="p-3 text-right">
        <div className="flex justify-end gap-1.5">
          <button onClick={() => handleOpenEdit(cust)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10" title="Edit"><Edit2 size={14} /></button>
          <button onClick={() => handleDelete(cust.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10" title="Delete"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerListItem;
