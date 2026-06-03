'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

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
  description: string;
  image: string | null;
  variations: IProductVariation[];
}

interface CartItem {
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

export default function ProductsClient({ products }: { products: IProduct[] }) {
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load existing cart from local storage on mount
  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem('jasiricup_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const handleAddToCart = (product: IProduct, color: string, size: string, quantityToAdd: number) => {
    const existingItemIndex = cart.findIndex(
      item => item.productId === product._id && item.color === color && item.size === size
    );

    let newCart;
    if (existingItemIndex > -1) {
      newCart = [...cart];
      newCart[existingItemIndex].quantity += quantityToAdd;
    } else {
      newCart = [...cart, { productId: product._id, color, size, quantity: quantityToAdd }];
    }

    setCart(newCart);
    localStorage.setItem('jasiricup_cart', JSON.stringify(newCart));
    
    // Reset the quantity selector for this specific product back to 1
    setSelectedQuantities({ ...selectedQuantities, [product._id]: 1 });
    
    // Visually confirm by opening the centered cart modal immediately
    setIsCartOpen(true); 
  };

  const handleRemoveFromCart = (indexToRemove: number) => {
    const newCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(newCart);
    localStorage.setItem('jasiricup_cart', JSON.stringify(newCart));
    
    // Automatically close the cart if they delete the last item
    if (newCart.length === 0) {
      setIsCartOpen(false);
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
  ];

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = cart.reduce((total, cartItem) => {
    const product = products.find(p => p._id === cartItem.productId);
    return total + (product ? product.price * cartItem.quantity : 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8 pb-32 min-h-screen relative">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">
          Shop Our Products
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl transition-colors">
          Browse our selection of eco-friendly menstrual health products. 
          Every purchase supports our initiative to keep girls in school.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <p className="text-xl text-gray-500 dark:text-gray-400">Inventory is currently updating. Please check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const colors = Array.from(new Set(product.variations.map(v => v.color)));
            const inStock = product.variations.some(v => v.stockQuantity > 0);
            
            const activeColor = selectedColors[product._id] || colors[0];
            
            const sizesForColor = product.variations
                .filter(v => v.color === activeColor && v.stockQuantity > 0)
                .map(v => v.size);
            
            const activeSize = selectedSizes[product._id] || sizesForColor[0];

            const variantsOfColor = product.variations.filter(v => v.color === activeColor);
            const variantWithImage = variantsOfColor.find(v => v.image && v.image.trim() !== '');
            const displayImage = variantWithImage?.image || product.image;

            const activeVariant = product.variations.find(v => v.color === activeColor && v.size === activeSize);
            const maxStock = activeVariant?.stockQuantity || 0;
            const rawQty = selectedQuantities[product._id] || 1;
            const safeQty = Math.min(rawQty, maxStock > 0 ? maxStock : 1);
            const updateQty = (val: number) => setSelectedQuantities({ ...selectedQuantities, [product._id]: val });

            return (
              <div 
                key={product._id} 
                className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-[3/3] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  {displayImage ? (
                    <Image
                      key={displayImage} 
                      src={displayImage}
                      alt={`${product.name} ${activeColor || 'Standard'}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {!inStock && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      Sold Out
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h2>
                    <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                      KES {product.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
                    {product.description}
                  </p>

                  {/* Interactive Color Selection */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">1. Select Color</span>
                    <div className="flex gap-2 flex-wrap">
                      {colors.length > 0 ? colors.map(color => (
                        <button 
                          key={color} 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            setSelectedColors({...selectedColors, [product._id]: color}); 
                            setSelectedSizes({...selectedSizes, [product._id]: ''});
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                            activeColor === color 
                              ? 'bg-purple-600 text-white shadow-md' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {color}
                        </button>
                      )) : (
                        <span className="text-xs text-gray-400">Standard</span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Size Selection */}
                  <div className="mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">2. Select Size</span>
                    <div className="flex gap-2 flex-wrap">
                      {sizesForColor.length > 0 ? sizesForColor.map(size => (
                        <button 
                          key={size} 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            setSelectedSizes({...selectedSizes, [product._id]: size}); 
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                            activeSize === size 
                              ? 'bg-[#1AA75B] text-white shadow-md' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {size}
                        </button>
                      )) : (
                        <span className="text-xs text-red-500 font-medium">No sizes available in this color</span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Quantity Selection */}
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">3. Quantity</span>
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <button 
                        onClick={(e) => { e.preventDefault(); updateQty(Math.max(1, safeQty - 1)); }}
                        className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-purple-600 font-bold transition-colors disabled:opacity-30"
                        disabled={safeQty <= 1}
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white w-10 text-center">
                        {safeQty}
                      </span>
                      <button 
                        onClick={(e) => { e.preventDefault(); updateQty(Math.min(maxStock, safeQty + 1)); }}
                        className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-purple-600 font-bold transition-colors disabled:opacity-30"
                        disabled={safeQty >= maxStock || !activeSize}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    disabled={!inStock || !activeSize}
                    onClick={() => handleAddToCart(product, activeColor, activeSize, safeQty)}
                    className={`w-full text-center py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      inStock && activeSize
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md hover:scale-[1.02] active:scale-[0.98]' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {inStock ? (activeSize ? 'Add to Order' : 'Select a size') : 'Out of Stock'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Glassmorphism Flush Edge Tab (Middle Right - Dynamic Hover Expansion) */}
      {mounted && cart.length > 0 && (
        <div className="fixed top-1/2 right-0 -translate-y-1/2 z-[200]">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md text-gray-900 dark:text-white border-y border-l border-gray-200/80 dark:border-gray-700/50 rounded-l-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.15)] hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-300 flex items-center group cursor-pointer overflow-hidden h-14 p-2 w-14 lg:hover:w-60 lg:hover:pr-4 lg:hover:pl-4"
            aria-label="Open Cart"
          >
            {/* Left side: Always-Visible Icon and Badge */}
            <div className="relative flex items-center justify-center bg-purple-600 text-white h-10 w-10 rounded-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1.5 -left-1.5 bg-[#1AA75B] text-white font-bold text-[10px] rounded-full h-5 w-5 flex items-center justify-center shadow-sm border border-white dark:border-gray-900">
                {cartItemCount}
              </span>
            </div>

            {/* Middle text content: Hidden on Mobile/iPad, slides & fades into view on Desktop Hover */}
            <div className="text-left opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 delay-75 hidden lg:block ml-3 select-none flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 leading-none mb-1">
                View Order
              </p>
              <p className="font-black text-sm text-purple-600 dark:text-purple-400 font-mono tracking-tight leading-none truncate">
                KES {cartTotal.toLocaleString()}
              </p>
            </div>

            {/* Right side: Chevron Indicator, behaves exactly like the text */}
            <svg className="w-3 h-3 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all duration-300 opacity-0 lg:group-hover:opacity-100 hidden lg:block shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      {/* Centered Cart Modal */}
      <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {/* Dark Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
        
        {/* Centered Modal Panel */}
        <div className={`relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transform transition-transform duration-300 ease-out ${isCartOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          
          {/* Cart Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80 rounded-t-3xl">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Your Order 
              <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-sm py-1 px-3 rounded-full">{cartItemCount} item{cartItemCount !== 1 && 's'}</span>
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-gray-800 p-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.map((cartItem, index) => {
              const product = products.find(p => p._id === cartItem.productId);
              if (!product) return null;
              
              const variant = product.variations.find(v => v.color === cartItem.color);
              const displayImage = variant?.image || product.image;

              return (
                <div key={index} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-800/40 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                    {displayImage ? (
                      <Image src={displayImage} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base">{product.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1 sm:mt-2">
                      <span className="text-[10px] sm:text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">Color: {cartItem.color}</span>
                      <span className="text-[10px] sm:text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">Size: {cartItem.size}</span>
                    </div>
                    <p className="text-purple-600 dark:text-purple-400 font-bold mt-2 text-sm sm:text-base">KES {(product.price * cartItem.quantity).toLocaleString()}</p>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className="text-sm font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-lg">x{cartItem.quantity}</span>
                    <button 
                      onClick={() => handleRemoveFromCart(index)} 
                      className="text-[10px] sm:text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
            
            {cart.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                Your cart is empty.
              </div>
            )}
          </div>

          {/* Cart Footer / Checkout */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 rounded-b-3xl">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-sm">Subtotal</span>
              <span className="font-black text-2xl text-gray-900 dark:text-white">KES {cartTotal.toLocaleString()}</span>
            </div>
            <Link 
              href="/order" 
              className={`block w-full text-center py-4 rounded-xl font-bold text-lg transition-colors shadow-md ${cart.length > 0 ? 'bg-[#1AA75B] text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 pointer-events-none'}`}
            >
              Proceed to Secure Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}