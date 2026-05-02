'use client';

import { useState } from 'react';
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

interface IProductVariation {
  color: string;
  size: string;
  stockQuantity: number;
}

interface IProduct {
  _id: string;
  name: string;
  price: number;
  variations: IProductVariation[];
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  color: string;
  size: string;
  customNotes: string;
}

export default function OrderClient({ activeProducts }: { activeProducts: IProduct[] }) {
  const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
  const [items, setItems] = useState<OrderItem[]>([
    { productId: '', productName: '', quantity: 1, color: '', size: '', customNotes: '' }
  ]);

  const productBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Order', href: '/order' },
  ];

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientInfo({ ...clientInfo, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    
    // Reset child dropdowns if a parent dropdown changes
    if (field === 'productId') {
      const product = activeProducts.find(p => p._id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value as string,
        productName: product ? product.name : '',
        color: '', size: '', quantity: 1
      };
    } else if (field === 'color') {
      newItems[index] = { ...newItems[index], color: value as string, size: '', quantity: 1 };
    } else if (field === 'size') {
      newItems[index] = { ...newItems[index], size: value as string, quantity: 1 };
    } else if (field === 'quantity') {
      newItems[index] = { ...newItems[index], quantity: Number(value) };
    } else if (field === 'customNotes') {
      newItems[index] = { ...newItems[index], customNotes: String(value) };
    }
    
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { productId: '', productName: '', quantity: 1, color: '', size: '', customNotes: '' }]);
  
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientInfo, items }),
    });

    if (res.ok) {
      alert('Order submitted successfully!');
      setClientInfo({ name: '', email: '', phone: '' });
      setItems([{ productId: '', productName: '', quantity: 1, color: '', size: '', customNotes: '' }]);
    } else {
      alert('Failed to submit order. Please try again.');
    }
  };

  if (activeProducts.length === 0) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">We are currently out of stock!</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors">We are updating our inventory. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={productBreadcrumbs} />

      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg transition-colors duration-300">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-white transition-colors">Place Your Order</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Client Info */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 transition-colors">Your Information</h2>
            <div className="space-y-4">
              <input name="name" placeholder="Full Name" value={clientInfo.name} onChange={handleClientChange} required className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors" />
              <input name="email" type="email" placeholder="Email Address" value={clientInfo.email} onChange={handleClientChange} required className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors" />
              <input name="phone" type="tel" placeholder="Phone Number" value={clientInfo.phone} onChange={handleClientChange} required className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors" />
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-6">
            {items.map((item, index) => {
              const selectedProduct = activeProducts.find(p => p._id === item.productId);
              
              const availableColors = selectedProduct 
                ? Array.from(new Set(selectedProduct.variations.filter(v => v.stockQuantity > 0).map(v => v.color)))
                : [];
              
              const availableSizes = selectedProduct && item.color
                ? selectedProduct.variations.filter(v => v.color === item.color && v.stockQuantity > 0).map(v => v.size)
                : [];
              
              const maxStock = selectedProduct && item.color && item.size
                ? selectedProduct.variations.find(v => v.color === item.color && v.size === item.size)?.stockQuantity || 0
                : 0;

              return (
                <div key={index} className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 relative transition-colors duration-300">
                  <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-100 transition-colors">Item {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Product Selection */}
                    <div className="md:col-span-2">
                      <select required value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors">
                        <option value="">Select Product</option>
                        {activeProducts.map(p => (
                          <option key={p._id} value={p._id}>{p.name} - KES {p.price}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color Selection */}
                    <select required disabled={!item.productId} value={item.color} onChange={e => handleItemChange(index, 'color', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 transition-colors">
                      <option value="">Select Color</option>
                      {availableColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>

                    {/* Size Selection */}
                    <select required disabled={!item.color} value={item.size} onChange={e => handleItemChange(index, 'size', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 transition-colors">
                      <option value="">Select Size</option>
                      {availableSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex items-center gap-4">
                      <div className="flex-1">
                        <input required type="number" min={1} max={maxStock > 0 ? maxStock : 1} placeholder="Quantity" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} disabled={!item.size} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 transition-colors" />
                        {maxStock > 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">{maxStock} available in stock</p>}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <textarea rows={2} placeholder="Custom Notes (e.g., delivery instructions)" value={item.customNotes} onChange={e => handleItemChange(index, 'customNotes', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" />
                    </div>
                  </div>

                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <button type="button" onClick={addItem} className="w-full sm:w-auto px-6 py-3 text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 rounded-full font-medium hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-colors">
              + Add Another Item
            </button>
            <button type="submit" className="w-full sm:w-auto bg-[#1AA75B] text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-green-700 transition-all shadow-md">
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}