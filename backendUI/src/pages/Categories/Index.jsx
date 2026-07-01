import React, { useState } from 'react';
import { FolderKanban, Tags, Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import GlassModal from '../../components/GlassModal';

const Categories = () => {
  const { 
    categoriesProduct, categoriesBlog,
    addCategoryProduct, updateCategoryProduct, deleteCategoryProduct,
    addCategoryBlog, updateCategoryBlog, deleteCategoryBlog,
    uploadImage, resolveImageUrl
  } = useAdmin();

  // Navigation Tabs: 'product' or 'blog'
  const [activeTab, setActiveTab] = useState('product');

  // Search & Modal Management
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // add or edit

  // Form State
  const [currentCategory, setCurrentCategory] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    productCount: 0
  });

  const activeList = activeTab === 'product' ? categoriesProduct : categoriesBlog;

  // Filter list
  const filteredList = activeList.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setCurrentCategory({
      id: '',
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      productCount: 0
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCurrentCategory(cat);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCategory.name || !currentCategory.slug) {
      alert("Name and slug are required fields.");
      return;
    }

    if (activeTab === 'product') {
      if (modalType === 'add') {
        addCategoryProduct(currentCategory);
      } else {
        updateCategoryProduct(currentCategory);
      }
    } else {
      if (modalType === 'add') {
        addCategoryBlog(currentCategory);
      } else {
        updateCategoryBlog(currentCategory);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      if (activeTab === 'product') {
        deleteCategoryProduct(id);
      } else {
        deleteCategoryBlog(id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Category Taxonomies</h2>
          <p className="text-xs text-slate-400">Classify product inventories or blog articles</p>
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
                    <td className="py-3.5 font-bold text-white text-sm">
                      <div className="flex items-center gap-3">
                        <img 
                          src={resolveImageUrl(cat.imageUrl || cat.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80')} 
                          alt="" 
                          className="w-10 h-8 rounded object-cover border border-white/10 flex-shrink-0"
                        />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-purple-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <LinkIcon size={10} className="text-slate-500" />
                        <span>{cat.slug}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-400 max-w-[280px] truncate" title={cat.description}>
                      {cat.description}
                    </td>
                    <td className="py-3.5 text-slate-200 font-semibold font-mono">
                      {activeTab === 'product' ? cat.productCount : cat.postCount || 0} items
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded glass-btn text-blue-400 hover:border-blue-500/40"
                          title="Edit Category"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                          title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? `Add ${activeTab === 'product' ? 'Product' : 'Blog'} Category` : 'Edit Category Details'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name & Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Name *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Running Shoes"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Slug (URL segment) *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. running-shoes"
                value={currentCategory.slug}
                onChange={(e) => setCurrentCategory({...currentCategory, slug: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
          </div>

          {/* Banner cover Image */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Banner Image</label>
            <div className="flex items-center gap-4">
              {currentCategory.imageUrl ? (
                <img 
                  src={resolveImageUrl(currentCategory.imageUrl)} 
                  alt="Preview" 
                  className="w-12 h-10 rounded object-cover border border-purple-500/20" 
                />
              ) : (
                <div className="w-12 h-10 rounded bg-purple-600/10 border border-dashed border-purple-500/30 flex items-center justify-center text-slate-500 text-[9px]">No Pic</div>
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        const url = await uploadImage(file);
                        setCurrentCategory(prev => ({ ...prev, imageUrl: url }));
                      } catch (err) {
                        alert("Lỗi tải lên hình ảnh: " + err.message);
                      }
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 block mt-1">Upload a category icon/banner from your device.</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
            <textarea 
              rows="3"
              placeholder="Provide a description for classification guidelines..."
              value={currentCategory.description}
              onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Submit controls */}
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
