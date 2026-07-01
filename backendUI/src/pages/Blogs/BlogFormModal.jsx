import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';

const BlogFormModal = ({
  isOpen,
  onClose,
  modalType,
  blogData,
  categoriesBlog,
  users,
  resolveImageUrl,
  uploadImage,
  onSubmit
}) => {
  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    image: '',
    content: '',
    categoryId: '',
    authorId: '',
    createdDate: '',
    status: 'Published'
  });

  useEffect(() => {
    if (isOpen) {
      if (modalType === 'add') {
        setForm({
          id: '',
          title: '',
          slug: '',
          image: '',
          content: '',
          categoryId: categoriesBlog[0]?.id || '',
          authorId: users[0]?.id || '',
          createdDate: new Date().toISOString(),
          status: 'Published'
        });
      } else if (blogData) {
        setForm(blogData);
      }
    }
  }, [isOpen, modalType, blogData, categoriesBlog, users]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setForm(prev => ({ ...prev, image: url }));
      } catch (err) {
        alert("Lỗi tải lên hình ảnh: " + err.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) {
      alert("Please fill in Title, Slug, and content details.");
      return;
    }
    onSubmit(form);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'add' ? 'Write New Blog Post' : 'Edit Post Details'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Title */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Post Title *</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Modern Fashion Trends of 2026"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Slug & category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Slug (URL segment) *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. modern-fashion-trends-2026"
              value={form.slug}
              onChange={(e) => setForm({...form, slug: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Taxonomy *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({...form, categoryId: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
            >
              {categoriesBlog.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Author/User Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assign Author (User)</label>
          <select
            value={form.authorId}
            onChange={(e) => setForm({...form, authorId: e.target.value})}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
          >
            {users.map(usr => (
              <option key={usr.id} value={usr.id}>{usr.fullname} ({usr.username})</option>
            ))}
          </select>
        </div>

        {/* Image File Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Post Cover Image *</label>
          <div className="flex items-center gap-4">
            {form.image && (
              <img src={resolveImageUrl(form.image)} alt="Preview" className="w-14 h-10 rounded object-cover border border-purple-500/20" />
            )}
            <div className="flex-1">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 block mt-1">Select an image banner from your device.</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Article Content *</label>
          <textarea 
            rows="6"
            required
            placeholder="Write Markdown or standard textual content..."
            value={form.content}
            onChange={(e) => setForm({...form, content: e.target.value})}
            className="w-full px-3 py-2 rounded-lg text-xs glass-input"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button 
            type="button" 
            onClick={onClose}
            className="glass-btn px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="glass-btn-primary px-5 py-2 rounded-xl text-xs font-semibold"
          >
            Publish Post
          </button>
        </div>
      </form>
    </GlassModal>
  );
};

export default BlogFormModal;
