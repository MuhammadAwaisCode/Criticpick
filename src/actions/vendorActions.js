'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Server Action: Submit Vendor Tax Verification (NTN, Business Reg, Tax Doc URL)
 */
export async function submitVendorTaxVerification({ ntnNumber, businessRegNumber, taxDocUrl }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update vendor_settings
    const { error: vsError } = await supabase
      .from('vendor_settings')
      .upsert(
        {
          user_id: user.id,
          ntn_number: ntnNumber,
          business_reg_number: businessRegNumber,
          tax_doc_url: taxDocUrl,
          verification_status: 'pending',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (vsError) {
      console.error('Error updating vendor_settings:', vsError);
    }

    // Update profiles
    const { error: profError } = await supabase
      .from('profiles')
      .update({
        ntn_number: ntnNumber,
        business_reg_number: businessRegNumber,
        tax_doc_url: taxDocUrl,
        verification_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profError) {
      console.error('Error updating profiles:', profError);
    }

    return { success: true };
  } catch (err) {
    console.error('submitVendorTaxVerification Exception:', err);
    return { success: false, error: err.message || 'Verification submission failed' };
  }
}
