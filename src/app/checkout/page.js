'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  FiMail,
  FiSmartphone,
  FiTag,
  FiAlertCircle,
  FiFileText
} from 'react-icons/fi';

import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod', // 'cod' | 'card' | 'wallet'
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    walletNumber: '',
    deliveryNotes: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Coupon state ──────────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, type: 'percent' | 'flat', value }
  const [couponError, setCouponError] = useState('');

  // Real cart data (replaces the old hardcoded orderItems array)
  const orderItems = cartItems;

  const subtotal = cartTotal;
  const shippingFee = orderItems.length > 0 ? 250 : 0;

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percent') {
      return Math.round(subtotal * (appliedCoupon.value / 100));
    }
    return Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const total = Math.max(subtotal + shippingFee - discountAmount, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }

    // Test code — 10% off. (Swap/extend this against a real `promo_codes`
    // table once one exists.)
    if (code === 'SAVE10') {
      setAppliedCoupon({ code, type: 'percent', value: 10 });
      setCouponError('');
    } else {
      setAppliedCoupon(null);
      setCouponError('Invalid or expired coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = true;
    if (!formData.phone.trim()) errors.phone = true;
    if (!formData.address.trim()) errors.address = true;
    if (!formData.city.trim()) errors.city = true;

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) errors.cardNumber = true;
      if (!formData.expiryDate.trim()) errors.expiryDate = true;
      if (!formData.cvv.trim()) errors.cvv = true;
      if (!formData.cardholderName.trim()) errors.cardholderName = true;
    }

    if (formData.paymentMethod === 'wallet') {
      if (!formData.walletNumber.trim()) errors.walletNumber = true;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      setSubmitError('Your cart is empty.');
      return;
    }

    if (isSubmitting) return; // guard against double submission

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError('Please fill in all required fields before placing your order.');
      return;
    }

    setFieldErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // NOTE: raw card number / CVV are intentionally never sent to Supabase
      // (or anywhere) — only a masked last-4 reference is stored. Real card
      // charges should go through a PCI-compliant payment gateway
      // (Stripe/PayFast/etc.), not straight into the database.
      const paymentStatus = formData.paymentMethod === 'cod' ? 'unpaid' : 'pending_verification';
      const cardLast4 =
        formData.paymentMethod === 'card' && formData.cardNumber
          ? formData.cardNumber.replace(/\s+/g, '').slice(-4)
          : null;

      // 1. Create the order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id ?? null,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode || null,
          payment_method: formData.paymentMethod,
          payment_status: paymentStatus,
          card_last4: cardLast4,
          wallet_number: formData.paymentMethod === 'wallet' ? formData.walletNumber : null,
          coupon_code: appliedCoupon?.code ?? null,
          discount_amount: discountAmount,
          delivery_notes: formData.deliveryNotes || null,
          subtotal,
          shipping_fee: shippingFee,
          total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create the corresponding line items
      const lineItems = orderItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        line_total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(lineItems);

      if (itemsError) throw itemsError;

      // 3. Clear the cart and redirect
      clearCart();
      router.push('/customerportal');
    } catch (err) {
      console.error('Order submission error:', err.message);
      setSubmitError('Something went wrong while placing your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
        : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600'
    }`;

  const inputWithIconClass = (field) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
        : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600'
    }`;

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
                      className={inputWithIconClass('fullName')}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> Full name is required.
                    </p>
                  )}
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
                      className={inputWithIconClass('email')}
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
                      className={inputWithIconClass('phone')}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> Phone number is required.
                    </p>
                  )}
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
                    className={inputClass('address')}
                  />
                  {fieldErrors.address && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> Street address is required.
                    </p>
                  )}
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
                    className={inputClass('city')}
                  />
                  {fieldErrors.city && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> City is required.
                    </p>
                  )}
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
                    className={inputClass('postalCode')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Delivery Notes / Special Instructions for Rider (Optional)
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3.5 top-3.5 text-slate-400" />
                    <textarea
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      placeholder="e.g. Leave at the gate, call before arriving, etc."
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none"
                    />
                  </div>
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

                <div>
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

                  {/* Collapsible card details — stays mounted so the height/opacity transition can run, and only expands via CSS (no `required` on hidden fields, which is what was throwing the native browser validation error on submit). */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      formData.paymentMethod === 'card' ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          name="cardholderName"
                          value={formData.cardholderName}
                          onChange={handleInputChange}
                          placeholder="Name as shown on card"
                          className={inputClass('cardholderName')}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          inputMode="numeric"
                          maxLength={16}
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          className={inputClass('cardNumber')}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          maxLength={5}
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className={inputClass('expiryDate')}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          CVV *
                        </label>
                        <input
                          type="password"
                          name="cvv"
                          inputMode="numeric"
                          maxLength={3}
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className={inputClass('cvv')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${formData.paymentMethod === 'wallet' ? 'border-purple-600 bg-purple-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="wallet"
                        checked={formData.paymentMethod === 'wallet'}
                        onChange={handleInputChange}
                        className="accent-purple-600 w-4 h-4"
                      />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">JazzCash / EasyPaisa</p>
                        <p className="text-xs text-slate-500">Pay from your mobile wallet</p>
                      </div>
                    </div>
                    <FiSmartphone className="text-purple-600 w-5 h-5" />
                  </label>

                  {/* Collapsible wallet field — same mount-and-transition pattern as the card panel above. */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      formData.paymentMethod === 'wallet' ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Wallet Account / Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="walletNumber"
                        value={formData.walletNumber}
                        onChange={handleInputChange}
                        placeholder="03XX XXXXXXX"
                        className={inputClass('walletNumber')}
                      />
                    </div>
                  </div>
                </div>
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
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Coupon Code
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                    <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <FiTag className="w-3.5 h-3.5" /> {appliedCoupon.code} applied
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold text-slate-500 hover:text-red-500 transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter code (try SAVE10)"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" /> {couponError}
                  </p>
                )}
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
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-semibold">- PKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-purple-700">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {submitError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 shrink-0" /> {submitError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || orderItems.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
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