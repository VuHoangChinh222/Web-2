import React, { useState } from 'react';
import { FolderKanban, Tags, Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import CategoryFormModal from './CategoryFormModal';
import categoryProductService from '../../services/categoryProductService';
import categoryBlogService from '../../services/categoryBlogService';

const Categories = () => {
  const { 
    categoriesProduct, setCategoriesProduct,
    categoriesBlog, setCategoriesBlog,
    products, blogs,
    uploadImage, resolveImageUrl
  } = useAdmin();

  // Navigation Tabs: 'product' or 'blog'
  const [activeTab, setActiveTab] = useState('product');

  // Search & Modal Management
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // add or edit
  const [currentCategory, setCurrentCategory] = useState(null);

  // Map collections locally and calculate counts
  const mappedCategoriesProduct = (categoriesProduct || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug || '',
    description: cat.description || '',
    imageUrl: cat.imageUrl || '',
    status: cat.status,
    productCount: (products || []).filter(p => p.category?.id === cat.id || p.categoryId === cat.id).length
  }));

  const mappedCategoriesBlog = (categoriesBlog || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug || '',
    description: cat.description || '',
    imageUrl: cat.imageUrl || '',
    status: cat.status,
    postCount: (blogs || []).filter(b => b.category?.id === cat.id || b.categoryId === cat.id).length
  }));

  const activeList = activeTab === 'product' ? mappedCategoriesProduct : mappedCategoriesBlog;

  // Filter list
  const filteredList = activeList.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setCurrentCategory(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCurrentCategory(cat);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const body = {
      name: formData.name,
      slug: formData.slug || '',
      description: formData.description || '',
      imageUrl: formData.imageUrl || formData.image || '',
      status: formData.status !== undefined ? formData.status : 1
    };

    try {
      if (activeTab === 'product') {
        if (modalType === 'add') {
          const newCat = await categoryProductService.create(body);
          setCategoriesProduct(prev => [...prev, newCat]);
        } else {
          const updated = await categoryProductService.update(formData.id, body);
          setCategoriesProduct(prev => prev.map(c => c.id === formData.id ? updated : c));
        }
      } else {
        if (modalType === 'add') {
          const newCat = await categoryBlogService.create(body);
          setCategoriesBlog(prev => [...prev, newCat]);
        } else {
          const updated = await categoryBlogService.update(formData.id, body);
          setCategoriesBlog(prev => prev.map(c => c.id === formData.id ? updated : c));
        }
      }
    } catch (err) {
      alert("Lỗi khi lưu danh mục: " + err.message);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (activeTab === 'product') {
      const hasProducts = products.some(p => p.category?.id === id || p.categoryId === id);
      if (hasProducts) {
        alert("Không thể xóa danh mục: Có sản phẩm đang thuộc danh mục này.");
        return;
      }
      if (confirm("Are you sure you want to delete this category?")) {
        try {
          await categoryProductService.delete(id);
          setCategoriesProduct(prev => prev.filter(c => c.id !== id));
        } catch (err) {
          alert("Lỗi khi xóa danh mục sản phẩm: " + err.message);
        }
      }
    } else {
      const hasBlogs = blogs.some(b => b.category?.id === id || b.categoryId === id);
      if (hasBlogs) {
        alert("Không thể xóa danh mục: Có bài viết đang thuộc danh mục này.");
        return;
      }
      if (confirm("Are you sure you want to delete this category?")) {
        try {
          await categoryBlogService.delete(id);
          setCategoriesBlog(prev => prev.filter(c => c.id !== id));
        } catch (err) {
          alert("Lỗi khi xóa danh mục bài viết: " + err.message);
        }
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
          className={`toggle-tab px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all
            ${activeTab === 'product' 
              ? 'border-purple-500 text-purple-300 bg-gradient-to-t from-purple-500/5 to-transparent' 
              : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <FolderKanban size={14} /> Product Categories
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`toggle-tab px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all
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
                {filteredList.map((cat) => (
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
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeTab={activeTab}
        modalType={modalType}
        categoryData={currentCategory}
        resolveImageUrl={resolveImageUrl}
        uploadImage={uploadImage}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Categories;
