'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const VendorContext = createContext(undefined);

export function VendorProvider({ children }) {
  const supabase = createClient();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadVendor = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setVendorData(null);
      setLoading(false);
      return;
    }

    const { data: vendor } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (vendor) {
      setVendorData({
        id: vendor.id,
        userId: vendor.user_id,
        contactName: vendor.contact_name,
        email: vendor.email,
        phone: vendor.phone,
        storeName: vendor.store_name,
        country: vendor.country,
        city: vendor.city,
        avatarUrl: vendor.avatar_url,
        joinedDate: vendor.created_at,
        accountStatus: vendor.account_status,
      });
    } else {
      setVendorData(null);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  // Update editable store/contact fields on the vendor record.
  const updateStoreSettings = async (updates) => {
    if (!vendorData?.id) {
      return { error: new Error('No vendor record found.') };
    }

    const { error } = await supabase
      .from('vendors')
      .update({
        contact_name: updates.contactName,
        phone: updates.phone,
        store_name: updates.storeName,
        country: updates.country,
        city: updates.city,
      })
      .eq('id', vendorData.id);

    if (!error) {
      setVendorData((prev) => ({ ...prev, ...updates }));
    }

    return { error };
  };

  // Upload a new avatar/logo image and persist its public URL on the vendor record.
  const uploadAvatar = async (file) => {
    if (!vendorData?.id) {
      return { error: new Error('No vendor record found.') };
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${vendorData.userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('vendor-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return { error: uploadError };
    }

    const { data: publicUrlData } = supabase.storage.from('vendor-assets').getPublicUrl(filePath);
    const url = publicUrlData?.publicUrl;

    const { error: updateError } = await supabase
      .from('vendors')
      .update({ avatar_url: url })
      .eq('id', vendorData.id);

    if (updateError) {
      return { error: updateError };
    }

    setVendorData((prev) => ({ ...prev, avatarUrl: url }));
    return { url };
  };

  // Upload an identity document (e.g. CNIC/passport) to storage and record its
  // metadata in vendor_documents so admins can review it as part of KYC.
  const uploadIdentityDocument = async (file, documentType = 'national_id') => {
    if (!vendorData?.id) {
      return { error: new Error('No vendor record found.') };
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${vendorData.userId}/${documentType}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('vendor-documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return { error: uploadError };
    }

    const { data: publicUrlData } = supabase.storage
      .from('vendor-documents')
      .getPublicUrl(filePath);
    const documentUrl = publicUrlData?.publicUrl;

    const { data: docRecord, error: insertError } = await supabase
      .from('vendor_documents')
      .insert({
        vendor_id: vendorData.id,
        document_type: documentType,
        document_url: documentUrl,
        file_name: file.name,
        status: 'pending_review',
      })
      .select()
      .maybeSingle();

    if (insertError) {
      return { error: insertError };
    }

    return { document: docRecord };
  };

  const value = {
    vendorData,
    loading,
    refreshVendor: loadVendor,
    updateStoreSettings,
    uploadAvatar,
    uploadIdentityDocument,
  };

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
}

export function useVendor() {
  const ctx = useContext(VendorContext);
  if (ctx === undefined) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return ctx;
}
