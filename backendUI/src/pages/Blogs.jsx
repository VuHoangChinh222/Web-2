import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, User, BookOpen, ExternalLink } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';

const Blogs = () => {
  const { blogs, categoriesBlog, users, addBlog, updateBlog, deleteBlog } = useAdmin();

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute, second).toLocaleDateString();
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');

  // Form State
  const [currentBlog, setCurrentBlog] = useState({
    id: '',
    title: '',
    summary: '',
    content: '',
    categoryId: '',
    authorId: '',
    image: '',
    status: 'Published'
  });



  // Filters
  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Open Actions
  const handleOpenAdd = () => {
    setCurrentBlog({
      id: '',
      title: '',
      summary: '',
      content: '',
      categoryId: categoriesBlog[0]?.id || '',
      authorId: users[0]?.id || '',
      image: '',
      status: 'Published'
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setCurrentBlog(blog);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentBlog(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Operations
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentBlog.title || !currentBlog.summary || !currentBlog.content) {
      alert("Please enter title, summary and content.");
      return;
    }

    if (modalType === 'add') {
      addBlog(currentBlog);
    } else {
      updateBlog(currentBlog);
    }
    setIsModalOpen(false);
  };

  // Delete Operations
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteBlog(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Blog Management</h2>
          <p className="text-xs text-slate-400">Total articles: {blogs.length} posts</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Write Article
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="relative flex-1 min-w-[200px] w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search blogs by title, summary..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs glass-input"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="pl-3 pr-8 py-1.5 rounded-lg text-xs glass-input appearance-none bg-no-repeat bg-right bg-[#090A10]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '16px', backgroundPosition: 'calc(100% - 8px) center' }}
        >
          <option value="all">All Blog Categories</option>
          {categoriesBlog.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
            <BookOpen size={36} className="text-slate-600 mb-2" />
            <p className="text-xs font-semibold">No articles found.</p>
          </div>
        ) : (
          filteredBlogs.map(blog => {
            const author = users.find(u => u.id === blog.authorId);
            const category = categoriesBlog.find(c => c.id === blog.categoryId);
            return (
              <GlassCard key={blog.id} hoverEffect={true} className="flex flex-col justify-between h-full group relative overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {blog.status === 'Published' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Published</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Draft</span>
                  )}
                </div>

                <div>
                  {/* Banner cover */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-white/5 bg-slate-900">
                    <img 
                      src={blog.image} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono mb-2">
                    <span className="text-purple-400 font-semibold uppercase">{category ? category.name : 'General'}</span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(blog.createdAt)}</span>
                  </div>

                  {/* Title & summary */}
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {blog.summary}
                  </p>
                </div>

                {/* Footer bar */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  {/* Author detail */}
                  <div className="flex items-center gap-2">
                    <img src={author?.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                    <span className="text-[11px] text-slate-300 font-medium">{author ? author.fullname : 'System Admin'}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenEdit(blog)}
                      className="p-1.5 rounded glass-btn text-blue-400 hover:border-blue-500/40"
                      title="Edit article"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDelete(blog.id)}
                      className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                      title="Delete article"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Add / Edit Blog Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Write New Article' : 'Edit Blog Post'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Post Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Next-Gen Computing Architecture"
              value={currentBlog.title}
              onChange={(e) => setCurrentBlog({...currentBlog, title: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Category, Author & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category *</label>
              <select
                value={currentBlog.categoryId}
                onChange={(e) => setCurrentBlog({...currentBlog, categoryId: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
              >
                {categoriesBlog.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Author *</label>
              <select
                value={currentBlog.authorId}
                onChange={(e) => setCurrentBlog({...currentBlog, authorId: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullname}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
              <select
                value={currentBlog.status}
                onChange={(e) => setCurrentBlog({...currentBlog, status: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Image File Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cover Image *</label>
            <div className="flex items-center gap-4">
              {currentBlog.image && (
                <img src={currentBlog.image} alt="Preview" className="w-20 h-12 rounded-lg object-cover border border-purple-500/20" />
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 block mt-1">Select an article cover photo.</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Article Summary *</label>
            <input 
              type="text" 
              required
              placeholder="Short paragraph summary..."
              value={currentBlog.summary}
              onChange={(e) => setCurrentBlog({...currentBlog, summary: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detailed Content *</label>
            <textarea 
              rows="6"
              required
              placeholder="Write the full content body of the post..."
              value={currentBlog.content}
              onChange={(e) => setCurrentBlog({...currentBlog, content: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="glass-btn px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="glass-btn-primary px-5 py-2 rounded-xl text-xs font-semibold"
            >
              Publish Article
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};

export default Blogs;
