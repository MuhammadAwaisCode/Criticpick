'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  LogIn,
  Store,
} from 'lucide-react';

export default function VendorSignIn() {
  const router = useRouter();
  const supabase = createClient();

  // State Management
  const [formValues, setFormValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [avatarLetter, setAvatarLetter] = useState('?');

  function handleFieldChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setAuthError('');

    if (field === 'identifier') {
      const trimmed = value.trim();
      setAvatarLetter(trimmed ? trimmed.charAt(0).toUpperCase() : '?');
    }
  }

  function validate() {
    const nextErrors = {};
    if (!formValues.identifier.trim()) {
      nextErrors.identifier = 'Vendor Email or Username is required';
    }
    if (!formValues.password.trim()) {
      nextErrors.password = 'Password is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  // Supabase Email/Password Login Handler
  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');

    try {
      let emailToSubmit = formValues.identifier.trim();

      // Step 1: Resolve Username to Email if needed
      if (!emailToSubmit.includes('@')) {
        const { data: userData, error: usernameError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', emailToSubmit)
          .maybeSingle();

        if (usernameError || !userData?.email) {
          throw new Error('Vendor username not found. Please check your credentials.');
        }
        emailToSubmit = userData.email;
      }

      // Step 2: Authenticate User
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToSubmit,
        password: formValues.password,
      });

      if (error) throw error;

      const user = data.user;

      // Step 3: Confirm role via profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const accountRole = profile?.role || user?.user_metadata?.role;

      // Role Enforcement
      if (accountRole && accountRole !== 'vendor') {
        await supabase.auth.signOut();
        throw new Error('Unauthorized access. This portal is exclusively for Vendors.');
      }

      // Step 4: Look up this vendor's account_status (source of truth for approval)
      const { data: vendorRecord, error: vendorError } = await supabase
        .from('vendors')
        .select('account_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vendorError) throw vendorError;

      const accountStatus = vendorRecord?.account_status || 'pending_admin';

      // Vendor Account Status Verification — login is only allowed once approved
      if (accountStatus === 'pending_admin') {
        await supabase.auth.signOut();
        throw new Error('⏳ Aap ka Vendor account Admin Review mein hai. Admin ki approval ke baad hi aap login kar saken gay.');
      }

      if (accountStatus === 'rejected') {
        await supabase.auth.signOut();
        throw new Error('❌ Aap ka Vendor account reject kar diya gaya hai. Further details ke liye support team se rabta karein.');
      }

      if (accountStatus !== 'approved') {
        await supabase.auth.signOut();
        throw new Error('Account status invalid. Please contact support.');
      }

      router.push('/vendoradmin/profile');
    } catch (err) {
      console.error('Vendor Login Error:', err);
      setAuthError(err.message || 'Invalid vendor credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Supabase Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError('');

    const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback?role=vendor&next=/vendoradmin/profile`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google Auth Error:', err);
      setAuthError('Could not connect to Google authentication.');
      setIsGoogleLoading(false);
    }
  };

  const isEmailInput = formValues.identifier.includes('@');

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8 w-full">
      
      {/* Standard Compact Card (380px Max-Width) */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-[380px] border border-purple-200">
        
        {/* Vendor Portal Badge & Compact Avatar */}
        <div className="flex flex-col items-center mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-semibold mb-3 border border-purple-200">
            <Store className="w-3 h-3 text-purple-700" /> Vendor Portal
          </span>

          <div className="w-14 h-14 rounded-full bg-purple-50 border-2 border-purple-300 flex items-center justify-center overflow-hidden text-purple-900 font-bold text-xl shadow-inner">
            <span>{avatarLetter}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-purple-950">Vendor Login</h2>
        <p className="text-[11px] text-center text-purple-600 mb-4">
          Access your store dashboard & management portal.
        </p>
        
        {/* Compact Alert Banner */}
        {authError && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg flex items-start gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          
          {/* Email/Username Input */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Email or Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                {isEmailInput ? <Mail className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <input
                type="text"
                id="login-identifier"
                value={formValues.identifier}
                onChange={(e) => handleFieldChange('identifier', e.target.value)}
                placeholder="Vendor Email or Username"
                disabled={isSubmitting || isGoogleLoading}
                className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.identifier ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`}
              />
            </div>
            {errors.identifier && (
              <span className="text-[10px] text-red-500 pt-0.5 block font-medium">
                {errors.identifier}
              </span>
            )}
          </div>
          
          {/* Password Input */}
          <div className="mb-1.5">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                value={formValues.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder="Enter your password"
                disabled={isSubmitting || isGoogleLoading}
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

          {/* Forgot Password Link */}
          <div className="mb-4 text-right">
            <Link 
              href="/forgot-password" 
              className="text-[11px] font-semibold text-purple-700 hover:text-purple-950 hover:underline transition"
            >
              Forgot Password?
            </Link>
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
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Login to Store</span>
              </>
            )}
          </button>
        </form> 

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

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
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
              Login with Google
            </>
          )}
        </button>
        
        <p className="mt-4 text-center text-[11px] text-purple-800 font-medium">
          Do not have a vendor account?{' '}
          <Link href="/signup/vendor" className="text-purple-950 font-bold hover:underline">
            Register store
          </Link>
        </p>

      </div>
    </div>
  );
}