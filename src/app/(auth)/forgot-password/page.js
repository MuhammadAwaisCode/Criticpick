'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Verify OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Email par OTP bhejne ka function
  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: otpError } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (otpError) throw otpError;

      // Email chala gaya -> Ab Step 2 (OTP Input Screen) par le jao
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 2: Entered OTP ko verify karne ka function
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setIsSubmitting(true);

    try {
      // Supabase OTP Verify call (type: 'recovery')
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'recovery',
      });

      if (verifyError) throw verifyError;

      if (data?.session) {
        // Successful verification -> Directly user ko Reset Password page par le jao
        router.push('/reset-password');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code. Please check again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-screen flex items-center justify-center px-4 py-10">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md border-2 border-purple-300">
        
        {/* Top Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-purple-100 border-4 border-purple-300 flex items-center justify-center text-purple-700 text-3xl shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-purple-900 mb-2">
          {step === 1 ? 'Forgot Password?' : 'Enter OTP Code'}
        </h2>
        
        <p className="text-sm text-purple-700 text-center mb-6">
          {step === 1 
            ? 'Enter your email address to receive a 6-digit OTP code.' 
            : `We have sent a 6-digit OTP code to ${email}`}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-md text-center">
            {error}
          </div>
        )}

        {/* STEP 1: EMAIL FORM */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate>
            <div className="mb-5">
              <label htmlFor="email" className="block text-xs font-semibold text-purple-900 uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="name@example.com"
                disabled={isSubmitting}
                className="w-full p-3 border-2 border-purple-200 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-700 text-white p-3 rounded-md hover:bg-purple-800 transition font-semibold border-2 border-purple-700 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP Code'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION FORM */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate>
            <div className="mb-5">
              <label htmlFor="otp" className="block text-xs font-semibold text-purple-900 uppercase mb-2">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                id="otp"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (error) setError('');
                }}
                placeholder="123456"
                disabled={isSubmitting}
                className="w-full p-3 text-center text-xl tracking-widest font-bold border-2 border-purple-200 rounded-md text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-700 text-white p-3 rounded-md hover:bg-purple-800 transition font-semibold border-2 border-purple-700 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mb-3"
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
              }}
              className="w-full text-xs text-purple-700 hover:underline text-center cursor-pointer"
            >
              Change Email / Resend Code
            </button>
          </form>
        )}

        {/* Back to Login */}
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