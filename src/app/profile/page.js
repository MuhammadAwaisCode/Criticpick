'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const PROFILE_TABS = [
  { key: 'overview', label: 'Account Overview', icon: 'fa-user-cog' },
  { key: 'orders', label: 'My Orders', icon: 'fa-box' },
  { key: 'wishlist', label: 'Wishlist', icon: 'fa-heart' },
  { key: 'addresses', label: 'Addresses', icon: 'fa-map-marked-alt' },
];

const REGIONS = [
  { value: 'PK', label: 'Pakistan' },
  { value: 'AE', label: 'UAE' },
  { value: 'SA', label: 'Saudi Arabia' },
];

const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  region: 'PK',
  address: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [avatarImage, setAvatarImage] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_PROFILE);
  const [savedValues, setSavedValues] = useState(EMPTY_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ message: '', isError: false });

  const hasUnsavedChanges = JSON.stringify(formValues) !== JSON.stringify(savedValues);

  // 1. Supabase Fetch User Data
  useEffect(() => {
    async function loadUserProfile() {
      setIsLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/signin/customer');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const loadedProfile = {
        name: profile?.full_name || profile?.name || user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: profile?.phone || '',
        region: profile?.region || 'PK',
        address: profile?.address || '',
      };

      setFormValues(loadedProfile);
      setSavedValues(loadedProfile);

      if (profile?.avatar_url) {
        setAvatarImage(profile.avatar_url);
      }

      setIsLoading(false);
    }

    loadUserProfile();
  }, []);

  function handleAvatarChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarImage(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleFieldChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setSaveStatus({ message: '', isError: false });
  }

  function handleCancel() {
    setFormValues(savedValues);
    setSaveStatus({ message: '', isError: false });
  }

  // 2. Updated Save Handler (.update instead of .upsert)
  async function handleSubmit(event) {
    event.preventDefault();
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    setSaveStatus({ message: '', isError: false });

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formValues.name,
          phone: formValues.phone,
          region: formValues.region,
          address: formValues.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        setSaveStatus({
          message: 'Failed to update: ' + error.message,
          isError: true,
        });
      } else {
        setSavedValues(formValues);
        setSaveStatus({
          message: 'Profile updated successfully.',
          isError: false,
        });
      }
    }

    setIsSaving(false);
  }

  const avatarFallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    formValues.name || 'Criticpick User'
  )}&background=7e22ce&color=fff&size=200`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-purple-900 font-bold">
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* LEFT COLUMN — Avatar & Tabs */}
          <aside className="bg-white/85 backdrop-blur rounded-2xl shadow-xl overflow-hidden p-6 lg:col-span-1 text-center border border-white/40">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-full h-full rounded-full border-4 border-purple-500 shadow-lg overflow-hidden bg-white">
                <img
                  src={avatarImage || avatarFallbackUrl}
                  alt="User profile picture"
                  className="w-full h-full object-cover"
                />
              </div>
              <label
                htmlFor="profile-avatar-upload"
                className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-2.5 rounded-full shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all text-xs"
                aria-label="Change profile picture"
              >
                <i className="fas fa-camera" />
              </label>
              <input
                type="file"
                id="profile-avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <h3 className="text-xl font-bold text-purple-950 mb-0.5">
              {formValues.name || 'Criticpick User'}
            </h3>
            <p className="text-xs text-gray-500 mb-6">Member since 2026</p>

            <div className="text-left border-t border-purple-100 pt-4 space-y-1">
              {PROFILE_TABS.map((tab) => {
                const active = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full px-4 py-2.5 text-sm rounded-lg flex items-center gap-3 transition-all border-l-4 ${
                      active
                        ? 'bg-gradient-to-r from-purple-600/10 to-pink-500/5 border-purple-600 text-purple-950 font-bold'
                        : 'border-transparent text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    <i
                      className={`fas ${tab.icon} w-5 text-center ${
                        active ? 'text-purple-600' : 'text-gray-400'
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* RIGHT COLUMN — Profile Form */}
          <section className="bg-white/85 backdrop-blur rounded-2xl shadow-xl overflow-hidden lg:col-span-3 border border-white/40">
            <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400" />
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-purple-100 pb-4 mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-black text-purple-950">Profile Settings</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage your public details and default shipment settings.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Verified Profile
                </span>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="profile-name"
                      className="text-xs font-bold text-purple-900 uppercase tracking-wider block"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-purple-400">
                        <i className="fas fa-user text-xs" />
                      </span>
                      <input
                        id="profile-name"
                        type="text"
                        value={formValues.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition bg-white/60 text-sm font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Email (Read-Only) */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="profile-email"
                      className="text-xs font-bold text-purple-900 uppercase tracking-wider block"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                        <i className="fas fa-envelope text-xs" />
                      </span>
                      <input
                        id="profile-email"
                        type="email"
                        value={formValues.email}
                        readOnly
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100/80 cursor-not-allowed outline-none text-sm text-gray-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="profile-phone"
                      className="text-xs font-bold text-purple-900 uppercase tracking-wider block"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-purple-400">
                        <i className="fas fa-phone text-xs" />
                      </span>
                      <input
                        id="profile-phone"
                        type="text"
                        value={formValues.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition bg-white/60 text-sm font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Region */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="profile-region"
                      className="text-xs font-bold text-purple-900 uppercase tracking-wider block"
                    >
                      Default Region
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-purple-400">
                        <i className="fas fa-globe text-xs" />
                      </span>
                      <select
                        id="profile-region"
                        value={formValues.region}
                        onChange={(e) => handleFieldChange('region', e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition bg-white/60 text-sm font-medium text-gray-800 appearance-none"
                      >
                        {REGIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-purple-400 pointer-events-none">
                        <i className="fas fa-chevron-down text-xs" />
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label
                      htmlFor="profile-address"
                      className="text-xs font-bold text-purple-900 uppercase tracking-wider block"
                    >
                      Shipping Address
                    </label>
                    <div className="relative">
                      <span className="absolute top-3.5 left-0 flex items-start pl-3.5 text-purple-400">
                        <i className="fas fa-map-marker-alt text-xs" />
                      </span>
                      <textarea
                        id="profile-address"
                        rows={3}
                        value={formValues.address}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition bg-white/60 text-sm font-medium text-gray-800 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-100 flex flex-wrap items-center gap-4 justify-end">
                  {saveStatus.message && (
                    <span
                      className={`text-xs font-bold mr-auto flex items-center gap-1.5 ${
                        saveStatus.isError ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      <i
                        className={`fas ${
                          saveStatus.isError ? 'fa-triangle-exclamation' : 'fa-circle-check'
                        }`}
                      />
                      {saveStatus.message}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="px-6 py-2.5 rounded-xl border border-purple-300 font-bold text-purple-700 hover:bg-purple-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!hasUnsavedChanges || isSaving}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-lg shadow-purple-600/20 hover:opacity-90 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving && <i className="fas fa-circle-notch fa-spin" />}
                    {isSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}