import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, User, BookOpen, ExternalLink } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import BlogFormModal from './BlogFormModal';

const mapBlogFromBackend = (blog) => {
  if (!blog) return null;
  return {
    id: blog.id,
    title: blog.title || '',
    slug: blog.slug || '',
    content: blog.content || '',
    image: blog.thumbnail || blog.imageUrl || '',
    categoryId: blog.categoryBlog ? blog.categoryBlog.id : (blog.category ? blog.category.id : ''),
    authorId: blog.author ? blog.author.id : (blog.userId || ''),
    createdDate: blog.createdAt
  };
};

const Blogs = () => {
  const { blogs, categoriesBlog, users, addBlog, updateBlog, deleteBlog, uploadImage, resolveImageUrl } = useAdmin();

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
  const [currentBlog, setCurrentBlog] = useState(null);

  // Map raw data locally
  const mappedBlogs = (blogs || []).map(mapBlogFromBackend).filter(Boolean);
  const mappedUsers = (users || []).map(u => ({
    id: u.id,
    fullname: u.fullName || u.username,
    username: u.username || ''
  }));

  // Filter lists
  const filteredBlogs = mappedBlogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Modal Open Actions
  const handleOpenAdd = () => {
    setCurrentBlog(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setCurrentBlog(blog);
    setModalType('edit');
    setIsModalOpen(true);
  };

  // Submit Operations
  const handleFormSubmit = async (formData) => {
    const imgVal = formData.image || formData.thumbnail || '';
    const body = {
      categoryId: parseInt(formData.categoryId),
      authorId: parseInt(formData.authorId),
      title: formData.title,
      slug: formData.slug || '',
      content: formData.content,
      thumbnail: imgVal,
      imageUrl: imgVal
    };

    if (modalType === 'add') {
      await addBlog(body);
    } else {
      await updateBlog(formData.id, body);
    }
    setIsModalOpen(false);
  };

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
          <h2 className="text-xl font-bold text-white tracking-wide">Blogs & Articles</h2>
          <p className="text-xs text-slate-400">Total posts: {mappedBlogs.length} articles published</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Write Post
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg text-xs glass-input appearance-none bg-no-repeat bg-right bg-[#0F1224] text-white"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '16px', backgroundPosition: 'calc(100% - 8px) center' }}
            >
              <option value="all" className="bg-[#0F1224] text-white">All Blog Categories</option>
              {categoriesBlog.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-[#0F1224] text-white">{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
            <BookOpen size={24} className="text-slate-600 mb-2" />
            <p className="text-xs font-semibold">No articles found.</p>
          </div>
        ) : (
          filteredBlogs.map(blog => {
            const author = mappedUsers.find(u => u.id === blog.authorId);
            const category = categoriesBlog.find(c => c.id === blog.categoryId);
            return (
              <GlassCard key={blog.id} hoverEffect={true} className="flex flex-col justify-between group h-full">
                <div>
                  {/* Blog Cover Image */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-white/5 bg-slate-900">
                    <img 
                      src={resolveImageUrl(blog.image)} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
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
                  <a 
                    href={`/blog/${blog.slug}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] font-bold text-purple-400 flex items-center gap-1 hover:underline"
                  >
                    Preview View <ExternalLink size={10} />
                  </a>

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
          })
        )}
      </div>

      {/* Add / Edit Article Modal */}
      <BlogFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        blogData={currentBlog}
        categoriesBlog={categoriesBlog}
        users={mappedUsers}
        resolveImageUrl={resolveImageUrl}
        uploadImage={uploadImage}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Blogs;
