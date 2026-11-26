'use client';

import React, { useState, useEffect } from 'react';
import { FiExternalLink, FiCheck } from 'react-icons/fi';

export default function OrdersPage() {
  const milestones = ['Order Placed', 'Shipped', 'Customs Clearance', 'Out for Delivery', 'Delivered'];
  const [timelineAnimated, setTimelineAnimated] = useState(false);

  const [orders] = useState([
    {
      id: 'ORD-7743', product: 'Rose Glow Facial Serum x2', total: 49.98,
      tracking: 'DHL-88213940PK', courier: 'DHL Express',
      courierUrl: '#', currentStep: 3, placedDate: '2026-07-10'
    },
    {
      id: 'ORD-7801', product: 'Argan Hair Oil x1', total: 18.75,
      tracking: 'FDX-77410823US', courier: 'FedEx International',
      courierUrl: '#', currentStep: 1, placedDate: '2026-07-17'
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setTimelineAnimated(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {orders.map((order) => {
        const fillPercent = ((order.currentStep - 1) / (milestones.length - 1)) * 100;
        
        return (
          <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="font-bold text-slate-900">{order.id} <span className="text-xs font-semibold text-slate-400 ml-1">&middot; Placed {order.placedDate}</span></p>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{order.product}</p>
                <p className="text-sm font-bold text-slate-900 mt-1">${order.total}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">International Waybill</p>
                <a href={order.courierUrl} className="text-sm font-black text-green-700 hover:underline inline-flex items-center gap-1 mt-0.5">
                  {order.tracking} <FiExternalLink />
                </a>
                <p className="text-xs font-medium text-slate-400 mt-0.5">via {order.courier}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pt-4 pb-2">
              <div className="absolute top-7 left-0 right-0 h-1 bg-slate-100 rounded-full z-0" />
              <div 
                className="absolute top-7 left-0 h-1 bg-green-600 rounded-full z-0 transition-all duration-1000 ease-out" 
                style={{ width: timelineAnimated ? `${fillPercent}%` : '0%' }}
              />

              <div className="overflow-x-auto -mx-5 px-5">
                <div className="flex relative z-10 min-w-max justify-between">
                  {milestones.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isDone = stepNum < order.currentStep;
                    const isCurrent = stepNum === order.currentStep;

                    return (
                      <div key={step} className="flex flex-col items-center flex-shrink-0 min-w-[80px]">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isDone ? 'bg-green-600 text-white' : isCurrent ? 'bg-white border-2 border-green-600 text-green-600 shadow-md scale-110' : 'bg-slate-100 text-slate-300'}`}>
                          {isDone ? <FiCheck strokeWidth={3} /> : stepNum}
                        </div>
                        <p className={`text-[11px] sm:text-xs font-bold text-center mt-3 max-w-[80px] leading-tight ${isCurrent ? 'text-slate-900 font-extrabold' : isDone ? 'text-slate-600' : 'text-slate-300'}`}>
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}