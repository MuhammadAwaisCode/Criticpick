'use client';

import { useState } from 'react';
import { Eye, Printer } from 'lucide-react';
import { useVendorData, statusFlow, statusColor, fmt, titles } from '../context/VendorDataContext';

export default function OrderPipelinePage() {
  const { orders, handleUpdateOrderStatus } = useVendorData();
  const [activeSlipOrder, setActiveSlipOrder] = useState(null);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-lg font-black tracking-tight text-slate-900 mb-6">{titles.orders}</h1>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                <th className="py-3.5 px-5">Waybill ID</th>
                <th className="py-3.5 px-5">Consignee Address</th>
                <th className="py-3.5 px-5">Region Destination</th>
                <th className="py-3.5 px-5">Items Matrix Manifest</th>
                <th className="py-3.5 px-5">Gross Bill</th>
                <th className="py-3.5 px-5">Pipeline Tracker State</th>
                <th className="py-3.5 px-5 text-right">Slips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/40">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{o.id}</td>
                  <td className="py-3.5 px-5 text-slate-800">{o.customer}</td>
                  <td className="py-3.5 px-5 text-slate-400 font-semibold">{o.country}</td>
                  <td className="py-3.5 px-5 max-w-[200px] truncate" title={o.items}>{o.items}</td>
                  <td className="py-3.5 px-5 font-bold text-slate-900">{fmt(o.total)}</td>
                  <td className="py-3.5 px-5">
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      className={`font-bold text-[11px] rounded-lg border-0 outline-none px-2 py-1.5 cursor-pointer bg-slate-50 ${statusColor[o.status]}`}
                    >
                      {statusFlow.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => setActiveSlipOrder(o)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspection
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERLAY DRILLDOWN MODAL VIEW CONTROL SLIPS PORTAL */}
      {activeSlipOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-5 sm:p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Customs Clearance & Waybill Slip</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Reference: <span className="font-mono text-slate-700">{activeSlipOrder.id}</span></p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[activeSlipOrder.status]}`}>{activeSlipOrder.status}</span>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Consignee Record:</span>
                <span className="text-slate-900">{activeSlipOrder.customer}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Destination Territory:</span>
                <span className="text-slate-900">{activeSlipOrder.country}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Manifest Declaration:</span>
                <span className="text-slate-900 bg-slate-50 p-2 rounded-lg font-mono text-[11px] mt-1 text-left">{activeSlipOrder.items}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-bold">Total Customs Assessment Value:</span>
                <span className="text-sm font-black text-slate-900">{fmt(activeSlipOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-bold">
              <button
                type="button" onClick={() => setActiveSlipOrder(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Dismiss Modal
              </button>
              <button
                type="button" onClick={() => typeof window !== 'undefined' && window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}