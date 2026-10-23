'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { 
  Bell, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Check, 
  CheckCheck, 
  Trash2,
  Loader2
} from 'lucide-react';

import { 
  fetchNotifications, 
  markNotificationReadAction, 
  markAllNotificationsReadAction, 
  deleteNotificationAction, 
  clearAllNotificationsAction 
} from '@/actions/notificationActions';

export default function NotificationsPage({ userId = 'CURRENT_USER_ID' }) {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  // Load notifications on mount
  const loadNotificationsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotifications(userId);
      if (res.success) {
        setNotifications(res.data || []);
      } else {
        setError(res.error || 'Failed to sync notifications.');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotificationsData();
  }, [loadNotificationsData]);

  // Handlers with Optimistic Updates & Server Sync
  const markAllAsRead = () => {
    startTransition(async () => {
      const originalState = [...notifications];
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      const res = await markAllNotificationsReadAction(userId);
      if (!res.success) {
        setNotifications(originalState);
        setError('Failed to update notifications on server.');
      }
    });
  };

  const markAsRead = (id) => {
    startTransition(async () => {
      const originalState = [...notifications];
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      const res = await markNotificationReadAction(id, userId);
      if (!res.success) {
        setNotifications(originalState);
        setError('Failed to mark notification as read.');
      }
    });
  };

  const deleteNotification = (id) => {
    startTransition(async () => {
      const originalState = [...notifications];
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      const res = await deleteNotificationAction(id, userId);
      if (!res.success) {
        setNotifications(originalState);
        setError('Failed to delete notification.');
      }
    });
  };

  const clearAll = () => {
    startTransition(async () => {
      const originalState = [...notifications];
      setNotifications([]);

      const res = await clearAllNotificationsAction(userId);
      if (!res.success) {
        setNotifications(originalState);
        setError('Failed to clear notifications.');
      }
    });
  };

  // Filter Logic
  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    if (filter === 'payouts') return item.type === 'payout';
    if (filter === 'system') return item.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'payout':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'sales':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'payout':
        return 'bg-emerald-50 border-emerald-100';
      case 'sales':
        return 'bg-purple-50 border-purple-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6 sm:px-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-purple-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with your latest sales, payout status, and system announcements.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={isPending || loading}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              disabled={isPending || loading}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          All ({notifications.length})
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            filter === 'unread'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Unread ({unreadCount})
        </button>

        <button
          onClick={() => setFilter('payouts')}
          className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            filter === 'payouts'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Payouts
        </button>

        <button
          onClick={() => setFilter('system')}
          className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            filter === 'system'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          System Updates
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      {loading ? (
        <div className="min-h-[250px] bg-white border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching notifications...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No notifications found</p>
              <p className="text-[11px] text-slate-400">
                There are no notifications matching your current filter.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  item.read
                    ? 'bg-white border-slate-200/80'
                    : 'bg-purple-50/40 border-purple-200/80 shadow-xs'
                }`}
              >
                {/* TYPE ICON */}
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${getBgColor(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                </div>

                {/* CONTENT */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-xs ${
                        item.read ? 'font-bold text-slate-800' : 'font-extrabold text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.message}</p>
                </div>

                {/* ITEM ACTIONS */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      disabled={isPending}
                      title="Mark as read"
                      className="p-1.5 hover:bg-purple-100 text-purple-600 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    disabled={isPending}
                    title="Delete"
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}