'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ROLES = [
  {
    key: 'customer',
    label: 'Customer',
    icon: 'fa-user',
    heading: 'Customer Login',
    identifierPlaceholder: 'Email Address',
    identifierError: 'Please enter your email address',
    signupHref: '/signup/customer',
    registerCopy: 'Do not have an account?',
    redirectUrl: '/profile',
  },
  {
    key: 'vendor',
    label: 'Vendor',
    icon: 'fa-store',
    heading: 'Vendor Login',
    identifierPlaceholder: 'Vendor Email',
    identifierError: 'Field is required',
    signupHref: '/signup/vendor',
    registerCopy: 'Do not have a vendor account?',
    redirectUrl: '/seapanel',
  },
  {
    key: 'trader',
    label: 'Trader',
    icon: 'fa-briefcase',
    heading: 'Trader Login',
    identifierPlaceholder: 'Trader Email',
    identifierError: 'Trader Email is required',
    signupHref: '/signup/trader',
    registerCopy: 'Do not have a trader account?',
    redirectUrl: '/seapanel',
  },
  {
    key: 'affiliater',
    label: 'Affiliater',
    icon: 'fa-handshake',
    heading: 'Affiliater Login',
    identifierPlaceholder: 'Email Address',
    identifierError: 'This field is required',
    signupHref: '/signup/affiliater',
    registerCopy: 'Do not have an affiliater account?',
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

  const [formValues, setFormValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formValues.identifier.trim(),
        password: formValues.password,
      });

      if (error) {
        setSubmitError(error.message);
        setIsSubmitting(false);
        return;
      }

      if (data?.user) {
        router.push(role.redirectUrl);
      }
    } catch (err) {
      setSubmitError('An unexpected authentication error occurred. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        
        {/* Role switcher tabs */}
        <div className="flex bg-white/40 backdrop-blur rounded-full p-1 mb-4 shadow-inner" role="tablist" aria-label="Select account type">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={r.key === activeRoleKey}
              onClick={() => handleRoleChange(r.key)}
              className={`flex-1 text-[11px] font-bold py-2 rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer ${
                r.key === activeRoleKey
                  ? 'bg-purple-700 text-white shadow'
                  : 'text-purple-900 hover:bg-white/60'
              }`}
            >
              <i className={`fas ${r.icon} text-[10px]`} />
              {r.label}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-lg shadow-2xl border-2 border-purple-300">
          
          <h2 className="text-2xl font-bold mb-6 text-center text-purple-900">{role.heading}</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <input
                type="email"
                value={formValues.identifier}
                onChange={(e) => handleFieldChange('identifier', e.target.value)}
                placeholder={role.identifierPlaceholder}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.identifier)}
                className={`w-full p-3 border-2 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                  errors.identifier ? 'border-red-500' : 'border-purple-200'
                }`}
              />
              {errors.identifier && (
                <span className="text-xs text-red-500 pt-1 block">{errors.identifier}</span>
              )}
            </div>

            <div className="mb-4">
              <input
                type="password"
                value={formValues.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder="Password"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                className={`w-full p-3 border-2 rounded-md text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                  errors.password ? 'border-red-500' : 'border-purple-200'
                }`}
              />
              {errors.password && (
                <span className="text-xs text-red-500 pt-1 block">{errors.password}</span>
              )}
            </div>

            {submitError && (
              <p className="text-xs text-red-500 mb-4 text-center font-medium bg-red-50 p-2 rounded border border-red-200">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-700 text-white p-3 rounded-md hover:bg-purple-800 transition font-semibold border-2 border-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting && <i className="fas fa-circle-notch fa-spin" />}
              {isSubmitting ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="#" className="text-sm text-purple-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <p className="mt-4 text-center text-sm text-purple-800">
            {role.registerCopy}{' '}
            <Link href={role.signupHref} className="text-purple-900 font-bold hover:underline">
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