import React from 'react';
import { Edit2, Trash2, Calendar, User, Eye } from 'lucide-react';

const BlogListItem = ({ blog, author, category, formatDate, resolveImageUrl, handleOpenView, handleOpenEdit, handleDelete, handleToggleStatus }) => {
  return (
    <tr className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors group ${blog.status === 1 ? 'opacity-100' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`}>
      <td className="p-3 w-16">
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-slate-900">
          <img src={resolveImageUrl(blog.image)} alt="" className="w-full h-full object-cover" />
        </div>
      </td>
      <td className="p-3">
        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">{blog.title}</h3>
        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{blog.content}</p>
      </td>
      <td className="p-3 text-xs text-slate-300">
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {category ? category.name : 'General'}
        </span>
      </td>
      <td className="p-3 text-xs text-slate-400">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(blog.createdDate)}</span>
          <span className="flex items-center gap-1.5"><User size={12} /> {author ? author.fullname : 'Editor'}</span>
        </div>
      </td>
      <td className="p-3">
        <button onClick={() => handleToggleStatus(blog)} className="cursor-pointer transition-transform hover:scale-105 active:scale-95 block" title="Click to toggle status">
          {blog.status === 1 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 block">Active</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 block">Hidden</span>
          )}
        </button>
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => handleOpenView(blog)} className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/10" title="View Details">
            <Eye size={14} />
          </button>
          <button onClick={() => handleOpenEdit(blog)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleDelete(blog.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BlogListItem;
