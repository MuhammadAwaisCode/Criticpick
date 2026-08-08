'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter 
} from 'lucide-react';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'payouts' | 'system'

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Payout Processed Successfully!',
      message: 'Your withdrawal request of $420.00 has been transferred to your PayPal account.',
      time: '2 hours ago',
      type: 'payout',
      read: false,
    },
    {
      id: '2',
      title: 'New High-Converting Sale',
      message: 'You generated a new sale from SubID: instagram_bio ($36.80 commission earned).',
      time: '5 hours ago',
      type: 'sales',
      read: false,
    },
    {
      id: '3',
      title: 'New Banner Assets Added',
      message: 'Summer Sale 2026 media kit assets are now live in your Marketing Assets tab.',
      time: '1 day ago',
      type: 'system',
      read: true,
    },
    {
      id: '4',
      title: 'Commission Rate Increase!',
      message: 'Congratulations! Your account tier has been upgraded to VIP with a 12% commission rate.',
      time: '3 days ago',
      type: 'system',
      read: true,
    },
    {
      id: '5',
      title: 'Monthly Performance Summary',
      message: 'Your detailed monthly breakdown for July is ready to view in the Reports tab.',
      time: '5 days ago',
      type: 'system',
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with your latest sales, payout status, and system announcements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto">
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

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">No notifications found</p>
            <p className="text-[11px] text-slate-400">Aapki is category me filhal koi notification nahi hai.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                item.read
                  ? 'bg-white border-slate-200/80'
                  : 'bg-purple-50/30 border-purple-200 shadow-xs'
              }`}
            >
              {/* Type Icon */}
              <div
                className={`p-2.5 rounded-xl border shrink-0 ${getBgColor(
                  item.type
                )}`}
              >
                {getIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-xs font-bold ${
                      item.read ? 'text-slate-800' : 'text-slate-900 font-extrabold'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.message}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 pt-1">
                {!item.read && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    title="Mark as read"
                    className="p-1.5 hover:bg-purple-100 text-purple-600 rounded-lg transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(item.id)}
                  title="Delete"
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}