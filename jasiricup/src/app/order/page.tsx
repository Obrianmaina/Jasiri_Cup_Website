// app/order/page.tsx
'use client';
import { useState } from 'react';
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export default function OrderPage() {
  const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
  const [items, setItems] = useState([
    { quantity: 1, color: '', size: '', customNotes: '' }
  ]);

  // Handle client info change
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientInfo({ ...clientInfo, [e.target.name]: e.target.value });
  };

  const productBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Order', href: '/order' },
  ];

  // Handle item changes
  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name as keyof typeof newItems[number]] = value;
    setItems(newItems);
  };

  // Add or remove items
  const addItem = () => setItems([...items, { quantity: 1, color: '', size: '', customNotes: '' }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  // Submit order
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
      setItems([{ quantity: 1, color: '', size: '', customNotes: '' }]);
    } else {
      alert('Failed to submit order. Please try again.');
    }
  };

  return (
    <div className="bg-white-100 min-h-screen p-4 sm:p-8">
        <Breadcrumbs items={productBreadcrumbs} />
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900">Place Your Order</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Info */}
          <div className="p-6 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Information</h2>
            <div className="space-y-4">
              <input 
                name="name" 
                placeholder="Full Name" 
                value={clientInfo.name} 
                onChange={handleClientChange} 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <input 
                name="email" 
                type="email" 
                placeholder="Email Address" 
                value={clientInfo.email} 
                onChange={handleClientChange} 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <input 
                name="phone" 
                type="tel" 
                placeholder="Phone Number" 
                value={clientInfo.phone} 
                onChange={handleClientChange} 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-lg shadow-inner border border-gray-200 relative">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">Item {index + 1}</h3>
                <div className="space-y-4">
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={e => handleItemChange(index, e)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <select
                    name="color"
                    value={item.color}
                    onChange={e => handleItemChange(index, e)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                  >
                    <option value="">Select Color</option>
                    <option value="White">White</option>
                    <option value="Red">Red</option>
                    <option value="Blue">Blue</option>
                    <option value="Pink">Pink</option>
                    <option value="Plum">Plum</option>
                  </select>
                  <select
                    name="size"
                    value={item.size}
                    onChange={e => handleItemChange(index, e)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                  >
                    <option value="">Select Size</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                  <textarea
                    name="customNotes"
                    value={item.customNotes}
                    onChange={e => handleItemChange(index, e)}
                    placeholder="Custom Notes (e.g., specific shade, delivery instructions)"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={addItem}
              className="px-6 py-3 text-purple-600 bg-purple-100 rounded-full font-medium hover:bg-purple-200 transition-colors duration-200"
            >
              + Add Another Item
            </button>

            <button
              type="submit"
              className="bg-[#1AA75B] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}