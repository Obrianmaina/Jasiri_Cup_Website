// src/app/admin/products/ProductsClient.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

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

  // Variation Handlers
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
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
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Inventory</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage products and variation stock levels.</p>
        </div>
        {!isEditing && (
          <button onClick={handleAddNew} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm">
            + Add Product
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">{formData._id ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES/USD)</label>
                <input required type="number" min="0" value={formData.price || 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://res.cloudinary.com/..." />
              </div>
            </div>

            {/* Variations Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Inventory Variations (Colors & Sizes)</h3>
                <button type="button" onClick={handleAddVariation} className="text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors">
                  + Add Variant
                </button>
              </div>
              
              {(!formData.variations || formData.variations.length === 0) ? (
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
                  No variations added. Click the button above to add colors and sizes.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.variations.map((v, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="w-full sm:w-1/3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                        <input required type="text" placeholder="e.g. Pink" value={v.color} onChange={e => handleUpdateVariation(index, 'color', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                        <input required type="text" placeholder="e.g. Small" value={v.size} onChange={e => handleUpdateVariation(index, 'size', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                      </div>
                      <div className="w-full sm:w-1/4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Stock Qty</label>
                        <input required type="number" min="0" value={v.stockQuantity} onChange={e => handleUpdateVariation(index, 'stockQuantity', Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                      </div>
                      <button type="button" onClick={() => handleRemoveVariation(index)} className="w-full sm:w-auto px-3 py-1.5 text-red-500 hover:text-red-700 bg-red-50 rounded-md text-sm font-medium transition-colors">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center mt-6 pt-4">
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300" id="isActive" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Product is active and visible to customers</label>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button type="button" onClick={handleCancel} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" disabled={processing} className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50">
                {processing ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No products found. Add your first product to manage inventory.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Inventory Breakdown</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(product => {
                    const totalStock = product.variations?.reduce((acc, curr) => acc + curr.stockQuantity, 0) || 0;
                    
                    return (
                      <tr key={product._id} className="hover:bg-purple-50/30">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{product.price}</td>
                        <td className="px-6 py-4">
                          {(!product.variations || product.variations.length === 0) ? (
                            <span className="text-gray-400 text-xs italic">No variations</span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {product.variations.map((v, i) => (
                                <div key={i} className="text-xs text-gray-600">
                                  <span className="font-medium">{v.color} / {v.size}:</span> {v.stockQuantity}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${totalStock > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                            {totalStock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(product)} className="text-purple-600 hover:text-purple-800 text-sm font-medium mr-4">Edit</button>
                          <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}