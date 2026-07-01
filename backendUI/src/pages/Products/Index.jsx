import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, SlidersHorizontal, Image as ImageIcon, LayoutGrid, List } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import GlassModal from '../../components/GlassModal';

const Products = () => {
  const { products, categoriesProduct, addProduct, updateProduct, deleteProduct, uploadImage, resolveImageUrl } = useAdmin();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // add or edit

  // Form State
  const [currentProduct, setCurrentProduct] = useState({
    id: '',
    name: '',
    price: '',
    salePrice: '',
    stock: '',
    categoryId: '',
    image: '',
    status: 'Active',
    description: ''
  });

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Open Modal for Add
  const handleOpenAdd = () => {
    setCurrentProduct({
      id: '',
      name: '',
      price: '',
      salePrice: '',
      stock: '',
      categoryId: categoriesProduct[0]?.id || '',
      image: '',
      status: 'Active',
      description: ''
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setCurrentProduct(prev => ({ ...prev, image: url }));
      } catch (err) {
        alert("Lỗi tải lên hình ảnh: " + err.message);
      }
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.price || currentProduct.stock === '') {
      alert("Please fill in all required fields.");
      return;
    }

    if (modalType === 'add') {
      addProduct(currentProduct);
    } else {
      updateProduct(currentProduct);
    }
    setIsModalOpen(false);
  };

  // Delete Handler
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  // Status Style Helper
  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>;
    } else if (status === 'OutOfStock') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">Out of Stock</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">Draft</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Products Catalog</h2>
          <p className="text-xs text-slate-400">Total products: {products.length} items</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
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
              className="pl-3 pr-8 py-1.5 rounded-lg text-xs glass-input appearance-none bg-no-repeat bg-right"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '16px', backgroundPosition: 'calc(100% - 8px) center' }}
            >
              <option value="all">All Categories</option>
              {categoriesProduct.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 border border-white/5 rounded-lg p-1 bg-white/[0.02]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-purple-600/30 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-purple-600/30 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Catalog Render */}
      {filteredProducts.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
          <SlidersHorizontal size={36} className="text-slate-600 mb-2" />
          <p className="text-xs font-semibold">No products match your criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <GlassCard key={prod.id} hoverEffect={true} className="flex flex-col justify-between h-full group">
              <div>
                {/* Product Image Cover */}
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-white/5 bg-slate-900">
                  <img
                    src={resolveImageUrl(prod.image)}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(prod.status)}
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider font-mono">
                    {categoriesProduct.find(c => c.id === prod.categoryId)?.name || 'Uncategorized'}
                  </span>
                  <h3 className="font-bold text-white text-base truncate" title={prod.name}>
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                    {prod.description}
                  </p>
                </div>
              </div>

              {/* Product Pricing and Operations */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-white">${prod.salePrice.toFixed(2)}</span>
                    {prod.salePrice < prod.price && (
                      <span className="text-[10px] text-slate-500 line-through">${prod.price.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">Stock: <strong className="text-slate-200">{prod.stock}</strong> units</span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="p-2 rounded-lg glass-btn text-blue-400 hover:border-blue-500/40"
                    title="Edit product"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="p-2 rounded-lg glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                    title="Delete product"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        /* List Layout */
        <GlassCard hoverEffect={false}>
          <div className="overflow-x-auto glass-scrollbar -mx-5 px-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-medium">
                  <th className="py-3 pr-2">Cover</th>
                  <th className="py-3">Name</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Stock</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-2.5 pr-2">
                      <img src={resolveImageUrl(prod.image)} alt={prod.name} className="w-10 h-7 rounded object-cover border border-white/10" />
                    </td>
                    <td className="py-2.5 font-semibold text-white max-w-[200px] truncate" title={prod.name}>
                      {prod.name}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {categoriesProduct.find(c => c.id === prod.categoryId)?.name || 'Uncategorized'}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">${prod.salePrice.toFixed(2)}</span>
                        {prod.salePrice < prod.price && (
                          <span className="text-[10px] text-slate-500 line-through">${prod.price.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 font-mono">{prod.stock}</td>
                    <td className="py-2.5">{getStatusBadge(prod.status)}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded glass-btn text-blue-400 hover:border-blue-500/40"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
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
      )}

      {/* Add/Edit Product Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Add New Product' : 'Edit Product Details'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Aether Phone 15 Pro"
              value={currentProduct.name}
              onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-xs glass-input"
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original Price ($) *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                placeholder="999.00"
                value={currentProduct.price}
                onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sale Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Optional"
                value={currentProduct.salePrice}
                onChange={(e) => setCurrentProduct({ ...currentProduct, salePrice: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
          </div>

          {/* Stock & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock Count *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="50"
                value={currentProduct.stock}
                onChange={(e) => setCurrentProduct({ ...currentProduct, stock: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category *</label>
              <select
                value={currentProduct.categoryId}
                onChange={(e) => setCurrentProduct({ ...currentProduct, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs glass-input bg-[#0F1224]"
              >
                {categoriesProduct.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Publish Status</label>
            <div className="flex gap-4">
              {['Active', 'OutOfStock', 'Draft'].map(s => (
                <label key={s} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="modal-status"
                    checked={currentProduct.status === s}
                    onChange={() => setCurrentProduct({ ...currentProduct, status: s })}
                    className="accent-purple-600"
                  />
                  <span>{s === 'OutOfStock' ? 'Out of Stock' : s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Image File Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Image *</label>
            <div className="flex items-center gap-4">
              {currentProduct.image && (
                <img src={resolveImageUrl(currentProduct.image)} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-purple-500/20" />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:cursor-pointer glass-input cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 block mt-1">Select an image file from your device.</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
            <textarea
              rows="3"
              placeholder="Write product specs or overview..."
              value={currentProduct.description}
              onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
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
              Save Product
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};

export default Products;
