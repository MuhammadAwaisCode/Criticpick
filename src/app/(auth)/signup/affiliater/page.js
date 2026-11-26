'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import {
  User,
  Mail,
  Lock,
  Phone,
  Globe,
  AtSign,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Share2,
  UserPlus,
} from 'lucide-react';

// Country Codes List
const allCountriesData =
  "PK:92,US:1,GB:44,IN:91,AE:971,AF:93,AL:355,DZ:213,AD:376,AO:244,AG:1268,AR:54,AM:374,AU:61,AT:43,AZ:994,BS:1242,BH:973,BD:880,BB:1246,BY:375,BE:32,BZ:501,BJ:229,BT:975,BO:591,BA:387,BW:267,BR:55,BN:673,BG:359,BF:226,BI:257,KH:855,CM:237,CA:1,CV:238,CF:236,TD:235,CL:56,CN:86,CO:57,KM:269,CG:242,CD:243,CR:506,CI:225,HR:385,CU:53,CY:357,CZ:420,DK:45,DJ:253,DM:1767,DO:1809,EC:593,EG:20,SV:503,GQ:240,ER:291,EE:372,ET:251,FJ:679,FI:358,FR:33,GA:241,GM:220,GE:995,DE:49,GH:233,GR:30,GD:1473,GT:502,GN:224,GW:245,GY:592,HT:509,HN:504,HU:36,IS:354,ID:62,IR:98,IQ:964,IE:353,IL:972,IT:39,JM:1876,JP:81,JO:962,KZ:7,KE:254,KI:686,KP:850,KR:82,KW:965,KG:996,LA:856,LV:371,LB:961,LS:266,LR:231,LY:218,LI:423,LT:370,LU:352,MK:389,MG:261,MW:265,MY:60,MV:960,ML:223,MT:356,MH:692,MR:222,MU:230,MX:52,FM:691,MD:373,MC:377,MN:976,ME:382,MA:212,MZ:258,MM:95,NA:264,NR:674,NP:977,NL:31,NZ:64,NI:505,NE:227,NG:234,NO:47,OM:968,PW:680,PA:507,PG:675,PY:595,PE:51,PH:63,PL:48,PT:351,QA:974,RO:40,RU:7,RW:250,KN:1869,LC:1758,VC:1784,WS:685,SM:378,ST:239,SA:966,SN:221,RS:381,SC:248,SL:232,SG:65,SK:421,SI:386,SB:677,SO:252,ZA:27,SS:211,ES:34,LK:94,SD:249,SR:597,SZ:268,SE:46,CH:41,SY:963,TJ:992,TZ:255,TH:66,TG:228,TO:676,TT:1868,TN:216,TR:90,TM:993,TV:688,UG:256,UA:380,UY:598,UZ:998,VU:678,VE:58,VN:84,YE:967,ZM:260,ZW:263".split(',');

const COUNTRIES = allCountriesData.map((c) => {
  const [iso, dial] = c.split(':');
  return { iso, dial: `+${dial}` };
});

export default function AffiliaterSignUp() {
  const router = useRouter();
  const supabase = createClient();

  const [avatarImage, setAvatarImage] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    countryIso: 'PK',
    phone: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // OTP Verification State (Architecture: step 1 = signup form, step 2 = verify email)
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cooldown timer for OTP resend (same pattern as forgot-password/page.js)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: 'Image size must be under 2MB' }));
        return;
      }
      setErrors((prev) => ({ ...prev, avatar: undefined }));
      const reader = new FileReader();
      reader.onload = (event) => setAvatarImage(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const avatarLetter = (form.firstName || form.email || '').trim().charAt(0).toUpperCase() || '?';

  const validate = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (form.firstName.trim().length <= 1) nextErrors.firstName = 'Name must be at least 2 characters';

    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else {
      try {
        const isValid = isValidPhoneNumber(form.phone, form.countryIso);
        if (!isValid) {
          nextErrors.phone = 'Invalid number for selected country';
        }
      } catch (error) {
        nextErrors.phone = 'Invalid phone format';
      }
    }

    if (!emailRegex.test(form.email)) nextErrors.email = 'Valid email address is required';
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match';
    if (!form.country) nextErrors.country = 'Please select your country';

    setErrors(nextErrors);
    setAuthError('');
    return Object.keys(nextErrors).length === 0;
  };

  const normalizeAuthError = (err) => {
    if (!err) return 'An unexpected error occurred during registration.';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || err.toString();
    if (typeof err === 'object') {
      const candidate = err.message || err.error_description || err.hint || err.details || err.error || err.msg;
      if (candidate && typeof candidate === 'string' && candidate.trim()) return candidate;
    }
    return 'Registration failed. Please check your details and try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !form.terms) return;

    setIsSubmitting(true);
    setAuthError('');
    setAuthSuccess('');

    let fullPhoneNumber = '';
    try {
      const parsedPhone = parsePhoneNumber(form.phone, form.countryIso);
      fullPhoneNumber = parsedPhone.format('E.164');
    } catch (err) {
      fullPhoneNumber = form.phone;
    }

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    const generatedReferralCode = `${(form.username || form.firstName).toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 🛡️ SECURITY STEP 1: Register with Status Pending
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: fullName,
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            phone: fullPhoneNumber,
            username: form.username.trim(),
            country: form.country,
            role: 'affiliate',
            status: 'pending', // 🔒 LOCKED TO PENDING FOR ADMIN REVIEW
            referral_code: generatedReferralCode,
            avatar_url: avatarImage || null,
          },
        },
      });

      if (error) throw error;

      // 🛡️ SECURITY STEP 2: Kill unapproved session immediately
      await supabase.auth.signOut();

      // Move to email verification step. Admin-review status stays pending
      // regardless; this just confirms the email address belongs to the applicant.
      setVerifiedEmail(form.email.trim());
      setStep(2);
      setCooldown(60);
    } catch (err) {
      console.error('Affiliate Signup Error:', err);
      setAuthError(normalizeAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify the 6-digit signup OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setAuthError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: verifiedEmail,
        token: cleanOtp,
        type: 'signup',
      });

      if (verifyError) throw verifyError;

      // 🛡️ Account remains 'pending' until Admin review — no session should persist.
      await supabase.auth.signOut();

      setAuthSuccess(
        '🎉 Email verified! Your affiliate application is pending Admin Review. You can log in once approved.'
      );

      // Reset form
      setForm({
        firstName: '',
        lastName: '',
        countryIso: 'PK',
        phone: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        country: '',
        terms: false,
      });
      setAvatarImage(null);
      setOtp('');
    } catch (err) {
      console.error('Affiliate OTP Verify Error:', err);
      setAuthError(normalizeAuthError(err) || 'Invalid or expired OTP code. Please check again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend the signup confirmation OTP
  const handleResendOtp = async () => {
    setAuthError('');
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verifiedEmail,
      });
      if (error) throw error;
      setCooldown(60);
    } catch (err) {
      console.error('Resend OTP Error:', err);
      setAuthError(normalizeAuthError(err) || 'Failed to resend OTP code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sanitize OTP input to numbers only (same pattern as forgot-password/page.js)
  function handleOtpChange(value) {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    if (authError) setAuthError('');
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setAuthError('');
    try {
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback`,
          queryParams: {
            role: 'affiliate',
          },
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google Signup Error:', err);
      setAuthError(normalizeAuthError(err) || 'Could not connect to Google authentication.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8 w-full">
      
      {/* Standard Compact Card (380px Max-Width) */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-[380px] border border-purple-200 my-4">
        
        {/* Affiliate Badge Header */}
        <div className="flex flex-col items-center mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-semibold mb-3 border border-purple-200">
            <Share2 className="w-3 h-3 text-purple-700" />
            Affiliate Partner Program
          </span>

          {/* Compact Avatar Upload */}
          <div className="relative">
            <div
              id="avatar-preview"
              className="w-16 h-16 rounded-full bg-purple-50 border-2 border-purple-300 flex items-center justify-center overflow-hidden text-purple-900 font-bold text-xl shadow-inner transition-all"
            >
              {avatarImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isSubmitting || isGoogleLoading}
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
          {errors.avatar && (
            <span className="text-[11px] text-red-500 mt-1 font-medium">{errors.avatar}</span>
          )}
        </div>

        <h2 className="text-xl font-bold text-center text-purple-950">
          {step === 1 ? 'Affiliate Register' : 'Verify Your Email'}
        </h2>
        <p className="text-[11px] text-center text-purple-600 mb-4">
          {step === 1
            ? 'Join our network and start earning commissions'
            : `We sent a 6-digit OTP code to ${verifiedEmail}`}
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

        {/* STEP 1: Signup Form */}
        {step === 1 && (
        <form id="signupForm" onSubmit={handleSubmit} noValidate>
          
          {/* First & Last Name Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-purple-900 mb-1">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-purple-400">
                  <User className="w-3 h-3" />
                </div>
                <input
                  type="text"
                  id="firstName"
                  placeholder="John"
                  value={form.firstName}
                  disabled={isSubmitting || isGoogleLoading}
                  onChange={(e) => {
                    setForm({ ...form, firstName: e.target.value });
                    setErrors({ ...errors, firstName: '' });
                  }}
                  className={`w-full pl-8 pr-2 py-1.5 text-xs border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                    errors.firstName ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                  }`}
                />
              </div>
              {errors.firstName && (
                <span className="text-[10px] text-red-500 pt-0.5 block font-medium">
                  {errors.firstName}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-purple-900 mb-1">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-purple-400">
                  <User className="w-3 h-3" />
                </div>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  disabled={isSubmitting || isGoogleLoading}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-purple-200 rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Phone Field with Country Code */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Phone Number</label>
            <div className="flex">
              <select
                value={form.countryIso}
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => {
                  setForm({ ...form, countryIso: e.target.value });
                  setErrors({ ...errors, phone: '' });
                }}
                className="w-24 p-1.5 border border-r-0 border-purple-200 rounded-l-lg text-purple-950 bg-purple-50/30 focus:outline-none focus:border-purple-600 disabled:bg-gray-50 cursor-pointer text-[11px] font-semibold"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.iso} value={country.iso}>
                    {country.dial} ({country.iso})
                  </option>
                ))}
              </select>

              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-purple-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  placeholder="300 1234567"
                  value={form.phone}
                  disabled={isSubmitting || isGoogleLoading}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    setErrors({ ...errors, phone: '' });
                  }}
                  className={`w-full pl-8 pr-2 py-1.5 text-xs border rounded-r-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                    errors.phone ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                  }`}
                />
              </div>
            </div>
            {errors.phone && (
              <span className="text-[10px] text-red-500 pt-0.5 block font-medium">{errors.phone}</span>
            )}
          </div>

          {/* Username Input */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">
              Username (For Referral Link)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <AtSign className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                id="username"
                placeholder="johndoe"
                value={form.username}
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs border border-purple-200 rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                id="email-input"
                placeholder="affiliate@domain.com"
                value={form.email}
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setErrors({ ...errors, email: '' });
                }}
                className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-600 transition-all disabled:bg-gray-50 ${
                  errors.email ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 pt-0.5 block font-medium">{errors.email}</span>
            )}
          </div>

          {/* Password Input */}
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
                value={form.password}
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setErrors({ ...errors, password: '' });
                }}
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

          {/* Confirm Password Input */}
          <div className="mb-3">
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
                value={form.confirmPassword}
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value });
                  setErrors({ ...errors, confirmPassword: '' });
                }}
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

          {/* Country Selection */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-purple-900 mb-1">Country</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <select
                id="country"
                value={form.country}
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => {
                  setForm({ ...form, country: e.target.value });
                  setErrors({ ...errors, country: '' });
                }}
                className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg text-purple-950 bg-white focus:outline-none focus:border-purple-600 appearance-none disabled:bg-gray-50 ${
                  errors.country ? 'border-red-400 bg-red-50/20' : 'border-purple-200'
                }`}
              >
                <option value="" disabled>
                  Select Country
                </option>
                <option value="PK">Pakistan</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="IN">India</option>
                <option value="AE">UAE</option>
              </select>
            </div>
            {errors.country && (
              <span className="text-[10px] text-red-500 pt-0.5 block font-medium">
                {errors.country}
              </span>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="terms"
              checked={form.terms}
              disabled={isSubmitting || isGoogleLoading}
              onChange={(e) => setForm({ ...form, terms: e.target.checked })}
              className="w-3.5 h-3.5 text-purple-600 border-purple-300 rounded focus:ring-purple-500 cursor-pointer disabled:opacity-50"
            />
            <label htmlFor="terms" className="ml-2 text-[11px] text-purple-900 font-medium">
              I agree to the{' '}
              <span className="underline cursor-pointer hover:text-purple-700 font-semibold">
                Terms & Partner Policy
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="registerBtn"
            disabled={isSubmitting || !form.terms || isGoogleLoading}
            className="w-full bg-purple-700 text-white py-2.5 px-4 rounded-lg hover:bg-purple-800 transition-all font-semibold shadow-sm border border-purple-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register as Affiliate</span>
              </>
            )}
          </button>
        </form>
        )}

        {/* STEP 2: Verify OTP Form — markup reused as-is from forgot-password/page.js */}
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
                  <CheckCircle2 className="w-3.5 h-3.5" />
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
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-950 hover:underline flex items-center gap-1 transition"
                >
                  <span>Resend OTP Code</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setAuthError('');
                }}
                className="text-[10px] text-purple-500 hover:text-purple-800 hover:underline transition"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
        <>
        {/* Divider */}
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
          Already have an affiliate account?{' '}
          <Link href="/signin/affiliater" className="text-purple-950 font-bold hover:underline">
            Login here
          </Link>
        </p>
        </>
        )}

      </div>
    </div>
  );
}