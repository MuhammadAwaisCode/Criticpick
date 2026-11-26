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
  UserPlus,
  Camera,
} from 'lucide-react';

export default function GenericSignUp() {
  const router = useRouter();
  const supabase = createClient();

  // State Management
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);

  // Input Change Handler
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setAuthError('');
    setAuthSuccess('');
  };

  // Avatar Selection & Memory-Safe Preview
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAuthError('Please select a valid image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setAuthError('Profile picture must be under 2MB');
        return;
      }

      // Cleanup old preview URL to prevent memory leak
      if (avatarImage && avatarImage.startsWith('blob:')) {
        URL.revokeObjectURL(avatarImage);
      }

      const url = URL.createObjectURL(file);
      setAvatarImage(url);
      setAuthError('');
    }
  };

  // Revoke ObjectURL on Unmount
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
      nextErrors.email = 'Please enter a valid email address';
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

  // Supabase Signup Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const cleanEmail = form.email.trim().toLowerCase();
      const defaultName = cleanEmail.split('@')[0];

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.password,
        options: {
          data: {
            role: 'customer',
            full_name: defaultName,
            status: 'active',
          },
        },
      });

      if (error) throw error;

      if (data?.user && !data?.session) {
        setAuthSuccess('Account created! Please check your email inbox to verify your account.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      setAuthError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setAuthError('');

    try {
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google OAuth Error:', err);
      setAuthError(err?.message || 'Could not connect to Google authentication.');
      setIsGoogleLoading(false);
    }
  };

  const avatarLetter = (form.email || '').trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-screen flex items-center justify-center px-4 py-10">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md border border-purple-200">
        
        {/* Avatar Section */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-purple-50 border-4 border-purple-300 flex items-center justify-center overflow-hidden text-purple-900 font-bold text-2xl shadow-inner transition-all">
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
              onChange={handleAvatarChange}
              disabled={isSubmitting || isGoogleLoading}
            />
            <label 
              htmlFor="avatar-upload" 
              className={`absolute bottom-0 right-0 bg-purple-700 text-white p-1.5 rounded-full shadow-md transition flex items-center justify-center ${
                isSubmitting || isGoogleLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-800 hover:scale-105'
              }`}
              title="Upload Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
          </div> 
        </div>

        <h2 className="text-2xl font-bold mb-1 text-center text-purple-950">Register Account</h2>
        <p className="text-xs text-center text-purple-600 mb-6">Create your account to get started</p>

        {/* Dynamic Status Notifications */}
        {authError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-xl flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{authSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-purple-900 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={form.email} 
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm border-2 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.email ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`} 
              />
            </div>
            {errors.email && <span className="text-xs text-red-500 pt-1 block font-medium">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-purple-900 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Min 8 characters" 
                value={form.password} 
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 text-sm border-2 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.password ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-700 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-red-500 pt-1 block font-medium">{errors.password}</span>}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-purple-900 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="Re-enter password" 
                value={form.confirmPassword} 
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 text-sm border-2 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`} 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-700 transition"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-xs text-red-500 pt-1 block font-medium">{errors.confirmPassword}</span>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting || isGoogleLoading} 
            className="w-full bg-purple-700 text-white py-3 px-4 rounded-xl hover:bg-purple-800 transition-all font-semibold shadow-md border-2 border-purple-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="px-3 bg-white text-purple-400 font-semibold">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isSubmitting || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-purple-50/50 text-gray-700 py-2.5 px-4 rounded-xl transition-all font-semibold border-2 border-purple-200 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed text-sm shadow-sm"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span className="text-purple-600">Connecting to Google...</span>
            </>
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

        <p className="mt-6 text-center text-xs text-purple-800 font-medium">
          Already have an account?{' '}
          <Link href="/signin/customer" className="text-purple-950 font-bold hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}