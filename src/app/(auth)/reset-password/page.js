'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    if (!password) {
      setError('New password is required.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Supabase authenticated session update password call
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccessMessage('Your password has been reset successfully! Redirecting to login...');

      // 2 seconds delay ke baad user ko signin page par bhej dein
      setTimeout(() => {
        router.push('/signin/customer');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again or request a new link.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-screen flex items-center justify-center px-4 py-10 sm:py-12">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md border-2 border-purple-300 my-8">
        
        {/* Key Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-purple-100 border-4 border-purple-300 flex items-center justify-center text-purple-700 text-3xl shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-purple-900 mb-2">Set New Password</h2>
        <p className="text-sm text-purple-700 text-center mb-6">
          Your new password must be different from previously used passwords.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-md text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 text-xs rounded-md text-center font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* New Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-xs font-semibold text-purple-900 uppercase mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="At least 6 characters"
              disabled={isSubmitting || Boolean(successMessage)}
              className="w-full p-3 border-2 border-purple-200 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100"
            />
          </div>

          {/* Confirm New Password Input */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-purple-900 uppercase mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Re-enter new password"
              disabled={isSubmitting || Boolean(successMessage)}
              className="w-full p-3 border-2 border-purple-200 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
            className="w-full bg-purple-700 text-white p-3 rounded-md hover:bg-purple-800 transition font-semibold border-2 border-purple-700 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Updating Password...</span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-purple-100 text-center">
          <Link 
            href="/signin/customer" 
            className="text-sm font-semibold text-purple-800 hover:text-purple-950 hover:underline inline-flex items-center gap-2 transition"
          >
            <span>&larr;</span> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}