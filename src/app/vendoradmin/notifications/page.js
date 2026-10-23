'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, Package, AlertTriangle, CheckCircle, Trash2, 
  Check, Filter, Loader2, Sparkles, X 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// Type mapping for Icons and Styling
const TYPE_CONFIG = {
  alert: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200' },
  order: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
  payout: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
  system: { icon: Bell, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Unread' | 'order' | 'alert'

  // 1. Fetch Initial Notifications & Listen for Realtime Events
  useEffect(() => {
    fetchNotifications();

    // Live Webhook / Supabase Realtime Listener setup
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((item) => item.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notifications:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Mark Single Notification as Read
  const handleMarkAsRead = async (id, currentUnreadState) => {
    if (!currentUnreadState) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ unread: false })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to mark read:', err.message);
      fetchNotifications();
    }
  };

  // 3. Mark All as Read (Bulk Action)
  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => n.unread).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ unread: false })
        .in('id', unreadIds);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to mark all as read:', err.message);
      fetchNotifications();
    }
  };

  // 4. Delete Single Notification
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Stop trigger of mark as read

    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Delete notification failed:', err.message);
      fetchNotifications();
    }
  };

  // Filtered Notifications Compute
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'Unread') return n.unread;
    if (activeTab === 'order') return n.type === 'order';
    if (activeTab === 'alert') return n.type === 'alert';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Real-time updates on orders, low stock warnings, and store payouts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5 text-blue-600" /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto text-xs font-bold">
        {['All', 'Unread', 'order', 'alert'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg transition-all capitalize cursor-pointer whitespace-nowrap ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab === 'order' ? 'Orders' : tab === 'alert' ? 'Stock Alerts' : tab}
          </button>
        ))}
      </div>

      {/* Notifications List Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-semibold">Connecting to Live Activity Channel...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Sparkles className="w-8 h-8 stroke-1 text-slate-300" />
            <span className="text-xs font-semibold">No notifications match your selection.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
              const IconComponent = config.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id, notif.unread)}
                  className={`p-4 sm:p-5 flex gap-4 transition-all cursor-pointer group relative ${
                    notif.unread ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${config.bg}`}
                  >
                    <IconComponent className={`w-5 h-5 ${config.color}`} />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        className={`text-xs sm:text-sm ${
                          notif.unread ? 'font-black text-slate-900' : 'font-bold text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap ml-4">
                        {new Date(notif.created_at || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {notif.desc_text || notif.desc}
                    </p>
                  </div>

                  {/* Actions & Unread Indicator */}
                  <div className="flex items-center gap-2">
                    {notif.unread && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, notif.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}