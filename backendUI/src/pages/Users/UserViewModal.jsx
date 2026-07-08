import React from 'react';
import { Mail, Phone, Calendar, BookOpen, ShieldAlert, CheckCircle2, Shield } from 'lucide-react';
import GlassModal from '../../components/GlassModal';

const UserViewModal = ({ isOpen, onClose, user, roles, blogs, resolveImageUrl }) => {
  if (!user) return null;

  // Find user role
  const assignedRole = (roles || []).find(r => r.id === user.roleId);

  // Filter blogs written by this user
  const userBlogs = (blogs || []).filter(b => {
    const blogAuthorId = b.author ? b.author.id : b.userId;
    return Number(blogAuthorId) === Number(user.id);
  });

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff User Profile Details"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* Profile Card Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-[#0F1224]/50 p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />

          {/* Avatar */}
          {user.avatar ? (
            <img 
              src={resolveImageUrl(user.avatar)} 
              alt={user.fullname} 
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-500/40 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-200 font-bold text-2xl shadow-xl">
              {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          {/* User Details */}
          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-wide">{user.fullname}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold w-fit self-center sm:self-auto ${
                user.active 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {user.active ? <CheckCircle2 size={10} /> : <ShieldAlert size={10} />}
                {user.active ? 'Active' : 'Suspended'}
              </span>
            </div>
            
            <p className="text-[10px] font-mono text-slate-400">User UID: {user.id}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="text-blue-300 font-medium font-mono">@{user.username}</span>
              <span className="text-slate-500">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                <Shield size={10} />
                {assignedRole ? assignedRole.name : 'Unknown Role'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-2.5 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Staff Contact Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-blue-400 shrink-0" />
              <span className="truncate">{user.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-blue-400 shrink-0" />
              <span>{user.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Blogs Created Section */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen size={13} className="text-blue-400" />
            <span>Articles Published ({userBlogs.length})</span>
          </h4>

          {userBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-white/5 rounded-xl text-slate-500 text-xs">
              <BookOpen size={20} className="mb-1.5 opacity-40" />
              <span>This staff user has not published any articles.</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 glass-scrollbar">
              {userBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="p-3 rounded-lg border border-white/5 bg-white/[0.005] hover:bg-white/[0.015] transition-all flex items-center gap-3 text-xs"
                >
                  {blog.thumbnail && (
                    <img
                      src={resolveImageUrl(blog.thumbnail)}
                      alt=""
                      className="w-12 h-12 rounded object-cover border border-white/10 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h5 className="font-semibold text-white truncate leading-snug">{blog.title}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 font-medium">
                        {blog.categoryBlog?.name || 'News'}
                      </span>
                      {blog.createdAt && (
                        <span className="flex items-center gap-0.5">
                          <Calendar size={9} />
                          {new Date(blog.createdAt).toLocaleDateString('en-US')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="glass-btn px-5 py-2 rounded-xl text-xs font-semibold"
          >
            Close Profile
          </button>
        </div>
      </div>
    </GlassModal>
  );
};

export default UserViewModal;
