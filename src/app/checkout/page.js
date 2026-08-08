'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FiArrowLeft, 
  FiShield, 
  FiTruck, 
  FiCheck, 
  FiCreditCard, 
  FiLock, 
  FiUser, 
  FiMapPin, 
  FiPhone, 
  FiMail 
} from 'react-icons/fi';

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod', // 'cod' or 'card'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  // Mock Order Items
  const orderItems = [
    {
      id: '1',
      title: 'Wireless Noise Canceling Headphones',
      price: 12500,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    },
    {
      id: '2',
      title: 'Smart Fitness Watch - Series 7',
      price: 8900,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    },
  ];

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 250;
  const total = subtotal + shippingFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOrdered(true);
    }, 1500);
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-lg space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            <FiCheck />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h1>
            <p className="text-sm text-slate-500 mt-2">
              Thank you for your purchase. We have sent a confirmation email to <span className="font-semibold text-slate-700">{formData.email || 'your email'}</span>.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-left text-xs text-slate-600 space-y-1 border border-slate-100">
            <p><span className="font-semibold text-slate-800">Order Total:</span> PKR {total.toLocaleString()}</p>
            <p><span className="font-semibold text-slate-800">Payment Method:</span> {formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card'}</p>
            <p><span className="font-semibold text-slate-800">Shipping Address:</span> {formData.address}, {formData.city}</p>
          </div>
          <Link
            href="/"
            className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:opacity-95 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Back Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-purple-600 transition"
          >
            <FiArrowLeft /> Back to Cart
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <FiLock className="text-emerald-600" /> 256-Bit SSL Encrypted
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FiMapPin className="text-purple-600" /> Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Ali Ahmed"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ali@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0300 1234567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House / Apartment number, street name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Lahore, Karachi, etc."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Postal Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="54000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FiCreditCard className="text-purple-600" /> Payment Method
              </h2>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${formData.paymentMethod === 'cod' ? 'border-purple-600 bg-purple-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="accent-purple-600 w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Cash on Delivery (COD)</p>
                      <p className="text-xs text-slate-500">Pay with cash when your parcel arrives</p>
                    </div>
                  </div>
                  <FiTruck className="text-purple-600 w-5 h-5" />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${formData.paymentMethod === 'card' ? 'border-purple-600 bg-purple-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="accent-purple-600 w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Credit / Debit Card</p>
                      <p className="text-xs text-slate-500">Visa, MasterCard, or UnionPay</p>
                    </div>
                  </div>
                  <FiCreditCard className="text-purple-600 w-5 h-5" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-lg border" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">PKR {shippingFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-purple-700">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <FiLock className="w-4 h-4" /> Complete Order
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                <FiShield className="text-emerald-600 w-4 h-4" /> Guaranteed Safe & Secure Checkout
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}