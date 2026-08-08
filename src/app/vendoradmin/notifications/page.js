'use client';

import React from 'react';
import { Bell, Package, AlertTriangle, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: 'alert', title: 'Low Stock Warning', desc: 'Hydrating Botanical Body Balm is running critically low (0 units left).', time: '2 hours ago', unread: true, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 2, type: 'order', title: 'New Order Received', desc: 'Order ORD-8846 has been placed by Sarah J. Please prepare for fulfillment.', time: '4 hours ago', unread: true, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 3, type: 'system', title: 'Payout Successful', desc: 'Your withdrawal of $450.00 has been successfully processed to your bank account.', time: 'Yesterday', unread: false, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 4, type: 'system', title: 'Platform Update', desc: 'We have updated our vendor policies regarding cross-border shipping rates.', time: '2 days ago', unread: false, icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">Stay updated with your store activity.</p>
        </div>
        <button className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div key={notif.id} className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 ${notif.unread ? 'bg-blue-50/30' : 'bg-white'}`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${notif.bg}`}>
                <notif.icon className={`w-5 h-5 ${notif.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm ${notif.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-4">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{notif.desc}</p>
              </div>
              {notif.unread && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}