'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  KeyRound,
  Mail,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Send,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Send OTP to Email
  async function handleSendOtp(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Email address is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error: otpError } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (otpError) throw otpError;
      setStep(2);
      setCooldown(60); // 60s resend cooldown
    } catch (err) {
      console.error('Send OTP Error:', err);
      setError(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
//
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: cleanOtp,
        type: 'recovery',
      });

      if (verifyError) throw verifyError;

      if (data?.session) {
        router.push('/reset-password');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError(err.message || 'Invalid or expired OTP code. Please check again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Sanitize OTP input to numbers only
  function handleOtpChange(value) {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    if (error) setError('');
  }

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8 w-full">
      
      {/* Compact Card Container */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-[380px] border border-purple-200 my-4">
        
        {/* Top Icon Header */}
        <div className="flex flex-col items-center mb-2">
          <div className="w-14 h-14 rounded-full bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-700 shadow-inner mb-2">
            {step === 1 ? (
              <KeyRound className="w-6 h-6 text-purple-700" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-purple-700" />
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-purple-950">
          {step === 1 ? 'Forgot Password?' : 'Enter OTP Code'}
        </h2>
        
        <p className="text-[11px] text-purple-600 text-center mb-4 leading-relaxed">
          {step === 1 
            ? 'Enter your email address to receive a 6-digit verification code.' 
            : `We sent a 6-digit OTP code to ${email}`}
        </p>

        {/* Alert Error Box */}
        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg flex items-start gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{error}</span>
          </div>
        )}

        {/* STEP 1: Request OTP Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-[11px] font-semibold text-purple-900 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
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
                  className="w-full pl-9 pr-3 py-2 text-xs border border-purple-200 rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-700 text-white py-2.5 px-4 rounded-lg hover:bg-purple-800 transition-all font-semibold shadow-sm border border-purple-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send OTP Code</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP Form */}
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
                  <ShieldCheck className="w-3.5 h-3.5" />
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
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-950 hover:underline flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend OTP Code</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                }}
                className="text-[10px] text-purple-500 hover:text-purple-800 hover:underline transition"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}

        {/* Navigation Back */}
        <div className="mt-5 pt-3 border-t border-purple-100 text-center">
          <Link 
            href="/signin" 
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