import React, { useState } from 'react';
import { Plus, Search, BookOpen, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import BlogFormModal from './BlogFormModal';
import BlogGridCard from './BlogGridCard';
import BlogListItem from './BlogListItem';
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
    createdDate: blog.createdAt,
    status: blog.status !== undefined ? blog.status : 1
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
  const [viewMode, setViewMode] = useState('grid');

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
    const matchesCategory = selectedCategory === 'all' || String(b.categoryId) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 6 : 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, viewMode]);

  const totalItems = filteredBlogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start === 1) {
        end = 5;
      } else if (end === totalPages) {
        start = totalPages - 4;
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

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

  const handleOpenView = (blog) => {
    setCurrentBlog(blog);
    setModalType('view');
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
      imageUrl: imgVal,
      status: parseInt(formData.status)
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

  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === 1 ? 0 : 1;
    const body = {
      categoryId: blog.categoryId,
      authorId: blog.authorId,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      thumbnail: blog.image,
      imageUrl: blog.image,
      status: newStatus
    };
    try {
      const updated = await blogService.update(blog.id, body);
      setBlogs(prev => prev.map(b => b.id === blog.id ? updated : b));
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái: " + err.message);
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
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex bg-[#0F1224]/50 border border-white/10 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <List size={16} />
            </button>
          </div>
          <button
            onClick={handleOpenAdd}
            className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus size={16} /> Write Post
          </button>
        </div>
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
              className="pl-3 pr-8 py-1.5 rounded-lg text-xs glass-input bg-[#0F1224] text-white"
            >
              <option value="all" className="bg-[#0F1224] text-white">All Blog Categories</option>
              {categoriesBlog.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-[#0F1224] text-white">{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Catalog Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBlogs.length === 0 ? (
            <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
              <BookOpen size={24} className="text-slate-600 mb-2" />
              <p className="text-xs font-semibold">No articles found.</p>
            </div>
          ) : (
            currentItems.map(blog => {
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
                  handleOpenView={handleOpenView}
                  handleOpenEdit={handleOpenEdit}
                  handleDelete={handleDelete}
                  handleToggleStatus={handleToggleStatus}
                />
              );
            })
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F1224]/50 backdrop-blur-md">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="p-3 font-semibold w-16">Image</th>
                <th className="p-3 font-semibold">Title & Excerpt</th>
                <th className="p-3 font-semibold w-32">Category</th>
                <th className="p-3 font-semibold w-32">Author & Date</th>
                <th className="p-3 font-semibold w-24">Status</th>
                <th className="p-3 font-semibold text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
                    No articles found.
                  </td>
                </tr>
              ) : (
                currentItems.map(blog => {
                  const author = mappedUsers.find(u => u.id === blog.authorId);
                  const category = categoriesBlog.find(c => c.id === blog.categoryId);
                  return (
                    <BlogListItem 
                      key={blog.id}
                      blog={blog}
                      author={author}
                      category={category}
                      formatDate={formatDate}
                      resolveImageUrl={resolveImageUrl}
                      handleOpenView={handleOpenView}
                      handleOpenEdit={handleOpenEdit}
                      handleDelete={handleDelete}
                      handleToggleStatus={handleToggleStatus}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 mt-4">
          <p className="text-xs text-slate-400 order-2 sm:order-1">
            Showing <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-semibold text-white">
              {Math.min(indexOfLastItem, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-white">{totalItems}</span> articles
          </p>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            {getVisiblePages().map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all duration-200 ${
                  currentPage === pageNumber
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "border-white/5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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
