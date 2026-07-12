import React, { useState, useEffect } from 'react';
import { Plus, Search, SlidersHorizontal, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';
import ProductForm from './ProductForm';
import ProductViewModal from './ProductViewModal';
import ProductGridCard from './ProductGridCard';
import ProductListItem from './ProductListItem';
import ProductVariantModal from './ProductVariantModal';
import productService from '../../services/productService';
import productImageService from '../../services/productImageService';
import productVariantService from '../../services/productVariantService';

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

const formatApiError = (errorMsg) => {
  if (!errorMsg) return "An error occurred while connecting to the server.";
  
  let msg = errorMsg;
  try {
    const parsed = JSON.parse(errorMsg);
    if (parsed.message) {
      msg = parsed.message;
    } else if (parsed.error) {
      msg = parsed.error;
    }
  } catch (e) {
    // Not a JSON string
  }

  // Parse common error messages
  if (msg.includes("Data truncation") || msg.includes("too long")) {
    if (msg.includes("short_description") || msg.includes("shortDescription")) {
      return "The product short description is too long. Please shorten it.";
    }
    if (msg.includes("name")) {
      return "The product name is too long. Maximum length is 200 characters.";
    }
    return "The input data is too long for the database column limit.";
  }
  
  if (msg.includes("already exists")) {
    if (msg.includes("slug")) {
      return "This product name or slug already exists in the system.";
    }
    return `Information already exists: ${msg}`;
  }
  
  if (msg.includes("Category ID is required") || msg.includes("categoryId")) {
    return "Please select a category for the product.";
  }
  if (msg.includes("Base price is required") || msg.includes("basePrice")) {
    return "Please enter a base price for the product.";
  }
  if (msg.includes("Discount price cannot be greater than base price") || msg.includes("discountPrice")) {
    return "Discount price cannot be greater than the base price.";
  }

  return msg;
};

const Products = () => {
  const { products, setProducts, categoriesProduct, orderDetails, uploadImage, resolveImageUrl } = useAdmin();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const [currentView, setCurrentView] = useState('list'); // 'list' | 'form'
  const [modalType, setModalType] = useState('add');

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 6 : 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, viewMode]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

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

  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setModalType('add');
    setCurrentView('form');
  };

  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setModalType('edit');
    setCurrentView('form');
  };

  const handleOpenView = (product) => {
    setCurrentProduct(product);
    setIsViewModalOpen(true);
  };

  const handleOpenVariants = (product) => {
    setCurrentProduct(product);
    setIsVariantModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    const { general, isVariable, variants, images } = payload;

    // Auto-calculate base price from variants if variable
    let finalBasePrice = parseFloat(general.price) || 0;
    let finalSalePrice = parseFloat(general.salePrice) || finalBasePrice;

    if (isVariable && variants.length > 0) {
      const validPrices = variants.map(v => parseFloat(v.price)).filter(p => !isNaN(p) && p > 0);
      if (validPrices.length > 0) {
        finalBasePrice = Math.min(...validPrices);
      } else {
        finalBasePrice = 1000;
      }
      finalSalePrice = finalBasePrice;
    }

    const body = {
      categoryId: parseInt(general.categoryId),
      name: general.name,
      slug: general.slug || '',
      shortDescription: general.shortDescription || '',
      description: general.description || '',
      thumbnail: general.image || '',
      basePrice: finalBasePrice,
      discountPrice: finalSalePrice,
      status: general.status === 'Active' ? 1 : (general.status === 'OutOfStock' ? 2 : 0)
    };

    try {
      if (modalType === 'add') {
        const savedProduct = await productService.create(body);

        // Create Variants
        if (isVariable && variants.length > 0) {
          const variantsPayload = variants.map(v => ({
            productId: savedProduct.id, size: v.size || '', color: v.color || '',
            price: v.price ? parseFloat(v.price) : null, salePrice: null,
            stockQuantity: parseInt(v.stockQuantity) || 0, sku: v.sku || '', status: v.status || 1
          }));
          await productVariantService.createBulk(variantsPayload);
        }

        // Create Images
        if (images && images.length > 0) {
          await Promise.all(images.map((img, idx) => productImageService.create({
            productId: savedProduct.id, imageUrl: img.imageUrl, color: img.color, sortOrder: idx
          })));
        }

        const refreshedProduct = await productService.getProductById(savedProduct.id);
        setProducts(prev => [refreshedProduct, ...prev]);

      } else {
        const savedProduct = await productService.update(general.id, body);

        // Update Variants
        if (isVariable) {
          const originalVariants = currentProduct.variants || [];
          const newVariants = variants.filter(v => v.isNew);
          const updatedVariants = variants.filter(v => !v.isNew);
          const currentVariantIds = variants.filter(v => !v.isNew).map(v => v.id);
          const deletedVariants = originalVariants.filter(v => !currentVariantIds.includes(v.id));

          // Delete
          for (let v of deletedVariants) await productVariantService.delete(v.id);
          // Update
          for (let v of updatedVariants) {
            await productVariantService.update(v.id, {
              productId: general.id, size: v.size || '', color: v.color || '',
              price: v.price ? parseFloat(v.price) : null,
              stockQuantity: parseInt(v.stockQuantity) || 0, sku: v.sku || '', status: v.status || 1
            });
          }
          // Create
          if (newVariants.length > 0) {
            const createPayload = newVariants.map(v => ({
              productId: general.id, size: v.size || '', color: v.color || '',
              price: v.price ? parseFloat(v.price) : null, salePrice: null,
              stockQuantity: parseInt(v.stockQuantity) || 0, sku: v.sku || '', status: v.status || 1
            }));
            await productVariantService.createBulk(createPayload);
          }
        }

        // Update Images
        if (images) {
          const newImages = images.map((img, idx) => ({ ...img, sortOrder: idx })).filter(i => i.isNew);
          const existingImages = images.map((img, idx) => ({ ...img, sortOrder: idx })).filter(i => !i.isNew && i.id);
          if (newImages.length > 0) {
            await Promise.all(newImages.map(img => productImageService.create({ productId: general.id, imageUrl: img.imageUrl, color: img.color, sortOrder: img.sortOrder })));
          }
          if (existingImages.length > 0) {
            await Promise.all(existingImages.map(img => productImageService.update(img.id, { productId: general.id, imageUrl: img.imageUrl, color: img.color, sortOrder: img.sortOrder })));
          }
        }

        const refreshedProduct = await productService.getProductById(savedProduct.id);
        setProducts(prev => prev.map(p => p.id === general.id ? refreshedProduct : p));
      }
      setCurrentView('list');
    } catch (err) {
      alert("Error saving product: " + formatApiError(err.message));
    }
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
      alert("Error changing status: " + formatApiError(err.message));
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
        alert("Error deleting product: " + formatApiError(err.message));
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

  if (currentView === 'form') {
    return (
      <div className="h-[calc(100vh-80px)]">
        <ProductForm
          productData={currentProduct}
          categoriesProduct={categoriesProduct}
          resolveImageUrl={resolveImageUrl}
          uploadImage={uploadImage}
          onSave={handleFormSubmit}
          onCancel={() => setCurrentView('list')}
          isEditMode={modalType === 'edit'}
        />
      </div>
    );
  }

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
          {currentItems.map((prod) => (
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
                {currentItems.map((prod) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 mt-4">
          <p className="text-xs text-slate-400 order-2 sm:order-1">
            Showing <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-semibold text-white">
              {Math.min(indexOfLastItem, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-white">{totalItems}</span> products
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
