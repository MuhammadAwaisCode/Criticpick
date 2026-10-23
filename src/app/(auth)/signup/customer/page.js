'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  UserPlus,
  Camera,
} from 'lucide-react';

export default function CustomerSignUp() {
  const router = useRouter();
  const supabase = createClient();

  // State variables
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // UI Toggle States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);
  const [avatarLetter, setAvatarLetter] = useState('?');

  // Input change handler
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setAuthError('');

    // Dynamic Initial Letter update
    if (field === 'email') {
      const trimmed = value.trim();
      if (trimmed && !avatarImage) {
        setAvatarLetter(trimmed.charAt(0).toUpperCase());
      } else if (!trimmed && !avatarImage) {
        setAvatarLetter('?');
      }
    }
  };

  // Avatar Image Upload with Memory Management & Size Check
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setAuthError('Avatar image must be under 2MB');
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarImage(url);
    }
  };

  // Clean object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarImage && avatarImage.startsWith('blob:')) {
        URL.revokeObjectURL(avatarImage);
      }
    };
  }, [avatarImage]);

  // Validation Logic
  const validate = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Supabase Email & Password Sign Up
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const emailClean = form.email.trim();
      const defaultName = emailClean.split('@')[0];

      const { data, error } = await supabase.auth.signUp({
        email: emailClean,
        password: form.password,
        options: {
          data: {
            role: 'customer',
            full_name: defaultName,
            status: 'active',
            avatar_url: avatarImage || null,
          },
        },
      });

      if (error) throw error;

      if (data?.user && !data?.session) {
        setAuthSuccess('Account created successfully! Check your email to verify your account.');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      console.error('Customer Signup Error:', err);
      const errorMessage =
        err?.message ||
        err?.error_description ||
        (typeof err === 'string' ? err : 'Signup failed. Please try again.');

      setAuthError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-Up Handler
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setAuthError('');

    try {
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback?next=/profile`,
          queryParams: {
            role: 'customer',
          },
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google Auth Error:', err);
      setAuthError(err?.message || 'Could not connect to Google authentication.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8 w-full">
      
      {/* Standard Compact Card (380px Max-Width) */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-[380px] border border-purple-200 my-4">
        
        {/* Customer Badge Header */}
        <div className="flex flex-col items-center mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-semibold mb-3 border border-purple-200">
            <ShoppingBag className="w-3 h-3 text-purple-700" />
            Customer Portal
          </span>

          {/* Compact Avatar Upload */}
          <div className="relative">
            <div
              id="avatar-preview"
              className="w-16 h-16 rounded-full bg-purple-50 border-2 border-purple-300 flex items-center justify-center overflow-hidden text-purple-900 font-bold text-xl shadow-inner transition-all"
            >
              {avatarImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarImage} className="w-full h-full object-cover" alt="Avatar Preview" />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              disabled={isSubmitting || isGoogleLoading}
              onChange={handleAvatarChange}
            />
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 bg-purple-700 text-white p-1.5 rounded-full shadow-md transition flex items-center justify-center ${
                isSubmitting || isGoogleLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-purple-800 hover:scale-105'
              }`}
              title="Upload Profile Photo"
            >
              <Camera className="w-3 h-3" />
            </label>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-purple-950">Create Account</h2>
        <p className="text-[11px] text-center text-purple-600 mb-4">
          Join us to manage your orders and profile
        </p>

        {/* Compact Feedback Banners */}
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

        <form id="signupForm" onSubmit={handleSubmit} noValidate>
          
          {/* Email Input Field */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                id="email-input"
                placeholder="you@example.com"
                disabled={isSubmitting || isGoogleLoading}
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.email ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 pt-0.5 block font-medium">{errors.email}</span>
            )}
          </div>

          {/* Password Input Field */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Min. 8 characters"
                disabled={isSubmitting || isGoogleLoading}
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-9 pr-9 py-2 text-xs border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
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
            {errors.password && (
              <span className="text-[10px] text-red-500 pt-0.5 block font-medium">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password Input Field */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Re-enter password"
                disabled={isSubmitting || isGoogleLoading}
                value={form.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-9 pr-9 py-2 text-xs border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
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
            {errors.confirmPassword && (
              <span className="text-[10px] text-red-500 pt-0.5 block font-medium">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            id="registerBtn"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full bg-purple-700 text-white py-2.5 px-4 rounded-lg hover:bg-purple-800 transition-all font-semibold shadow-sm border border-purple-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        {/* --- OR Divider --- */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="px-2.5 bg-white text-purple-400 font-semibold">Or continue with</span>
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
              <span className="text-purple-600">Connecting to Google...</span>
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

        {/* Login Link */}
        <p className="mt-4 text-center text-[11px] text-purple-800 font-medium">
          Already have an account?{' '}
          <Link href="/signin/customer" className="text-purple-950 font-bold hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}