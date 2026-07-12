import React, { useState } from 'react';
import { Plus, Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import ProductFormModal from './ProductFormModal';
import ProductViewModal from './ProductViewModal';
import ProductGridCard from './ProductGridCard';
import ProductListItem from './ProductListItem';
import ProductVariantModal from './ProductVariantModal';
import productService from '../../services/productService';
import productImageService from '../../services/productImageService';

const mapProductFromBackend = (prod) => {
  if (!prod) return null;
  return {
    id: prod.id,
    name: prod.name,
    slug: prod.slug || '',
    description: prod.description || '',
    shortDescription: prod.shortDescription || '',
    price: prod.basePrice ? parseFloat(prod.basePrice) : 0,
    salePrice: prod.discountPrice ? parseFloat(prod.discountPrice) : (prod.basePrice ? parseFloat(prod.basePrice) : 0),
    stock: prod.stockQuantity !== undefined && prod.stockQuantity !== null ? prod.stockQuantity : 0,
    categoryId: prod.category ? prod.category.id : '',
    category: prod.category,
    variants: prod.variants || [],
    image: prod.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
    status: prod.status === 1 ? 'Active' : (prod.status === 2 ? 'OutOfStock' : 'Draft'),
    createdAt: prod.createdAt
  };
};

const Products = () => {
  const { products, setProducts, categoriesProduct, orderDetails, uploadImage, resolveImageUrl } = useAdmin();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentProduct, setCurrentProduct] = useState(null);

  // Map products locally
  const mappedProducts = (products || []).map(mapProductFromBackend).filter(Boolean);

  // Filtering
  const filteredProducts = mappedProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleOpenView = (product) => {
    setCurrentProduct(product);
    setIsViewModalOpen(true);
  };

  const handleOpenVariants = (product) => {
    setCurrentProduct(product);
    setIsVariantModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const body = {
      categoryId: parseInt(formData.categoryId),
      name: formData.name,
      slug: formData.slug || '',
      shortDescription: formData.shortDescription || '',
      description: formData.description || '',
      thumbnail: formData.thumbnail || formData.image || '',
      basePrice: parseFloat(formData.price),
      discountPrice: parseFloat(formData.salePrice || formData.price),
      status: formData.status === 'Active' ? 1 : (formData.status === 'OutOfStock' ? 2 : 0)
    };

    try {
      if (modalType === 'add') {
        const newProduct = await productService.create(body);
        if (formData.additionalImages && formData.additionalImages.length > 0) {
          try {
            await Promise.all(formData.additionalImages.map(img =>
              productImageService.create({ productId: newProduct.id, imageUrl: img.imageUrl, color: img.color })
            ));
          } catch (e) {
            console.error("Error syncing additional images (Create):", e);
          }
        }
        setProducts(prev => [newProduct, ...prev]);
      } else {
        const updated = await productService.update(formData.id, body);
        if (formData.additionalImages) {
          const newImages = formData.additionalImages.filter(img => img.isNew);
          const existingImages = formData.additionalImages.filter(img => !img.isNew && img.id);
          try {
            if (newImages.length > 0) {
              await Promise.all(newImages.map(img =>
                productImageService.create({ productId: formData.id, imageUrl: img.imageUrl, color: img.color })
              ));
            }
            if (existingImages.length > 0) {
              await Promise.all(existingImages.map(img =>
                productImageService.update(img.id, { productId: formData.id, imageUrl: img.imageUrl, color: img.color })
              ));
            }
          } catch (e) {
            console.error("Error syncing additional images (Update):", e);
          }
        }
        setProducts(prev => prev.map(p => p.id === formData.id ? updated : p));
      }
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (prod) => {
    const newStatus = prod.status === 'Active' ? 0 : 1;
    const body = {
      categoryId: prod.categoryId,
      name: prod.name,
      slug: prod.slug || '',
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      thumbnail: prod.image || '',
      basePrice: prod.price,
      discountPrice: prod.salePrice || prod.price,
      status: newStatus
    };
    try {
      const updated = await productService.update(prod.id, body);
      setProducts(prev => prev.map(p => p.id === prod.id ? updated : p));
    } catch (err) {
      alert("Error changing status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    const hasOrders = orderDetails.some(det => det.productId === id);
    if (hasOrders) {
      alert("Cannot delete product: It is already linked to existing orders.");
      return;
    }
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.delete(id);
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert("Error deleting product: " + err.message);
      }
    }
  };

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Products Catalog</h2>
          <p className="text-xs text-slate-400">Total products: {mappedProducts.length} items</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0F1224]/30 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg text-xs glass-input appearance-none bg-no-repeat bg-right bg-[#0F1224] text-white"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '16px', backgroundPosition: 'calc(100% - 8px) center' }}
            >
              <option value="all" className="bg-[#0F1224] text-white">All Categories</option>
              {categoriesProduct.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-[#0F1224] text-white">{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

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

      {filteredProducts.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-2xl bg-[#0F1224]/10">
          <SlidersHorizontal size={36} className="text-slate-600 mb-2" />
          <p className="text-xs font-semibold">No products match your criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <ProductGridCard
              key={prod.id}
              prod={prod}
              categoriesProduct={categoriesProduct}
              getStatusBadge={getStatusBadge}
              resolveImageUrl={resolveImageUrl}
              handleOpenView={handleOpenView}
              handleOpenEdit={handleOpenEdit}
              handleOpenVariants={handleOpenVariants}
              handleDelete={handleDelete}
              handleToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
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
                  <ProductListItem
                    key={prod.id}
                    prod={prod}
                    categoriesProduct={categoriesProduct}
                    getStatusBadge={getStatusBadge}
                    resolveImageUrl={resolveImageUrl}
                    handleOpenView={handleOpenView}
                    handleOpenEdit={handleOpenEdit}
                    handleOpenVariants={handleOpenVariants}
                    handleDelete={handleDelete}
                    handleToggleStatus={handleToggleStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        productData={currentProduct}
        categoriesProduct={categoriesProduct}
        resolveImageUrl={resolveImageUrl}
        uploadImage={uploadImage}
        onSubmit={handleFormSubmit}
      />

      <ProductViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        productData={currentProduct}
        categoriesProduct={categoriesProduct}
        resolveImageUrl={resolveImageUrl}
      />

      {isVariantModalOpen && (
        <ProductVariantModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          product={currentProduct}
        />
      )}
    </div>
  );
};

export default Products;
