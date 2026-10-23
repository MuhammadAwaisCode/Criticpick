'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FiExternalLink, FiCheck } from 'react-icons/fi';

const formatDate = (iso) => (iso ? new Date(iso).toISOString().split('T')[0] : '');

export default function OrdersPage() {
  const milestones = ['Order Placed', 'Shipped', 'Customs Clearance', 'Out for Delivery', 'Delivered'];
  const [timelineAnimated, setTimelineAnimated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/signin/customer');
      return;
    }

    const { data } = await supabase
      .from('orders')
      .select('id, order_number, total, tracking_number, courier_name, courier_url, current_step, placed_at, order_items(product_name, quantity)')
      .eq('user_id', user.id)
      .order('placed_at', { ascending: false });

    if (data) {
      setOrders(data.map((o) => ({
        id: o.order_number,
        product: (o.order_items || [])
          .map((it) => `${it.product_name}${it.quantity > 1 ? ` x${it.quantity}` : ''}`)
          .join(', '),
        total: o.total,
        tracking: o.tracking_number,
        courier: o.courier_name,
        courierUrl: o.courier_url || '#',
        currentStep: o.current_step,
        placedDate: formatDate(o.placed_at),
      })));
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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