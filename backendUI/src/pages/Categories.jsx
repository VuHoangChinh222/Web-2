import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FolderKanban, Tags, Link as LinkIcon } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';

const Categories = () => {
  const { 
    categoriesProduct, categoriesBlog,
    addCategoryProduct, updateCategoryProduct, deleteCategoryProduct,
    addCategoryBlog, updateCategoryBlog, deleteCategoryBlog
  } = useAdmin();

  // Navigation Tabs: 'product' or 'blog'
  const [activeTab, setActiveTab] = useState('product');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // add or edit
  
  // Form State
  const [currentCategory, setCurrentCategory] = useState({
    id: '',
    name: '',
    slug: '',
    description: ''
  });

  // Helper to generate slug from Vietnamese or English text
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD') // remove accents
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setCurrentCategory({
      ...currentCategory,
      name,
      slug: generateSlug(name)
    });
  };

  // Open Actions
  const handleOpenAdd = () => {
    setCurrentCategory({ id: '', name: '', slug: '', description: '' });
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setCurrentCategory(category);
    setModalType('edit');
    setIsModalOpen(true);
  };

  // Submit Operations
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCategory.name || !currentCategory.slug) {
      alert("Name and Slug are required.");
      return;
    }

    if (activeTab === 'product') {
      if (modalType === 'add') addCategoryProduct(currentCategory);
      else updateCategoryProduct(currentCategory);
    } else {
      if (modalType === 'add') addCategoryBlog(currentCategory);
      else updateCategoryBlog(currentCategory);
    }
    setIsModalOpen(false);
  };

  // Delete Operations
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      if (activeTab === 'product') {
        deleteCategoryProduct(id);
      } else {
        deleteCategoryBlog(id);
      }
    }
  };

  // Select list based on active tab
  const activeList = activeTab === 'product' ? categoriesProduct : categoriesBlog;

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Category Management</h2>
          <p className="text-xs text-slate-400">Classify your products and articles</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Categories Tabs Toggle */}
      <div className="flex border-b border-white/5 gap-2">
        <button
          onClick={() => setActiveTab('product')}
          className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all
            ${activeTab === 'product' 
              ? 'border-purple-500 text-purple-300 bg-gradient-to-t from-purple-500/5 to-transparent' 
              : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <FolderKanban size={14} /> Product Categories
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all
            ${activeTab === 'blog' 
              ? 'border-purple-500 text-purple-300 bg-gradient-to-t from-purple-500/5 to-transparent' 
              : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Tags size={14} /> Blog Categories
        </button>
      </div>

      {/* Category List Panel */}
      <div className="grid grid-cols-1 gap-6">
        <GlassCard hoverEffect={false}>
          <div className="overflow-x-auto glass-scrollbar -mx-5 px-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-medium">
                  <th className="py-3 pr-2">ID</th>
                  <th className="py-3">Name</th>
                  <th className="py-3">Slug</th>
                  <th className="py-3">Description</th>
                  <th className="py-3">Assigned Items</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeList.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 pr-2 font-mono text-slate-400">{cat.id}</td>
                    <td className="py-3.5 font-bold text-white text-sm">{cat.name}</td>
                    <td className="py-3.5 font-mono text-purple-400 text-[11px] flex items-center gap-1">
                      <LinkIcon size={10} className="text-slate-500" />
                      <span>{cat.slug}</span>
                    </td>
                    <td className="py-3.5 text-slate-400 max-w-[280px] truncate" title={cat.description}>
                      {cat.description || 'No description provided.'}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {activeTab === 'product' ? `${cat.productCount} products` : `${cat.blogCount} articles`}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded glass-btn text-blue-400 hover:border-blue-500/40"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Add/Edit Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? `Create ${activeTab === 'product' ? 'Product' : 'Blog'} Category` : 'Modify Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Name *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Next-Gen Hardware"
              value={currentCategory.name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Slug URL *</label>
            <input 
              type="text" 
              required
              placeholder="next-gen-hardware"
              value={currentCategory.slug}
              onChange={(e) => setCurrentCategory({...currentCategory, slug: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input font-mono text-purple-300"
            />
            <p className="text-[9px] text-slate-500">Automatically generated from the category name, used for SEO-friendly URLs.</p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
            <textarea 
              rows="3"
              placeholder="Provide a short details summary for catalog classifications..."
              value={currentCategory.description}
              onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Action buttons */}
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
              Save Category
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};

export default Categories;
