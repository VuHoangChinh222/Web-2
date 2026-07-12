import React, { useState } from 'react';
import { FolderKanban, Tags, Plus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import CategoryFormModal from './CategoryFormModal';
import CategoryListItem from './CategoryListItem';
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
    postCount: (blogs || []).filter(b => b.categoryBlog?.id === cat.id || b.category?.id === cat.id || b.categoryId === cat.id).length
  }));

  const activeList = activeTab === 'product' ? mappedCategoriesProduct : mappedCategoriesBlog;

  // Filter list
  const filteredList = activeList.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        alert("Cannot delete category: There are products in this category.");
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
      const hasBlogs = blogs.some(b => b.categoryBlog?.id === id || b.category?.id === id || b.categoryId === id);
      if (hasBlogs) {
        alert("Cannot delete category: There are posts in this category.");
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
                  <CategoryListItem
                    key={cat.id}
                    cat={cat}
                    activeTab={activeTab}
                    resolveImageUrl={resolveImageUrl}
                    handleOpenEdit={handleOpenEdit}
                    handleDelete={handleDelete}
                  />
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
