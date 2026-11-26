'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FiPlus, FiStar, FiTrash2, FiMapPin, FiGlobe } from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [addresses, setAddresses] = useState([]);
  const [currency, setCurrency] = useState('USD');

  const fetchProfileData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/signin/customer');
      return;
    }

    const [addressesRes, profileRes] = await Promise.all([
      supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false }),
      supabase
        .from('profiles')
        .select('display_currency')
        .eq('id', user.id)
        .single(),
    ]);

    if (addressesRes.data) {
      setAddresses(addressesRes.data.map((a) => ({
        id: a.id,
        name: a.name,
        countryLabel: a.country_label,
        street: a.street,
        city: a.city,
        state: a.state,
        postal: a.postal,
        phone: a.phone,
        isDefault: a.is_default,
      })));
    }

    setCurrency(profileRes.data?.display_currency || 'USD');
  }, [supabase, router]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleCurrencyChange = async (value) => {
    setCurrency(value);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ display_currency: value }).eq('id', user.id);
  };

  const handleSetDefault = async (id) => {
    setAddresses((prev) => prev.map(addr => ({ ...addr, isDefault: addr.id === id })));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
  };

  const handleDelete = async (id) => {
    setAddresses((prev) => prev.filter(addr => addr.id !== id));
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) fetchProfileData();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Settings Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <FiGlobe className="text-xl text-green-600" />
          <h2 className="text-lg font-bold text-slate-900">Regional Settings</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Display Currency</label>
            <select 
              value={currency} 
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
            >
              <option value="USD">🇺🇸 USD - US Dollar</option>
              <option value="PKR">🇵🇰 PKR - Pakistani Rupee</option>
              <option value="EUR">🇪🇺 EUR - Euro</option>
              <option value="GBP">🇬🇧 GBP - British Pound</option>
            </select>
          </div>
        </div>
      </section>

      {/* Address Book Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <FiMapPin className="text-xl text-green-600" />
             <h2 className="text-lg font-bold text-slate-900">Address Ledger</h2>
          </div>
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
            <FiPlus size={16} /> Add Address
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${a.isDefault ? 'border-green-300 bg-green-50/20' : 'border-slate-200'}`}>
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <p className="font-bold text-slate-900">{a.name}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{a.countryLabel}</p>
                  </div>
                  {a.isDefault && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-md flex items-center gap-1">
                      <FiStar /> Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {a.street}<br />
                  {a.city}{a.state ? `, ${a.state}` : ''} {a.postal}<br />
                  <span className="text-slate-400 text-xs font-semibold block mt-2">📞 {a.phone}</span>
                </p>
              </div>

              <div className="flex gap-4 mt-5 pt-4 border-t border-slate-100 text-sm font-bold">
                {!a.isDefault && (
                  <button onClick={() => handleSetDefault(a.id)} className="text-green-600 hover:text-green-700 transition-colors">
                    Set Default
                  </button>
                )}
                <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-600 ml-auto transition-colors flex items-center gap-1">
                  <FiTrash2 /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}