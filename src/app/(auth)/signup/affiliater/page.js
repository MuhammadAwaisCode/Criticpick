'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

// Duniya bhar ke Country Codes ki compressed list (ISO:Dial Code)
const allCountriesData = "PK:92,US:1,GB:44,IN:91,AE:971,AF:93,AL:355,DZ:213,AD:376,AO:244,AG:1268,AR:54,AM:374,AU:61,AT:43,AZ:994,BS:1242,BH:973,BD:880,BB:1246,BY:375,BE:32,BZ:501,BJ:229,BT:975,BO:591,BA:387,BW:267,BR:55,BN:673,BG:359,BF:226,BI:257,KH:855,CM:237,CA:1,CV:238,CF:236,TD:235,CL:56,CN:86,CO:57,KM:269,CG:242,CD:243,CR:506,CI:225,HR:385,CU:53,CY:357,CZ:420,DK:45,DJ:253,DM:1767,DO:1809,EC:593,EG:20,SV:503,GQ:240,ER:291,EE:372,ET:251,FJ:679,FI:358,FR:33,GA:241,GM:220,GE:995,DE:49,GH:233,GR:30,GD:1473,GT:502,GN:224,GW:245,GY:592,HT:509,HN:504,HU:36,IS:354,ID:62,IR:98,IQ:964,IE:353,IL:972,IT:39,JM:1876,JP:81,JO:962,KZ:7,KE:254,KI:686,KP:850,KR:82,KW:965,KG:996,LA:856,LV:371,LB:961,LS:266,LR:231,LY:218,LI:423,LT:370,LU:352,MK:389,MG:261,MW:265,MY:60,MV:960,ML:223,MT:356,MH:692,MR:222,MU:230,MX:52,FM:691,MD:373,MC:377,MN:976,ME:382,MA:212,MZ:258,MM:95,NA:264,NR:674,NP:977,NL:31,NZ:64,NI:505,NE:227,NG:234,NO:47,OM:968,PW:680,PA:507,PG:675,PY:595,PE:51,PH:63,PL:48,PT:351,QA:974,RO:40,RU:7,RW:250,KN:1869,LC:1758,VC:1784,WS:685,SM:378,ST:239,SA:966,SN:221,RS:381,SC:248,SL:232,SG:65,SK:421,SI:386,SB:677,SO:252,ZA:27,SS:211,ES:34,LK:94,SD:249,SR:597,SZ:268,SE:46,CH:41,SY:963,TJ:992,TZ:255,TH:66,TG:228,TO:676,TT:1868,TN:216,TR:90,TM:993,TV:688,UG:256,UA:380,UY:598,UZ:998,VU:678,VE:58,VN:84,YE:967,ZM:260,ZW:263".split(',');

const COUNTRIES = allCountriesData.map(c => {
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
    terms: false
  });
  
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatarImage(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const avatarLetter = (form.firstName || form.email || '').trim().charAt(0).toUpperCase();

  const validate = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (form.firstName.trim().length <= 1) nextErrors.firstName = "Name too short";
    
    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else {
      try {
        const isValid = isValidPhoneNumber(form.phone, form.countryIso);
        if (!isValid) {
          nextErrors.phone = "Invalid number for selected country";
        }
      } catch (error) {
        nextErrors.phone = "Invalid phone format";
      }
    }

    if (!emailRegex.test(form.email)) nextErrors.email = "Invalid email";
    if (form.password.length < 8) nextErrors.password = "Minimum 8 chars";
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Passwords do not match";
    if (!form.country) nextErrors.country = "Country required";

    setErrors(nextErrors);
    setAuthError('');
    return Object.keys(nextErrors).length === 0;
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
    } catch(err) {
      fullPhoneNumber = form.phone;
    }

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    try {
      // 1. Supabase Auth Signup (Role set to 'affiliate')
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
            role: 'affiliate', // Profiles Table Trigger ke liye Role
            avatar_url: avatarImage || null,
          },
        },
      });

      if (error) throw error;

      // 2. Insert into 'affiliates' Table
      if (data?.user) {
        const generatedReferralCode = `${(form.username || form.firstName).toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const { error: affiliateError } = await supabase
          .from('affiliates')
          .insert({
            user_id: data.user.id,
            referral_code: generatedReferralCode,
            payment_info: { phone: fullPhoneNumber, country: form.country },
            status: 'active'
          });

        if (affiliateError) {
          console.error("Affiliate record entry error:", affiliateError);
        }
      }

      if (data?.user && !data?.session) {
        setAuthSuccess('Account created! Please check your email for the verification link.');
        setIsSubmitting(false);
      } else {
        router.push('/profile'); 
      }
    } catch (err) {
      setAuthError(typeof err === 'string' ? err : err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`,
          queryParams: {
            // Meta-data so trigger handles role correctly
            role: 'affiliate' 
          }
        },
      });
      if (error) throw error;
    } catch (err) {
      setAuthError('Could not connect to Google authentication.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-[linear-gradient(135deg,_#f1e1e6_0%,_#d1a3c7_50%,_#7a6fb0_100%)] min-h-screen flex items-center justify-center py-10 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md border-2 border-purple-300">
        
        {/* Avatar Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div id="avatar-preview" className="w-24 h-24 rounded-full bg-purple-100 border-4 border-purple-400 flex items-center justify-center overflow-hidden text-purple-900 font-bold text-xl">
              {avatarImage ? (
                <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{avatarLetter || '?'}</span>
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
              className={`absolute bottom-0 right-0 bg-purple-600 text-white w-7 h-7 rounded-full transition flex items-center justify-center text-lg ${
                isSubmitting || isGoogleLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-700'
              }`}
            >
              +
            </label>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-purple-900">Affiliater Register</h2>

        {authError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-md text-center">
            {typeof authError === 'string' ? authError : authError.message || 'Error occurred'}
          </div>
        )}
        {authSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 text-xs rounded-md text-center">
            {authSuccess}
          </div>
        )}

        <form id="signupForm" onSubmit={handleSubmit} noValidate>
          {/* First Name */}
          <div className="mb-4">
            <input 
              type="text" 
              id="firstName"
              placeholder="First Name" 
              value={form.firstName} 
              disabled={isSubmitting || isGoogleLoading}
              onChange={(e) => {
                setForm({ ...form, firstName: e.target.value });
                setErrors({ ...errors, firstName: '' });
              }}
              className={`w-full p-3 border-2 rounded-md text-purple-900 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                errors.firstName ? 'border-red-500' : 'border-purple-200'
              }`} 
            />
            {errors.firstName && (
              <span className="error-msg text-xs text-red-500 pt-1 block">{errors.firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <input 
              type="text" 
              id="lastName"
              placeholder="Last Name" 
              value={form.lastName} 
              disabled={isSubmitting || isGoogleLoading}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full p-3 border-2 border-purple-200 rounded-md text-purple-900 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100" 
            />
          </div>

          {/* Phone Field with Dynamic Country Codes */}
          <div className="mb-4">
            <div className="flex">
              <select
                value={form.countryIso}
                disabled={isSubmitting || isGoogleLoading}
                onChange={(e) => {
                  setForm({ ...form, countryIso: e.target.value });
                  setErrors({ ...errors, phone: '' });
                }}
                className="w-24 p-2 border-2 border-r-0 border-purple-200 rounded-l-md text-purple-900 bg-white focus:outline-none focus:border-purple-500 disabled:bg-gray-100 cursor-pointer text-sm font-medium"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.iso} value={country.iso}>
                    {country.dial} ({country.iso})
                  </option>
                ))}
              </select>
              
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
                className={`w-full p-3 border-2 rounded-r-md text-purple-900 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                  errors.phone ? 'border-red-500' : 'border-purple-200'
                }`} 
              />
            </div>
            {errors.phone && (
              <span className="error-msg text-xs text-red-500 pt-1 block">{errors.phone}</span>
            )}
          </div>

          {/* Username */}
          <div className="mb-4">
            <input 
              type="text" 
              id="username"
              placeholder="Username" 
              value={form.username} 
              disabled={isSubmitting || isGoogleLoading}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full p-3 border-2 border-purple-200 rounded-md text-purple-900 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100" 
            />
          </div>

          {/* Email Address */}
          <div className="mb-4">
            <input 
              type="email" 
              id="email-input"
              placeholder="Email Address" 
              value={form.email} 
              disabled={isSubmitting || isGoogleLoading}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setErrors({ ...errors, email: '' });
              }}
              className={`w-full p-3 border-2 rounded-md text-purple-900 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                errors.email ? 'border-red-500' : 'border-purple-200'
              }`} 
            />
            {errors.email && (
              <span className="error-msg text-xs text-red-500 pt-1 block">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <input 
              type="password" 
              id="password"
              placeholder="Password (Min 8 chars)" 
              value={form.password} 
              disabled={isSubmitting || isGoogleLoading}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setErrors({ ...errors, password: '' });
              }}
              className={`w-full p-3 border-2 rounded-md text-purple-900 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                errors.password ? 'border-red-500' : 'border-purple-200'
              }`} 
            />
            {errors.password && (
              <span className="error-msg text-xs text-red-500 pt-1 block">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <input 
              type="password" 
              id="confirmPassword"
              placeholder="Confirm Password" 
              value={form.confirmPassword} 
              disabled={isSubmitting || isGoogleLoading}
              onChange={(e) => {
                setForm({ ...form, confirmPassword: e.target.value });
                setErrors({ ...errors, confirmPassword: '' });
              }}
              className={`w-full p-3 border-2 rounded-md text-purple-900 focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-100 ${
                errors.confirmPassword ? 'border-red-500' : 'border-purple-200'
              }`} 
            />
            {errors.confirmPassword && (
              <span className="error-msg text-xs text-red-500 pt-1 block">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Country Selection */}
          <div className="mb-4">
            <select 
              id="country"
              value={form.country} 
              disabled={isSubmitting || isGoogleLoading}
              onChange={(e) => {
                setForm({ ...form, country: e.target.value });
                setErrors({ ...errors, country: '' });
              }}
              className={`w-full p-3 border-2 rounded-md text-purple-900 bg-white focus:outline-none focus:border-purple-500 appearance-none disabled:bg-gray-100 ${
                errors.country ? 'border-red-500' : 'border-purple-200'
              }`}
            >
              <option value="" disabled>Select Country</option>
              <option value="PK">Pakistan</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="IN">India</option>
              <option value="AE">UAE</option>
            </select>
            {errors.country && (
              <span className="error-msg text-xs text-red-500 pt-1 block">{errors.country}</span>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-center mb-6">
            <input 
              type="checkbox" 
              id="terms" 
              checked={form.terms} 
              disabled={isSubmitting || isGoogleLoading}
              onChange={(e) => setForm({ ...form, terms: e.target.checked })} 
              className="w-4 h-4 text-purple-600 border-purple-300 rounded cursor-pointer disabled:opacity-50" 
            />
            <label htmlFor="terms" className="ml-2 text-sm text-purple-800">I agree to the Terms</label>
          </div>

          <button 
            type="submit" 
            id="registerBtn"
            disabled={isSubmitting || !form.terms || isGoogleLoading}
            className="w-full bg-purple-700 text-white p-3 rounded-md font-semibold transition opacity-50 cursor-not-allowed enabled:opacity-100 enabled:cursor-pointer enabled:hover:bg-purple-800"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
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
          onClick={handleGoogleSignUp}
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
              Sign up with Google
            </>
          )}
        </button>

        <p className="mt-6 text-center text-sm text-purple-800">
          Already have an affiliater account?{' '}
          <Link href="/signin/affiliater" className="text-purple-900 font-bold hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}