'use client';
import Link from 'next/link';
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiShield,
  FiTruck,
  FiShoppingBag
} from 'react-icons/fi';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartCount, cartTotal } = useCart();

  const subtotal = cartTotal;
  const shippingFee = cartItems.length > 0 ? 250 : 0;
  const total = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <FiShoppingBag className="text-purple-600" /> Shopping Cart
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {cartCount} items
            </span>
          </h1>
        </div>
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 text-sm mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:opacity-95 transition shadow-sm"
            >
              <FiArrowLeft /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:border-purple-200 shadow-sm"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1">
                      {item.vendor && (
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                          {item.vendor}
                        </span>
                      )}
                      <h3 className="font-semibold text-slate-800 text-base mt-1 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        PKR {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-slate-600 hover:text-purple-600 transition"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-slate-600 hover:text-purple-600 transition"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                      <p className="text-sm font-bold text-slate-900">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 transition"
                        title="Remove item"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 h-fit lg:sticky lg:top-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    PKR {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-900">
                    PKR {shippingFee.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-purple-700">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition"
              >
                Proceed to Checkout
              </Link>

              <div className="pt-2 space-y-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FiTruck className="text-purple-600 w-4 h-4" /> Fast delivery within 3-5 business days
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FiShield className="text-emerald-600 w-4 h-4" /> Buyer protection & easy returns
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}