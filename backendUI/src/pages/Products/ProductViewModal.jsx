import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';
import productImageService from '../../services/productImageService';

const ProductViewModal = ({ isOpen, onClose, productData, categoriesProduct, resolveImageUrl }) => {
  const [images, setImages] = useState([]);
  
  useEffect(() => {
    if (isOpen && productData) {
      productImageService.getByProductId(productData.id)
        .then(res => setImages(res))
        .catch(err => console.log(err));
    } else {
      setImages([]); // clear out on close
    }
  }, [isOpen, productData]);

  if (!productData) return null;

  const categoryName = categoriesProduct.find(c => c.id === productData.categoryId)?.name || 'Uncategorized';

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Product Details & Gallery">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Thumbnail */}
          <div className="w-full md:w-1/3">
             <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#0F1224] shadow-2xl">
               <img src={resolveImageUrl(productData.image)} alt={productData.name} className="w-full h-full object-cover" />
             </div>
             <div className="mt-4 text-center">
               <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-purple-500/20 text-purple-400 border border-purple-500/30">
                 {categoryName}
               </span>
             </div>
          </div>
          
          {/* Information */}
          <div className="w-full md:w-2/3 space-y-4">
             <h3 className="text-xl font-bold text-white tracking-wide">{productData.name}</h3>
             
             <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Price</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-black text-emerald-400">${productData.salePrice.toFixed(2)}</p>
                    {productData.salePrice < productData.price && (
                      <p className="text-xs font-semibold text-slate-500 line-through">${productData.price.toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <div className="w-px bg-white/10 mx-2"></div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Stock</p>
                  <p className="text-xl font-black text-white">{productData.stock}</p>
                </div>
                <div className="w-px bg-white/10 mx-2"></div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                  <p className="text-sm font-bold text-white mt-1.5">{productData.status}</p>
                </div>
             </div>
             
             <div className="pt-2">
               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Description</p>
               <p className="text-sm text-slate-300 leading-relaxed bg-[#0F1224]/50 p-4 rounded-xl border border-white/5 min-h-[100px] shadow-inner">
                 {productData.description || "No description provided."}
               </p>
             </div>
          </div>
        </div>

        {/* Dynamic Image Gallery */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Product Gallery ({images.length} Additional Images)</p>
          {images.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {images.map(img => (
                <a key={img.id} href={resolveImageUrl(img.imageUrl)} target="_blank" rel="noreferrer" className="block relative aspect-square overflow-hidden rounded-lg border border-white/10 hover:border-purple-500 hover:ring-2 hover:ring-purple-500/50 transition-all shadow-md group">
                  <img src={resolveImageUrl(img.imageUrl)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </a>
              ))}
            </div>
          ) : (
             <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center text-xs text-slate-500 font-medium">
               This product has no additional gallery images.
             </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
         <button onClick={onClose} className="glass-btn px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300">Close</button>
      </div>
    </GlassModal>
  );
};

export default ProductViewModal;
