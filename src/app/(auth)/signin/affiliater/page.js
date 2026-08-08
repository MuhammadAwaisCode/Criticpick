'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AffiliaterSignIn() {
  const router = useRouter();
  const supabase = createClient();

  // State variables
  const [formValues, setFormValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLetter, setAvatarLetter] = useState('?');

  // Input fields change handler
  function handleFieldChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setAuthError('');
  }

  // Dynamic Avatar Letter on Blur
  function handleIdentifierBlur() {
    const trimmed = formValues.identifier.trim();
    if (trimmed && !avatarUrl) {
      setAvatarLetter(trimmed.charAt(0).toUpperCase());
    } else if (!trimmed && !avatarUrl) {
      setAvatarLetter('?');
    }
  }

  // Avatar Image Upload handler
  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  }

  // Clean up Object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  // Validation logic
  function validate() {
    const nextErrors = {};
    if (!formValues.identifier.trim()) {
      nextErrors.identifier = 'This field is required';
    }
    if (!formValues.password.trim()) {
      nextErrors.password = 'Password is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  // Supabase Form Submit handler
  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formValues.identifier.trim(),
        password: formValues.password,
      });

      if (error) throw error;

      router.push('/profile');
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.');
      setIsSubmitting(false);
    }
  }

  // Supabase Google Sign-In handler
  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setAuthError('Could not connect to Google authentication.');
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md border-2 border-purple-300">
        
        {/* Avatar Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              id="avatar-preview"
              className="w-24 h-24 rounded-full bg-purple-100 border-4 border-purple-400 flex items-center justify-center overflow-hidden text-purple-900 font-bold text-xl"
            >
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
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
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-full cursor-pointer hover:bg-purple-700 transition"
            >
              +
            </label>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center text-purple-900">Affiliater Login</h2>
        <p className="text-center text-purple-600 mb-6 text-sm">Sign in to track your referrals and earnings.</p>

        {authError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-md text-center">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <input
              type="text"
              id="login-identifier"
              value={formValues.identifier}
              onChange={(e) => handleFieldChange('identifier', e.target.value)}
              onBlur={handleIdentifierBlur}
              placeholder="Email or Username"
              disabled={isSubmitting || isGoogleLoading}
              className={`w-full p-3 border-2 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                errors.identifier ? 'border-red-500' : 'border-purple-200'
              }`}
            />
            {errors.identifier && (
              <span className="error-msg text-xs text-red-500 pt-1 block">
                {errors.identifier}
              </span>
            )}
          </div>

          <div className="mb-4">
            <input
              type="password"
              id="login-password"
              value={formValues.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              placeholder="Password"
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

          <div className="mb-5 text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline transition">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full bg-purple-700 text-white p-3 rounded-md hover:bg-purple-800 transition font-semibold border-2 border-purple-700 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-purple-500 font-medium">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 p-3 rounded-md hover:bg-gray-50 transition font-semibold border-2 border-purple-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
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
              Sign in with Google
            </>
          )}
        </button>

        <p className="mt-6 text-center text-sm text-purple-800">
          Do not have an affiliater account?{' '}
          <Link href="/signup/affiliater" className="text-purple-900 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}