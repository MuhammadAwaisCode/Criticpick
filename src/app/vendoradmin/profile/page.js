'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  Save, 
  Camera, 
  Loader2,
  Building2,
  Globe
} from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { createClient } from '@/lib/supabase/client';

export default function VendorProfilePage() {
  const { vendorData, updateStoreSettings, uploadAvatar, uploadIdentityDocument } = useVendor();
  const supabase = createClient();

  // Local Toast notification state to replace non-existent context toasts
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Identity document (KYC) upload state
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const documentInputRef = useRef(null);

  // Profile Form State
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    storeName: '',
    country: '',
    city: '',
    avatarUrl: '',
    joinedDate: null,
    role: 'Primary Store Owner',
    nationalId: '35202-XXXXXXX-X',
    kycStatus: 'Verified',
  });

  useEffect(() => {
    if (vendorData) {
      setProfile((prev) => ({
        ...prev,
        fullName: vendorData.contactName ?? prev.fullName,
        email: vendorData.email ?? prev.email,
        phone: vendorData.phone ?? prev.phone,
        storeName: vendorData.storeName ?? prev.storeName,
        country: vendorData.country ?? prev.country,
        city: vendorData.city ?? prev.city,
        avatarUrl: vendorData.avatarUrl ?? prev.avatarUrl,
        joinedDate: vendorData.joinedDate ?? prev.joinedDate,
      }));
    }
  }, [vendorData]);

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const initials = (profile.fullName || 'V')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const joinedDateLabel = profile.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await updateStoreSettings({
      contactName: profile.fullName,
      phone: profile.phone,
      storeName: profile.storeName,
      country: profile.country,
      city: profile.city,
    });

    setIsSaving(false);

    if (error) {
      notify('Failed to update profile. Please try again.', 'error');
    } else {
      notify('Profile updated successfully!', 'success');
    }
  };

  // Handle Avatar Upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const { url, error } = await uploadAvatar(file);
    setIsUploadingAvatar(false);
    e.target.value = '';

    if (error) {
      notify('Failed to upload photo. Please try again.', 'error');
      return;
    }

    setProfile((prev) => ({ ...prev, avatarUrl: url }));
    notify('Profile photo updated!', 'success');
  };

  // Handle Identity Document Upload
  const handleDocumentClick = () => {
    documentInputRef.current?.click();
  };

  const handleDocumentChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDocument(true);
    const { document, error } = await uploadIdentityDocument(file, 'national_id');
    setIsUploadingDocument(false);
    e.target.value = '';

    if (error) {
      notify('Failed to upload document. Please try again.', 'error');
      return;
    }

    setUploadedDocument(document);
    notify('Identity document uploaded. Pending admin review.', 'success');
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      notify('New passwords do not match!', 'error');
      return;
    }
    if (passwords.newPassword.length < 6) {
      notify('Password must be at least 6 characters long.', 'error');
      return;
    }

    setIsSaving(true);

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: passwords.currentPassword,
    });

    if (reauthError) {
      setIsSaving(false);
      notify('Current password is incorrect.', 'error');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwords.newPassword,
    });

    setIsSaving(false);

    if (error) {
      notify('Failed to update password. Please try again.', 'error');
      return;
    }

    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    notify('Password changed successfully!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 relative">
      {/* Toast Portal */}
      {toast && (
        <div className="fixed top-20 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
          <div className="bg-white shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-200 min-w-[260px] pointer-events-auto animate-fade-in">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-semibold text-slate-800">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Profile</h1>
        <p className="text-sm text-gray-500">Manage your personal details, KYC status, and security settings.</p>
      </div>

      {/* Top Banner Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center text-blue-700 text-2xl font-bold overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition-colors disabled:opacity-60"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{profile.fullName || 'Vendor'}</h2>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {profile.kycStatus}
              </span>
            </div>
            <p className="text-sm text-gray-500">{profile.role}</p>
            <p className="text-xs text-gray-400 mt-1">{profile.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center flex-1 md:flex-initial min-w-[120px]">
            <span className="text-xs text-gray-400 block">Account Level</span>
            <span className="text-sm font-semibold text-gray-800">Gold Seller</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center flex-1 md:flex-initial min-w-[120px]">
            <span className="text-xs text-gray-400 block">KYC Verification</span>
            <span className="text-sm font-semibold text-green-600">Passed</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center flex-1 md:flex-initial min-w-[120px]">
            <span className="text-xs text-gray-400 block">Member Since</span>
            <span className="text-sm font-semibold text-gray-800">{joinedDateLabel}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Info + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Personal Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Personal Information
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="email" 
                      value={profile.email}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">National Identity No. (CNIC/Passport)</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      value={profile.nationalId}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      value={profile.country}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Identity Document Upload (KYC) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Identity Document
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Upload a clear photo or scan of your CNIC or Passport for admin verification.
            </p>
            <input
              type="file"
              ref={documentInputRef}
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleDocumentChange}
              disabled={isUploadingDocument}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDocumentClick}
                disabled={isUploadingDocument}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isUploadingDocument ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {isUploadingDocument ? 'Uploading...' : 'Upload Document'}
              </button>
              {uploadedDocument && (
                <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Submitted — pending review
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Change Password */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" /> Change Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 mt-2"
              >
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}