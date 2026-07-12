import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';
import productVariantService from '../../services/productVariantService';
import { Save, X, Edit2, Trash2, AlertCircle, CheckCircle2, Plus, Layers } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const ProductVariantModal = ({ isOpen, onClose, product }) => {
  const { uploadImage, resolveImageUrl, setProducts } = useAdmin();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Single Add Mode
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState({ size: '', color: '', price: '', salePrice: '', stockQuantity: 0, sku: '', status: 1 });

  // Bulk Add Mode
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkSizes, setBulkSizes] = useState('');
  const [bulkColors, setBulkColors] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkSalePrice, setBulkSalePrice] = useState('');
  const [bulkStock, setBulkStock] = useState(10);

  // Edit Mode
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(null);

  const updateGlobalProductVariants = (updatedVariants) => {
    if (setProducts && product) {
      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === product.id) {
          return { ...p, variants: updatedVariants };
        }
        return p;
      }));
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      fetchVariants();
      setIsAdding(false);
      setIsBulkAdding(false);
      setEditingId(null);
    }
  }, [isOpen, product]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const res = await productVariantService.getByProductId(product.id, 0, 100);
      const list = res.content || res.Content || res || [];
      setVariants(list);
      updateGlobalProductVariants(list);
    } catch (err) {
      alert("Error loading variants: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Create Single Variant ---
  const handleSaveNew = async () => {
    if (!newRow.size || !newRow.color || newRow.stockQuantity === '') {
      alert("Please fill in Size, Color, and Stock fields!");
      return;
    }

    try {
      const payload = {
        productId: product.id,
        size: newRow.size.trim(),
        color: newRow.color.trim(),
        price: newRow.price ? parseFloat(newRow.price) : null,
        salePrice: newRow.salePrice ? parseFloat(newRow.salePrice) : null,
        stockQuantity: parseInt(newRow.stockQuantity),
        sku: newRow.sku.trim() || "",
        status: newRow.status
      };

      const saved = await productVariantService.create(payload);
      const updatedList = [...variants, saved];
      setVariants(updatedList);
      updateGlobalProductVariants(updatedList);
      setIsAdding(false);
      setNewRow({ size: '', color: '', price: '', salePrice: '', stockQuantity: 0, sku: '', status: 1 });
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  // --- Bulk Generate Variants ---
  const handleBulkGenerate = async () => {
    if (!bulkSizes || !bulkColors || bulkStock === '') {
      alert("Sizes, Colors, and Stock are required for bulk generation!");
      return;
    }

    const sizes = bulkSizes.split(',').map(s => s.trim()).filter(s => s);
    const colors = bulkColors.split(',').map(c => c.trim()).filter(c => c);

    if (sizes.length === 0 || colors.length === 0) {
      alert("Please provide at least one size and one color.");
      return;
    }

    const payload = [];
    sizes.forEach(size => {
      colors.forEach(color => {
        payload.push({
          productId: product.id,
          size,
          color,
          price: bulkPrice ? parseFloat(bulkPrice) : null,
          salePrice: bulkSalePrice ? parseFloat(bulkSalePrice) : null,
          stockQuantity: parseInt(bulkStock),
          sku: "",
          status: 1
        });
      });
    });

    try {
      setLoading(true);
      const savedVariants = await productVariantService.createBulk(payload);
      const updatedList = [...variants, ...savedVariants];
      setVariants(updatedList);
      updateGlobalProductVariants(updatedList);
      setIsBulkAdding(false);
      setBulkSizes('');
      setBulkColors('');
    } catch (err) {
      alert(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Variant ---
  const handleStartEdit = (variant) => {
    setEditingId(variant.id);
    setEditRow({
      ...variant,
      price: variant.price !== null ? variant.price : '',
      salePrice: variant.salePrice !== null ? variant.salePrice : ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editRow.size || !editRow.color || editRow.stockQuantity === '') {
      alert("Please fill in Size, Color, and Stock fields!");
      return;
    }

    try {
      const payload = {
        productId: product.id,
        size: editRow.size.trim(),
        color: editRow.color.trim(),
        price: editRow.price ? parseFloat(editRow.price) : null,
        salePrice: editRow.salePrice ? parseFloat(editRow.salePrice) : null,
        stockQuantity: parseInt(editRow.stockQuantity),
        sku: editRow.sku || "",
        status: editRow.status
      };

      const updated = await productVariantService.update(editingId, payload);
      const updatedList = variants.map(v => v.id === editingId ? updated : v);
      setVariants(updatedList);
      updateGlobalProductVariants(updatedList);
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      try {
        await productVariantService.delete(id);
        const updatedList = variants.filter(v => v.id !== id);
        setVariants(updatedList);
        updateGlobalProductVariants(updatedList);
      } catch (err) {
        alert(err.message || err.response?.data || "Error deleting variant!");
      }
    }
  };

  const renderStockBadge = (stock) => {
    if (stock > 10) return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">In Stock: {stock}</span>;
    if (stock > 0) return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400">Low Stock: {stock}</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400">Out of Stock</span>;
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={`Variants: ${product?.name}`} maxWidth="max-w-7xl">
      <div className="w-full space-y-4">

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-slate-400">Manage inventory across sizes and colors.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsBulkAdding(true); setIsAdding(false); }}
              disabled={isBulkAdding || isAdding}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${(isBulkAdding || isAdding) ? 'opacity-50 cursor-not-allowed bg-slate-600/30 text-slate-400' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30'}`}
            >
              <Layers size={14} /> Bulk Generate
            </button>
            <button
              onClick={() => { setIsAdding(true); setIsBulkAdding(false); }}
              disabled={isAdding || isBulkAdding}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${(isAdding || isBulkAdding) ? 'opacity-50 cursor-not-allowed bg-slate-600/30 text-slate-400' : 'glass-btn-primary'}`}
            >
              <Plus size={14} /> Add Variant
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F1224]/50 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="p-3 font-semibold w-16">Size</th>
                <th className="p-3 font-semibold w-24">Color</th>
                <th className="p-3 font-semibold w-24">Base Price</th>
                <th className="p-3 font-semibold w-24 text-rose-300">Sale Price</th>
                <th className="p-3 font-semibold w-20">Stock</th>
                <th className="p-3 font-semibold w-24">SKU</th>
                <th className="p-3 font-semibold w-20">Status</th>
                <th className="p-3 font-semibold text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-200">
 
              {/* Dòng nhập liệu Thêm mới */}
              {isAdding && (
                <tr className="border-b border-emerald-500/30 bg-emerald-500/10">
                  <td className="p-2"><input type="text" placeholder="e.g. 40" className="w-full px-2 py-1 rounded glass-input text-xs" value={newRow.size} onChange={e => setNewRow({ ...newRow, size: e.target.value })} /></td>
                  <td className="p-2"><input type="text" placeholder="e.g. Red" className="w-full px-2 py-1 rounded glass-input text-xs" value={newRow.color} onChange={e => setNewRow({ ...newRow, color: e.target.value })} /></td>
                  <td className="p-2"><input type="number" placeholder="Default" className="w-full px-2 py-1 rounded glass-input text-xs" value={newRow.price} onChange={e => setNewRow({ ...newRow, price: e.target.value })} /></td>
                  <td className="p-2"><input type="number" placeholder="Default" className="w-full px-2 py-1 rounded glass-input text-xs border-rose-500/30 focus:border-rose-500/50" value={newRow.salePrice} onChange={e => setNewRow({ ...newRow, salePrice: e.target.value })} /></td>
                  <td className="p-2"><input type="number" min="0" className="w-full px-2 py-1 rounded glass-input text-xs" value={newRow.stockQuantity} onChange={e => setNewRow({ ...newRow, stockQuantity: e.target.value })} /></td>
                  <td className="p-2"><input type="text" placeholder="Auto-gen" className="w-full px-2 py-1 rounded glass-input text-xs placeholder:text-[10px]" value={newRow.sku} onChange={e => setNewRow({ ...newRow, sku: e.target.value })} /></td>
                  <td className="p-2">
                    <select className="w-full px-2 py-1 rounded glass-input text-xs bg-[#0F1224] text-white" value={newRow.status} onChange={e => setNewRow({ ...newRow, status: parseInt(e.target.value) })}>
                      <option value={1} className="bg-[#0F1224] text-white">Active</option>
                      <option value={0} className="bg-[#0F1224] text-white">Hidden</option>
                    </select>
                  </td>
                  <td className="p-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={handleSaveNew} className="text-emerald-400 hover:bg-emerald-400/20 p-1 rounded transition-colors" title="Save"><CheckCircle2 size={16} /></button>
                      <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:bg-slate-600/30 p-1 rounded transition-colors" title="Cancel"><X size={16} /></button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Bảng điều khiển sinh hàng loạt (Bulk Generation) */}
              {isBulkAdding && (
                <tr className="border-b border-indigo-500/30 bg-indigo-500/10">
                  <td colSpan="8" className="p-4">
                    <div className="mb-3 flex items-center gap-2 text-indigo-300 font-semibold text-[13px]">
                      <Layers size={16} /> Fast Bulk Generation
                      <span className="text-[10px] font-normal text-slate-400 ml-2">(Generates a combination of all sizes and colors)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] uppercase text-indigo-300/70 mb-1">Sizes (Comma separated)</label>
                        <input type="text" placeholder="e.g. 39, 40, 41, 42" className="w-full px-3 py-2 rounded glass-input text-xs" value={bulkSizes} onChange={e => setBulkSizes(e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] uppercase text-indigo-300/70 mb-1">Colors (Comma separated)</label>
                        <input type="text" placeholder="e.g. Red, Black, White" className="w-full px-3 py-2 rounded glass-input text-xs" value={bulkColors} onChange={e => setBulkColors(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-indigo-300/70 mb-1">Base Price</label>
                        <input type="number" placeholder="Leave blank for default" className="w-full px-3 py-2 rounded glass-input text-xs" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-indigo-300/70 mb-1">Sale Price</label>
                        <input type="number" placeholder="Leave blank for default" className="w-full px-3 py-2 rounded glass-input text-xs border-rose-500/30" value={bulkSalePrice} onChange={e => setBulkSalePrice(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-indigo-300/70 mb-1">Stock per variant</label>
                        <input type="number" min="0" className="w-full px-3 py-2 rounded glass-input text-xs" value={bulkStock} onChange={e => setBulkStock(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setIsBulkAdding(false)} className="px-4 py-1.5 text-slate-400 hover:text-white transition-colors text-xs">Cancel</button>
                      <button onClick={handleBulkGenerate} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                        <Layers size={14} /> Generate {
                          (bulkSizes.split(',').filter(s => s.trim()).length * bulkColors.split(',').filter(c => c.trim()).length) || 0
                        } Variants
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Danh sách dữ liệu */}
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">Loading variants...</td></tr>
              ) : variants.length === 0 && !isAdding && !isBulkAdding ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center">
                    <div className="flex flex-col items-center text-slate-500">
                      <AlertCircle size={24} className="mb-2 opacity-50" />
                      <p>No variants configured for this product.</p>
                      <p className="text-[10px] mt-1 opacity-70">Click "Add Variant" or "Bulk Generate" to start managing sizes and colors.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                variants.map(variant => (
                  <tr key={variant.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${variant.status === 0 ? 'opacity-50' : ''}`}>
                    {/* Chế độ View / Edit hiển thị nội tuyến (Inline) */}
                    {editingId === variant.id ? (
                      <>
                        <td className="p-2"><input type="text" className="w-full px-2 py-1 rounded glass-input text-xs" value={editRow.size} onChange={e => setEditRow({ ...editRow, size: e.target.value })} /></td>
                        <td className="p-2"><input type="text" className="w-full px-2 py-1 rounded glass-input text-xs" value={editRow.color} onChange={e => setEditRow({ ...editRow, color: e.target.value })} /></td>
                        <td className="p-2"><input type="number" placeholder="Default" className="w-full px-2 py-1 rounded glass-input text-xs" value={editRow.price} onChange={e => setEditRow({ ...editRow, price: e.target.value })} /></td>
                        <td className="p-2"><input type="number" placeholder="Default" className="w-full px-2 py-1 rounded glass-input text-xs border-rose-500/30" value={editRow.salePrice} onChange={e => setEditRow({ ...editRow, salePrice: e.target.value })} /></td>
                        <td className="p-2"><input type="number" min="0" className="w-full px-2 py-1 rounded glass-input text-xs" value={editRow.stockQuantity} onChange={e => setEditRow({ ...editRow, stockQuantity: e.target.value })} /></td>
                        <td className="p-2"><input type="text" className="w-full px-2 py-1 rounded glass-input text-xs" value={editRow.sku} onChange={e => setEditRow({ ...editRow, sku: e.target.value })} /></td>
                        <td className="p-2">
                          <select className="w-full px-2 py-1 rounded glass-input text-xs bg-[#0F1224] text-white" value={editRow.status} onChange={e => setEditRow({ ...editRow, status: parseInt(e.target.value) })}>
                            <option value={1} className="bg-[#0F1224] text-white">Active</option>
                            <option value={0} className="bg-[#0F1224] text-white">Hidden</option>
                          </select>
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={handleSaveEdit} className="text-emerald-400 hover:bg-emerald-400/20 p-1 rounded transition-colors"><Save size={16} /></button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-600/30 p-1 rounded transition-colors"><X size={16} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-medium">{variant.size}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px]">
                            {variant.color === 'Mặc định' ? 'Default' : variant.color}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] font-mono text-purple-300">
                          {variant.price ? `${variant.price.toLocaleString()} VND` : <span className="text-slate-500 opacity-60">Default price</span>}
                        </td>
                        <td className="p-3 text-[11px] font-mono text-rose-300">
                          {variant.salePrice ? `${variant.salePrice.toLocaleString()} VND` : <span className="text-slate-500 opacity-60">-</span>}
                        </td>
                        <td className="p-3">{renderStockBadge(variant.stockQuantity)}</td>
                        <td className="p-3 text-[10px] font-mono opacity-70 truncate max-w-[100px]" title={variant.sku}>{variant.sku}</td>
                        <td className="p-3">
                          {variant.status === 1
                            ? <span className="text-emerald-400 text-[10px]">Active</span>
                            : <span className="text-rose-400 text-[10px]">Hidden</span>}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleStartEdit(variant)} className="text-blue-400 hover:bg-blue-400/20 p-1 rounded transition-colors" title="Edit"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(variant.id)} className="text-rose-400 hover:bg-rose-400/20 p-1 rounded transition-colors" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </GlassModal>
  );
};

export default ProductVariantModal;
