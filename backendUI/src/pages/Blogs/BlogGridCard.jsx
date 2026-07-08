import React from 'react';
import { Edit2, Trash2, Calendar, User, Eye } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const BlogGridCard = ({ blog, author, category, formatDate, resolveImageUrl, handleOpenView, handleOpenEdit, handleDelete, handleToggleStatus }) => {
  return (
    <GlassCard hoverEffect={true} className={`flex flex-col justify-between group h-full transition-opacity duration-300 ${blog.status === 1 ? 'opacity-100' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`}>
      <div>
        {/* Blog Cover Image */}
        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-white/5 bg-slate-900">
          <img 
            src={resolveImageUrl(blog.image)} 
            alt="" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Active / Hidden Tag */}
          <div className="absolute top-3 left-3">
            <button onClick={() => handleToggleStatus(blog)} className="cursor-pointer transition-transform hover:scale-105 active:scale-95 block" title="Click to toggle status">
              {blog.status === 1 ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg backdrop-blur-md block">Active</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800/80 text-zinc-400 border border-zinc-600/50 shadow-lg backdrop-blur-md block">Hidden</span>
              )}
            </button>
          </div>
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {category ? category.name : 'General'}
          </span>
        </div>

        {/* Blog header fields */}
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium mb-2.5">
          <span className="flex items-center gap-1">
            <Calendar size={11} /> {formatDate(blog.createdDate)}
          </span>
          <span className="flex items-center gap-1">
            <User size={11} /> {author ? author.fullname : 'Editor'}
          </span>
        </div>

        {/* Title & snippet */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white tracking-wide group-hover:text-purple-300 transition-colors line-clamp-1">
            {blog.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {blog.content}
          </p>
        </div>
      </div>

      {/* Operations Footer */}
      <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
        <button 
          onClick={() => handleOpenView(blog)}
          className="text-[10px] font-bold text-purple-400 flex items-center gap-1 hover:underline p-1"
        >
          View Details <Eye size={12} />
        </button>

        <div className="flex gap-1.5">
          <button
            onClick={() => handleOpenEdit(blog)}
            className="p-2 rounded-lg glass-btn text-blue-400 hover:border-blue-500/40"
            title="Edit article"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDelete(blog.id)}
            className="p-2 rounded-lg glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
            title="Delete article"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default BlogGridCard;
