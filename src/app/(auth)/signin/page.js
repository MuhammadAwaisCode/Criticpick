'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Store,
  Briefcase,
  Handshake,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  LogIn,
} from 'lucide-react';

const ROLES = [
  {
    key: 'customer',
    label: 'Customer',
    icon: User,
    heading: 'Customer Login',
    identifierPlaceholder: 'Email or Username',
    identifierError: 'Please enter your email or username',
    signupHref: '/signup/customer',
    registerCopy: 'Do not have an account?',
    redirectUrl: '/profile',
  },
  {
    key: 'vendor',
    label: 'Vendor',
    icon: Store,
    heading: 'Vendor Login',
    identifierPlaceholder: 'Vendor Email or Username',
    identifierError: 'Please enter vendor email or username',
    signupHref: '/signup/vendor',
    registerCopy: 'Do not have a vendor account?',
    redirectUrl: '/vendoradmin',
  },
  {
    key: 'trader',
    label: 'Trader',
    icon: Briefcase,
    heading: 'Trader Login',
    identifierPlaceholder: 'Trader Email or Username',
    identifierError: 'Please enter trader email or username',
    signupHref: '/signup/trader',
    registerCopy: 'Do not have a trader account?',
    redirectUrl: '/seapanel',
  },
  {
    key: 'affiliater',
    label: 'Affiliate',
    icon: Handshake,
    heading: 'Affiliate Login',
    identifierPlaceholder: 'Affiliate Email or Username',
    identifierError: 'Please enter affiliate email or username',
    signupHref: '/signup/affiliater',
    registerCopy: 'Do not have an affiliate account?',
    redirectUrl: '/profile',
  },
];

const DEFAULT_ROLE_KEY = 'customer';

function getRoleConfig(key) {
  return ROLES.find((role) => role.key === key) || ROLES.find((role) => role.key === DEFAULT_ROLE_KEY);
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const supabase = createClient();

  const [activeRoleKey, setActiveRoleKey] = useState(
    ROLES.some((role) => role.key === initialRoleParam) ? initialRoleParam : DEFAULT_ROLE_KEY
  );
  const role = getRoleConfig(activeRoleKey);

  // Form State
  const [formValues, setFormValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function handleRoleChange(nextKey) {
    if (nextKey === activeRoleKey) return;
    setActiveRoleKey(nextKey);
    setFormValues({ identifier: '', password: '' });
    setErrors({});
    setSubmitError('');
    router.replace(`/signin?role=${nextKey}`, { scroll: false });
  }

  function handleFieldChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setSubmitError('');
  }

  function validate() {
    const nextErrors = {};
    if (!formValues.identifier.trim()) nextErrors.identifier = role.identifierError;
    if (!formValues.password.trim()) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      let emailToSubmit = formValues.identifier.trim();

      // Username to Email Resolution
      if (!emailToSubmit.includes('@')) {
        const { data: userData, error: usernameError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', emailToSubmit)
          .maybeSingle();

        if (usernameError || !userData?.email) {
          throw new Error('Username not found. Please enter a valid email or username.');
        }
        emailToSubmit = userData.email;
      }

      // Authenticate Credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToSubmit,
        password: formValues.password,
      });

      if (error) throw error;

      const user = data?.user;

      // Fetch Updated Profile directly from Database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const userRole = profile?.role || user?.user_metadata?.role;
      const userStatus = profile?.status || user?.user_metadata?.status || 'approved';

      // Strict Role Validation
      const normalizeRole = (r) => (r === 'affiliate' ? 'affiliater' : r);
      const normalizedUserRole = normalizeRole(userRole);
      const normalizedActiveRole = normalizeRole(activeRoleKey);

      if (normalizedUserRole && normalizedUserRole !== normalizedActiveRole) {
        await supabase.auth.signOut();
        throw new Error(
          `Access Denied: This account is registered as a "${userRole?.toUpperCase()}". Please switch to the ${userRole} tab to sign in.`
        );
      }

      // Status & Approval Check
      if (userStatus === 'pending') {
        await supabase.auth.signOut();
        throw new Error('⏳ Your account application is currently pending Admin Review.');
      }

      if (['blocked', 'suspended', 'rejected'].includes(userStatus)) {
        await supabase.auth.signOut();
        throw new Error(`🚫 Account access restricted (Status: ${userStatus}). Please contact support.`);
      }

      // Redirect to specific portal
      router.push(role.redirectUrl);
    } catch (err) {
      console.error('Sign-In Error:', err);
      setSubmitError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setSubmitError('');

    try {
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback?role=${activeRoleKey}&next=${encodeURIComponent(role.redirectUrl)}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google Auth Error:', err);
      setSubmitError('Could not connect to Google authentication.');
      setIsGoogleLoading(false);
    }
  }

  const RoleIcon = role.icon;
  const isEmailInput = formValues.identifier.includes('@');

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        
        {/* Role Switcher Tabs */}
        <div className="flex bg-white/50 backdrop-blur-md rounded-2xl p-1.5 mb-5 shadow-lg border border-purple-200" role="tablist" aria-label="Select account type">
          {ROLES.map((r) => {
            const IconComponent = r.icon;
            const isActive = r.key === activeRoleKey;
            return (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleRoleChange(r.key)}
                className={`flex-1 text-[11px] font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-purple-700 text-white shadow-md scale-[1.02]'
                    : 'text-purple-900 hover:bg-white/60'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Card Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-purple-200">
          
          <div className="flex justify-center mb-3">
            <span className="p-3 bg-purple-100 text-purple-700 rounded-full">
              <RoleIcon className="w-6 h-6" />
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-1 text-center text-purple-950">{role.heading}</h2>
          <p className="text-xs text-center text-purple-600 mb-6">Enter your credentials to access your portal</p>

          {/* Error Alert Box */}
          {submitError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-xl flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Identifier Field */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-purple-900 mb-1">Email or Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  {isEmailInput ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  value={formValues.identifier}
                  onChange={(e) => handleFieldChange('identifier', e.target.value)}
                  placeholder={role.identifierPlaceholder}
                  disabled={isSubmitting || isGoogleLoading}
                  aria-invalid={Boolean(errors.identifier)}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm border-2 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                    errors.identifier ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                  }`}
                />
              </div>
              {errors.identifier && (
                <span className="text-xs text-red-500 pt-1 block font-medium">{errors.identifier}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-purple-900 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formValues.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting || isGoogleLoading}
                  aria-invalid={Boolean(errors.password)}
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
              {errors.password && (
                <span className="text-xs text-red-500 pt-1 block font-medium">{errors.password}</span>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="mb-5 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline transition"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full bg-purple-700 text-white py-3 px-4 rounded-xl hover:bg-purple-800 transition-all font-semibold shadow-md border-2 border-purple-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login to Portal</span>
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
              <span className="px-3 bg-white text-purple-400 font-semibold">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
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
                Sign in with Google
              </>
            )}
          </button>

          {/* Register Copy Link */}
          <p className="mt-6 text-center text-xs text-purple-800 font-medium">
            {role.registerCopy}{' '}
            <Link href={role.signupHref} className="text-purple-950 font-bold hover:underline">
              Register here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)]" />}>
      <SignInForm />
    </Suspense>
  );
}