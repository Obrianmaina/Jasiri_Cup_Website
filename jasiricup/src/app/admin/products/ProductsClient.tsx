'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/Modal'; 

interface IProductVariation {
  color: string;
  size: string;
  stockQuantity: number;
}

interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  variations: IProductVariation[];
  isActive: boolean;
}

export default function ProductsClient({ initialProducts }: { initialProducts: IProduct[] }) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [isEditing, setIsEditing] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<IProduct>>({
    name: '', description: '', price: 0, image: '', variations: [], isActive: true
  });

  const handleEdit = (product: IProduct) => {
    setFormData(product);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({ name: '', description: '', price: 0, image: '', variations: [], isActive: true });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleAddVariation = () => {
    setFormData({
      ...formData,
      variations: [...(formData.variations || []), { color: '', size: '', stockQuantity: 0 }]
    });
  };

  const handleUpdateVariation = (index: number, field: keyof IProductVariation, value: string | number) => {
    const newVariations = [...(formData.variations || [])];
    newVariations[index] = { ...newVariations[index], [field]: value } as IProductVariation;
    setFormData({ ...formData, variations: newVariations });
  };

  const handleRemoveVariation = (index: number) => {
    const newVariations = [...(formData.variations || [])];
    newVariations.splice(index, 1);
    setFormData({ ...formData, variations: newVariations });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const loadingToast = toast.loading('Saving product...');

    try {
      const isUpdate = !!formData._id;
      const url = isUpdate ? `/api/admin/products/${formData._id}` : '/api/admin/products';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();
      const { data } = await res.json();

      if (isUpdate) {
        setProducts(products.map(p => p._id === data._id ? data : p));
      } else {
        setProducts([data, ...products]);
      }

      toast.success('Product saved!', { id: loadingToast });
      setIsEditing(false);
    } catch {
      toast.error('Failed to save product', { id: loadingToast });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setItemToDelete(id);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;
    setItemToDelete(null);

    const loadingToast = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProducts(products.filter(p => p._id !== id));
      toast.success('Deleted successfully', { id: loadingToast });
    } catch {
      toast.error('Failed to delete', { id: loadingToast });
    }
  };

  return (
    <div className="pt-12 pb-24 space-y-6 md:space-y-8 max-w-6xl mx-auto transition-colors duration-300 px-4 sm:px-6">
      
      {/* 1. Header is now stacked on mobile to prevent squishing */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4 transition-colors">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage products and variation stock levels.</p>
        </div>
        {!isEditing && (
          <button onClick={handleAddNew} className="w-full sm:w-auto bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors shadow-sm text-center">
            + Add Product
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{formData._id ? 'Edit Product' : 'New Product'}</h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                <input required type="number" min="0" value={formData.price || 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea required rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                <input type="text" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" placeholder="https://res.cloudinary.com/..." />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">Inventory Variations</h3>
                <button type="button" onClick={handleAddVariation} className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                  + Add Variant
                </button>
              </div>
              
              {(!formData.variations || formData.variations.length === 0) ? (
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  No variations added. Click the button above to add colors and sizes.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.variations.map((v, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 sm:items-end bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                      <div className="w-full sm:w-1/3">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Color</label>
                        <input required type="text" placeholder="e.g. Pink" value={v.color} onChange={e => handleUpdateVariation(index, 'color', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Size</label>
                        <input required type="text" placeholder="e.g. Small" value={v.size} onChange={e => handleUpdateVariation(index, 'size', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" />
                      </div>
                      <div className="w-full sm:w-1/4">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Stock Qty</label>
                        <input required type="number" min="0" value={v.stockQuantity} onChange={e => handleUpdateVariation(index, 'stockQuantity', Number(e.target.value))} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors" />
                      </div>
                      
                      {/* 2. Remove button is given padding and separation on mobile */}
                      <button type="button" onClick={() => handleRemoveVariation(index)} className="w-full sm:w-auto mt-2 sm:mt-0 px-3 py-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 bg-red-50 dark:bg-red-900/20 rounded-md text-sm font-medium transition-colors">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center mt-6 pt-4">
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-purple-500" id="isActive" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Product is active and visible to customers</label>
            </div>

            {/* 3. Action buttons scale well on small screens */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 transition-colors">
              <button type="button" onClick={handleCancel} className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="submit" disabled={processing} className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 text-center">
                {processing ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          {products.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">No products found. Add your first product to manage inventory.</div>
          ) : (
            <>
              {/* --- DESKTOP VIEW (TABLE) --- */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inventory Breakdown</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                    {products.map(product => {
                      const totalStock = product.variations?.reduce((acc, curr) => acc + curr.stockQuantity, 0) || 0;
                      
                      return (
                        <tr key={product._id} className="hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 dark:text-white">{product.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{product.price}</td>
                          <td className="px-6 py-4">
                            {(!product.variations || product.variations.length === 0) ? (
                              <span className="text-gray-400 dark:text-gray-500 text-xs italic">No variations</span>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {product.variations.map((v, i) => (
                                  <div key={i} className="text-xs text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">{v.color} / {v.size}:</span> {v.stockQuantity}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${totalStock > 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                              {totalStock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${product.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleEdit(product)} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm font-medium mr-4 transition-colors">Edit</button>
                            <button onClick={() => handleDeleteRequest(product._id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors">Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 4. --- MOBILE VIEW (CARDS) --- */}
              <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                {products.map(product => {
                  const totalStock = product.variations?.reduce((acc, curr) => acc + curr.stockQuantity, 0) || 0;
                  
                  return (
                    <div key={product._id} className="p-5 space-y-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{product.name}</div>
                          <div className="text-gray-600 dark:text-gray-400 font-medium mt-1">{product.price}</div>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg shrink-0 ${product.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-sm border border-gray-100 dark:border-gray-700">
                         <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                           <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">Total Stock</span>
                           <span className={`font-bold ${totalStock > 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>{totalStock}</span>
                         </div>
                         
                         {(!product.variations || product.variations.length === 0) ? (
                            <span className="text-gray-400 dark:text-gray-500 text-xs italic block text-center py-1">No variations</span>
                          ) : (
                            <div className="flex flex-col gap-1.5 mt-2">
                              {product.variations.map((v, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">{v.color} / {v.size}</span>
                                  <span className="bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-400">{v.stockQuantity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="flex justify-end gap-5 pt-1">
                        <button onClick={() => handleEdit(product)} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm font-semibold transition-colors uppercase tracking-wide">Edit</button>
                        <button onClick={() => handleDeleteRequest(product._id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-semibold transition-colors uppercase tracking-wide">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={executeDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
      />
    </div>
  );
}