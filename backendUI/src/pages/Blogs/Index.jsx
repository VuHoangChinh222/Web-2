import React, { useState } from 'react';
import { Plus, Search, BookOpen } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import BlogFormModal from './BlogFormModal';
import BlogGridCard from './BlogGridCard';
import blogService from '../../services/blogService';

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
  const { blogs, setBlogs, categoriesBlog, users, uploadImage, resolveImageUrl } = useAdmin();

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

    try {
      if (modalType === 'add') {
        const newBlog = await blogService.create(body);
        setBlogs(prev => [newBlog, ...prev]);
      } else {
        const updated = await blogService.update(formData.id, body);
        setBlogs(prev => prev.map(b => b.id === formData.id ? updated : b));
      }
    } catch (err) {
      alert("Lỗi khi lưu bài viết: " + err.message);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        await blogService.delete(id);
        setBlogs(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        alert("Lỗi khi xóa bài viết: " + err.message);
      }
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
              <BlogGridCard 
                key={blog.id}
                blog={blog}
                author={author}
                category={category}
                formatDate={formatDate}
                resolveImageUrl={resolveImageUrl}
                handleOpenEdit={handleOpenEdit}
                handleDelete={handleDelete}
              />
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
