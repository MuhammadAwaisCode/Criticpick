'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function VendorSignUp() {
  const router = useRouter();
  const supabase = createClient();

  const [formValues, setFormValues] = useState({ 
    storeName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [avatarImage, setAvatarImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  function handleFieldChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setAuthError('');
    setAuthSuccess('');
  }

  function handleAvatarChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarImage(e.target.result);
    reader.readAsDataURL(file);
  }

  function validate() {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formValues.storeName.trim()) {
      nextErrors.storeName = 'Store Name is required';
    }
    if (!emailRegex.test(formValues.email)) {
      nextErrors.email = 'Valid Business Email is required';
    }
    if (formValues.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    if (formValues.confirmPassword !== formValues.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  // Real Supabase Email/Password Signup Handler
  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formValues.email.trim(),
        password: formValues.password,
        options: {
          data: {
            store_name: formValues.storeName.trim(),
            role: 'vendor',
            avatar_url: avatarImage || null,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsSubmitting(false);
        return;
      }

      if (data?.user && !data?.session) {
        setAuthSuccess('Account created successfully! Please check your email to verify your store.');
        setIsSubmitting(false);
      } else {
        router.push('/vendoradmin');
      }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  }

  // Real Supabase Google OAuth Handler
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/vendoradmin`,
          queryParams: {
            role: 'vendor'
          }
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setAuthError('Could not connect to Google authentication.');
      setIsGoogleLoading(false);
    }
  };

  const avatarLetter = (formValues.storeName || formValues.email || '').trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-screen flex items-center justify-center px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md border-2 border-purple-300 my-8">
        
        {/* Avatar Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div 
              id="avatar-preview" 
              className="w-24 h-24 rounded-full bg-purple-100 border-4 border-purple-400 flex items-center justify-center overflow-hidden text-purple-900 font-bold text-xl"
            >
              {avatarImage ? (
                <img src={avatarImage} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
            <input 
              type="file" 
              id="avatar-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              disabled={isSubmitting || isGoogleLoading}
            />
            <label 
              htmlFor="avatar-upload" 
              className={`absolute bottom-0 right-0 bg-purple-600 text-white w-7 h-7 rounded-full transition flex items-center justify-center text-lg font-bold ${
                isSubmitting || isGoogleLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-700'
              }`}
            >
              +
            </label>
          </div> 
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-purple-900">Vendor Register</h2>
        
        {/* Supabase Alert Banners */}
        {authError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-md text-center">
            {authError}
          </div>
        )}
        {authSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 text-xs rounded-md text-center">
            {authSuccess}
          </div>
        )}

        <form id="signupForm" onSubmit={handleSubmit} noValidate>
          
          {/* Store Name Input */}
          <div className="mb-4">
            <input
              type="text"
              id="signup-storename"
              value={formValues.storeName}
              onChange={(e) => handleFieldChange('storeName', e.target.value)}
              placeholder="Store Name"
              disabled={isSubmitting || isGoogleLoading}
              className={`w-full p-3 border-2 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                errors.storeName ? 'border-red-500' : 'border-purple-200'
              }`}
            />
            {errors.storeName && (
              <span className="error-msg text-xs text-red-500 pt-1 block">
                {errors.storeName}
              </span>
            )}
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              id="signup-email"
              value={formValues.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder="Business Email"
              disabled={isSubmitting || isGoogleLoading}
              className={`w-full p-3 border-2 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                errors.email ? 'border-red-500' : 'border-purple-200'
              }`}
            />
            {errors.email && (
              <span className="error-msg text-xs text-red-500 pt-1 block">
                {errors.email}
              </span>
            )}
          </div>
          
          {/* Password Input */}
          <div className="mb-4">
            <input
              type="password"
              id="signup-password"
              value={formValues.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              placeholder="Password (Min 8 chars)"
              disabled={isSubmitting || isGoogleLoading}
              className={`w-full p-3 border-2 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                errors.password ? 'border-red-500' : 'border-purple-200'
              }`}
            />
            {errors.password && (
              <span className="error-msg text-xs text-red-500 pt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="mb-6">
            <input
              type="password"
              id="signup-confirmpassword"
              value={formValues.confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              placeholder="Confirm Password"
              disabled={isSubmitting || isGoogleLoading}
              className={`w-full p-3 border-2 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                errors.confirmPassword ? 'border-red-500' : 'border-purple-200'
              }`}
            />
            {errors.confirmPassword && (
              <span className="error-msg text-xs text-red-500 pt-1 block">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || isGoogleLoading} 
            className="w-full bg-purple-700 text-white p-3 rounded-md hover:bg-purple-800 transition font-semibold border-2 border-purple-700 disabled:opacity-75 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registering...' : 'Register Store'}
          </button>
        </form> 

        {/* --- Divider --- */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="px-3 bg-white text-purple-400 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        {/* --- Google Sign-Up Button --- */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isSubmitting || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-purple-50 text-gray-700 p-3 rounded-md transition font-semibold border-2 border-purple-200 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <span className="text-purple-600">Connecting to Google...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </>
          )}
        </button>
        
        <p className="mt-6 text-center text-sm text-purple-800">
          Already have a vendor account?{' '}
          <Link href="/signin/vendor" className="text-purple-900 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}