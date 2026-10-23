'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check if active recovery session exists
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/forgot-password');
      } else {
        setIsCheckingSession(false);
      }
    }
    checkSession();
  }, [router, supabase]);

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
      // Supabase authenticated session password update
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccessMessage('Your password has been reset successfully! Redirecting to login...');

      // Clear recovery session before sending to sign-in
      await supabase.auth.signOut();

      setTimeout(() => {
        router.push('/signin/customer');
      }, 2000);
    } catch (err) {
      console.error('Reset Password Error:', err);
      setError(err.message || 'Failed to reset password. Please try again or request a new OTP.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8 w-full">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-[380px] border border-purple-200 flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-700 animate-spin mb-2" />
          <p className="text-xs text-purple-900 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8 w-full">
      
      {/* Compact Card Container */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-[380px] border border-purple-200 my-4">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center mb-2">
          <div className="w-14 h-14 rounded-full bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-700 shadow-inner mb-2">
            <KeyRound className="w-6 h-6 text-purple-700" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-purple-950">Set New Password</h2>
        <p className="text-[11px] text-purple-600 text-center mb-4 leading-relaxed">
          Your new password must be different from previously used passwords.
        </p>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg flex items-start gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{error}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-start gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          
          {/* New Password Input */}
          <div className="mb-3">
            <label htmlFor="password" className="block text-[11px] font-semibold text-purple-900 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="At least 6 characters"
                disabled={isSubmitting || Boolean(successMessage)}
                className="w-full pl-9 pr-9 py-2 text-xs border border-purple-200 rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-700 transition"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Input */}
          <div className="mb-5">
            <label htmlFor="confirmPassword" className="block text-[11px] font-semibold text-purple-900 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Re-enter new password"
                disabled={isSubmitting || Boolean(successMessage)}
                className="w-full pl-9 pr-9 py-2 text-xs border border-purple-200 rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-700 transition"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Reset Password Button */}
          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
            className="w-full bg-purple-700 text-white py-2.5 px-4 rounded-lg hover:bg-purple-800 transition-all font-semibold shadow-sm border border-purple-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-5 pt-3 border-t border-purple-100 text-center">
          <Link 
            href="/signin/customer" 
            className="text-[11px] font-semibold text-purple-800 hover:text-purple-950 hover:underline inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
}