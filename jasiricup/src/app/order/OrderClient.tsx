'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Modal } from "@/components/ui/Modal";

interface IProductVariation {
  color: string;
  size: string;
  stockQuantity: number;
  image?: string | null;
}

interface IProduct {
  _id: string;
  name: string;
  price: number;
  image: string | null;
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

interface LocalCartItem {
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

export default function OrderClient({ activeProducts }: { activeProducts: IProduct[] }) {
  const searchParams = useSearchParams();
  const preSelectedProduct = searchParams.get('product');

  const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
  const [items, setItems] = useState<OrderItem[]>([
    { productId: '', productName: '', quantity: 1, color: '', size: '', customNotes: '' }
  ]);
  
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', isSuccess: true });

  // Load existing cart from local storage or fallback to URL parameter
  useEffect(() => {
    const savedCart = localStorage.getItem('jasiricup_cart');
    
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart) as LocalCartItem[];
      
      if (parsedCart.length > 0) {
        const mappedItems = parsedCart.map((cartItem: LocalCartItem) => {
          const product = activeProducts.find(p => p._id === cartItem.productId);
          return {
            productId: cartItem.productId,
            productName: product ? product.name : '',
            quantity: cartItem.quantity || 1,
            color: cartItem.color || '',
            size: cartItem.size || '',
            customNotes: ''
          };
        }).filter((item: OrderItem) => item.productName !== '');

        if (mappedItems.length > 0) {
          setItems(mappedItems);
          return;
        }
      }
    }
    
    // Fallback if no cart exists but a URL parameter is present
    if (preSelectedProduct && activeProducts.length > 0) {
      const product = activeProducts.find(p => p._id === preSelectedProduct);
      if (product) {
        setItems([{ 
          productId: product._id, 
          productName: product.name, 
          quantity: 1, 
          color: '', 
          size: '', 
          customNotes: '' 
        }]);
      }
    }
  }, [preSelectedProduct, activeProducts]);

  const productBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Checkout', href: '/order' },
  ];

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientInfo({ ...clientInfo, [e.target.name]: e.target.value });
  };

  // Sync form edits (quantities, color, size changes) directly back to localStorage
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    
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

    // Filter and reconstruct clean cart items to persist back to browser storage[cite: 3]
    const cartToSync = newItems.map(item => ({
      productId: item.productId,
      color: item.color,
      size: item.size,
      quantity: item.quantity
    })).filter(item => item.productId !== '');
    
    localStorage.setItem('jasiricup_cart', JSON.stringify(cartToSync));
  };

  const addItem = () => setItems([...items, { productId: '', productName: '', quantity: 1, color: '', size: '', customNotes: '' }]);
  
  // Sync remaining items back to localStorage upon removal
  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);

    const cartToSync = updatedItems.map(item => ({
      productId: item.productId,
      color: item.color,
      size: item.size,
      quantity: item.quantity
    })).filter(item => item.productId !== '');

    localStorage.setItem('jasiricup_cart', JSON.stringify(cartToSync));
  };

  const subtotal = items.reduce((acc, item) => {
    const product = activeProducts.find(p => p._id === item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientInfo, items }),
    });

    if (res.ok) {
      setAlertModal({ isOpen: true, title: 'Order Successful', message: 'Thank you! Your order has been submitted successfully.', isSuccess: true });
      setClientInfo({ name: '', email: '', phone: '' });
      setItems([{ productId: '', productName: '', quantity: 1, color: '', size: '', customNotes: '' }]);
      
      // Clear storage references on successful order
      localStorage.removeItem('jasiricup_cart');
    } else {
      setAlertModal({ isOpen: true, title: 'Submission Failed', message: 'Failed to submit your order. Please try again.', isSuccess: false });
    }
  };

  if (activeProducts.length === 0) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">We are currently out of stock!</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">We are updating our inventory. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <Breadcrumbs items={productBreadcrumbs} />

      <div className="mt-8 mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Secure Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Main Form Areas */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Section 1: Customer Info */}
          <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input name="name" value={clientInfo.name} onChange={handleClientChange} required className="w-full p-3.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <input name="email" type="email" value={clientInfo.email} onChange={handleClientChange} required className="w-full p-3.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                <input name="phone" type="tel" value={clientInfo.phone} onChange={handleClientChange} required className="w-full p-3.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="+254 700 000000" />
              </div>
            </div>
          </section>

          {/* Section 2: Order Items */}
          <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                Your Items
              </h2>
            </div>
            
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

                const selectedVariant = selectedProduct?.variations.find(v => v.color === item.color && v.size === item.size) || selectedProduct?.variations.find(v => v.color === item.color);
                const displayImage = selectedVariant?.image || selectedProduct?.image || '';

                return (
                  <div key={index} className="relative p-5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
                    
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1" title="Remove Item">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}

                    <div className="flex flex-col sm:flex-row gap-5">
                      
                      {/* Product Thumbnail */}
                      <div className="w-full sm:w-24 h-48 sm:h-24 shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative flex items-center justify-center">
                        {displayImage ? (
                           <img src={displayImage} alt="Product" className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>

                      {/* Options Grid */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-4">
                        
                        <div className="sm:col-span-12">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product</label>
                          <select required value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white font-medium">
                            <option value="">Choose a product...</option>
                            {activeProducts.map(p => (
                              <option key={p._id} value={p._id}>{p.name} (KES {p.price})</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Color</label>
                          <select required disabled={!item.productId} value={item.color} onChange={e => handleItemChange(index, 'color', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50 text-sm">
                            <option value="">Select...</option>
                            {availableColors.map(color => <option key={color} value={color}>{color}</option>)}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Size</label>
                          <select required disabled={!item.color} value={item.size} onChange={e => handleItemChange(index, 'size', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50 text-sm">
                            <option value="">Select...</option>
                            {availableSizes.map(size => <option key={size} value={size}>{size}</option>)}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Quantity</label>
                          <input required type="number" min={1} max={maxStock > 0 ? maxStock : 1} value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} disabled={!item.size} className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50 text-sm" />
                        </div>

                        <div className="sm:col-span-12 mt-2">
                          <input type="text" placeholder="Add custom notes or delivery instructions (Optional)" value={item.customNotes} onChange={e => handleItemChange(index, 'customNotes', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm placeholder-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={addItem} className="mt-6 flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Add Another Product
            </button>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4 relative">
          <div className="sticky top-24 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {items.map((item, index) => {
                const product = activeProducts.find(p => p._id === item.productId);
                if (!product) return null;
                
                const selectedVariant = product.variations.find(v => v.color === item.color && v.size === item.size) || product.variations.find(v => v.color === item.color);
                const displayImg = selectedVariant?.image || product.image || '';

                return (
                  <div key={index} className="flex justify-between items-center text-sm py-2">
                    <div className="flex items-center gap-3">
                      {/* Mini Thumbnail */}
                      <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 overflow-hidden flex-shrink-0">
                        {displayImg && <img src={displayImg} className="w-full h-full object-cover" alt="" />}
                      </div>
                      
                      <div className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.color ? `${item.color}, Size ${item.size || '...'}` : 'Pending details'} 
                          <span className="mx-1">x</span> {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white pl-2">
                      KES {(product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                );
              })}
              {items.length > 0 && !items[0].productId && (
                <p className="text-sm text-gray-400 italic">Your cart is waiting for items.</p>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-purple-600 dark:text-purple-400 text-xl">KES {subtotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Shipping calculated at the next step.</p>
            </div>

            <button 
              type="submit" 
              disabled={subtotal === 0}
              className="w-full mt-8 bg-[#1AA75B] disabled:bg-gray-300 disabled:text-gray-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-md active:scale-[0.98]"
            >
              Complete Order
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure and Encrypted Checkout
            </div>
          </div>
        </div>
      </form>

      {/* Alert Modal */}
      <Modal 
        isOpen={alertModal.isOpen} 
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })} 
        title=""
        size="small" 
        showCloseButton={false}
      >
        <div className="text-center space-y-4 py-4">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
            alertModal.isSuccess 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {alertModal.isSuccess ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{alertModal.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-base pb-2">{alertModal.message}</p>
          <button 
            onClick={() => setAlertModal({ ...alertModal, isOpen: false })} 
            className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}