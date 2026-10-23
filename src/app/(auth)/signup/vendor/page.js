'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Camera,
  Building2,
} from 'lucide-react';

export default function VendorSignUp() {
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [form, setForm] = useState({
    storeName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // OTP Verification State (Architecture: step 1 = signup form, step 2 = verify email)
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);

  // Cooldown timer for OTP resend (same pattern as forgot-password/page.js)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setAuthError('');
    setAuthSuccess('');
  };

  // Avatar Photo Handler
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAuthError('Please select a valid image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setAuthError('Store logo/photo must be under 2MB');
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarImage(url);
      setAuthError('');
    }
  };

  useEffect(() => {
    return () => {
      if (avatarImage && avatarImage.startsWith('blob:')) {
        URL.revokeObjectURL(avatarImage);
      }
    };
  }, [avatarImage]);

  // Form Validation
  const validate = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.storeName.trim()) {
      nextErrors.storeName = 'Store/Business name is required';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Min 8 characters required';
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password';
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Supabase Signup Handler — sends OTP, does NOT create the vendor row yet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const cleanEmail = form.email.trim();

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.password,
        options: {
          data: {
            role: 'vendor',
            full_name: form.storeName.trim(),
            status: 'pending', // Pending Admin Approval for Vendors
          },
        },
      });

      if (error) throw error;

      // Move to email verification step. The vendors row is only created
      // after the OTP is confirmed (see handleVerifyOtp below).
      setStep(2);
      setCooldown(60);
    } catch (err) {
      console.error('Vendor Sign-Up Error:', err);
      setAuthError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify the 6-digit signup OTP, then create the vendor record
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setAuthError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanEmail = form.email.trim();

     const { data, error } = await supabase.auth.verifyOtp({
  email: email, // ensure email parameter is passed correctly
  token: otp,
  type: 'signup' // Try changing 'signup' to 'email' if 'signup' gives invalid token
});

      if (verifyError) throw verifyError;

      const newUser = data.user;

      // Only after verification succeeds: create the vendor record.
      // Approval always starts as pending_admin; the seapanel admin panel
      // is the only place that can flip this to 'approved'.
      if (newUser) {
        const { error: vendorInsertError } = await supabase
          .from('vendors')
          .insert({
            user_id: newUser.id,
            store_name: form.storeName.trim(),
            email: cleanEmail,
            account_status: 'pending_admin',
          });

        if (vendorInsertError) throw vendorInsertError;
      }

      // Unapproved vendors should not carry an active session.
      await supabase.auth.signOut();

      setAuthSuccess('Email verified! Your vendor application is pending Admin review.');
    } catch (err) {
      console.error('Vendor OTP Verify Error:', err);
      setAuthError(err?.message || 'Invalid or expired OTP code. Please check again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend the signup confirmation OTP
  const handleResendOtp = async () => {
    setAuthError('');
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: form.email.trim(),
      });
      if (error) throw error;
      setCooldown(60);
    } catch (err) {
      console.error('Resend OTP Error:', err);
      setAuthError(err?.message || 'Failed to resend OTP code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sanitize OTP input to numbers only (same pattern as forgot-password/page.js)
  function handleOtpChange(value) {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    if (authError) setAuthError('');
  }

  // Google OAuth Handler
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setAuthError('');

    try {
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback?next=/vendoradmin`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google OAuth Error:', err);
      setAuthError(err?.message || 'Could not connect to Google authentication.');
      setIsGoogleLoading(false);
    }
  };

  const storeLetter = (form.storeName || form.email || '').trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8 w-full">
      
      {/* Standard Compact Card (380px Max-Width) */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-[380px] border border-purple-200">
        
        {/* Header Badge & Logo Selector */}
        <div className="flex flex-col items-center mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-semibold mb-3 border border-purple-200">
            <Store className="w-3 h-3" /> Vendor Registration
          </span>

          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-purple-50 border-2 border-purple-300 flex items-center justify-center overflow-hidden text-purple-900 font-bold text-xl shadow-inner">
              {avatarImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarImage} className="w-full h-full object-cover" alt="Store Logo" />
              ) : (
                <span>{storeLetter}</span>
              )}
            </div>
            <input 
              type="file" 
              id="vendor-logo-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange}
              disabled={isSubmitting || isGoogleLoading}
            />
            <label 
              htmlFor="vendor-logo-upload" 
              className="absolute -bottom-1 -right-1 bg-purple-700 text-white p-1 rounded-full shadow-md cursor-pointer hover:bg-purple-800 transition flex items-center justify-center"
              title="Upload Store Logo"
            >
              <Camera className="w-3 h-3" />
            </label>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-purple-950">
          {step === 1 ? 'Register Store' : 'Verify Your Email'}
        </h2>
        <p className="text-[11px] text-center text-purple-600 mb-4">
          {step === 1
            ? 'Become a seller & reach thousands of customers'
            : `We sent a 6-digit OTP code to ${form.email.trim()}`}
        </p>

        {/* Dynamic Alerts */}
        {authError && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg flex items-start gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-start gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{authSuccess}</span>
          </div>
        )}

        {/* STEP 1: Signup Form */}
        {step === 1 && (
        <form onSubmit={handleSubmit} noValidate>
          
          {/* Store Name */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Store / Business Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <input 
                type="text" 
                placeholder="My Awesome Store" 
                value={form.storeName} 
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.storeName ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`} 
              />
            </div>
            {errors.storeName && <span className="text-[11px] text-red-500 pt-0.5 block font-medium">{errors.storeName}</span>}
          </div>

          {/* Email Field */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Business Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input 
                type="email" 
                placeholder="vendor@example.com" 
                value={form.email} 
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.email ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`} 
              />
            </div>
            {errors.email && <span className="text-[11px] text-red-500 pt-0.5 block font-medium">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Min 8 characters" 
                value={form.password} 
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-9 pr-9 py-2 text-xs sm:text-sm border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.password ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-700 transition"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && <span className="text-[11px] text-red-500 pt-0.5 block font-medium">{errors.password}</span>}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="Re-enter password" 
                value={form.confirmPassword} 
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-9 pr-9 py-2 text-xs sm:text-sm border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`} 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-700 transition"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-[11px] text-red-500 pt-0.5 block font-medium">{errors.confirmPassword}</span>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting || isGoogleLoading} 
            className="w-full bg-purple-700 text-white py-2.5 px-4 rounded-lg hover:bg-purple-800 transition-all font-semibold shadow-sm border border-purple-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Apply as Vendor</span>
              </>
            )}
          </button>
        </form>
        )}

        {/* STEP 2: Verify OTP Form — markup reused as-is from forgot-password/page.js */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate>
            <div className="mb-4">
              <label htmlFor="otp" className="block text-[11px] font-semibold text-purple-900 mb-1 text-center">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                id="otp"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                placeholder="123456"
                disabled={isSubmitting}
                className="w-full py-2 px-3 text-center text-lg tracking-[0.3em] font-bold border border-purple-200 rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length < 6}
              className="w-full bg-purple-700 text-white py-2.5 px-4 rounded-lg hover:bg-purple-800 transition-all font-semibold shadow-sm border border-purple-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm mb-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify OTP</span>
                </>
              )}
            </button>

            <div className="flex flex-col items-center gap-1.5 pt-1">
              {cooldown > 0 ? (
                <span className="text-[11px] text-purple-600 font-medium">
                  Resend code in <strong className="text-purple-900">{cooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-950 hover:underline flex items-center gap-1 transition"
                >
                  <span>Resend OTP Code</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setAuthError('');
                }}
                className="text-[10px] text-purple-500 hover:text-purple-800 hover:underline transition"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
        <>
        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="px-2.5 bg-white text-purple-400 font-semibold">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isSubmitting || isGoogleLoading}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-purple-50/50 text-gray-700 py-2 px-4 rounded-lg transition-all font-semibold border border-purple-200 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed text-xs shadow-sm"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
              <span className="text-purple-600">Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </>
          )}
        </button>

        <p className="mt-4 text-center text-[11px] text-purple-800 font-medium">
          Already registered as vendor?{' '}
          <Link href="/signin/vendor" className="text-purple-950 font-bold hover:underline">
            Vendor Login
          </Link>
        </p>
        </>
        )}

      </div>
    </div>
  );
}