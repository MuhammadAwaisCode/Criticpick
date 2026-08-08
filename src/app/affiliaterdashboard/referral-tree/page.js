'use client';

import React, { useState } from 'react';
import { 
  Network, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  User, 
  Layers, 
  TrendingUp, 
  Award, 
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function ReferralTreePage() {
  // Tree expansion states
  const [expandedNodes, setExpandedNodes] = useState({
    'node-root': true,
    'node-sarah': true,
  });

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Mock Multi-Tier Network Tree Data
  const networkTree = {
    id: 'node-root',
    name: 'You (John Doe)',
    role: 'Master Partner',
    tier: 'Root',
    totalNetwork: 12,
    salesVolume: '$8,450.00',
    avatar: 'YOU',
    children: [
      {
        id: 'node-sarah',
        name: 'Sarah Ahmed',
        role: 'Tier 1 Partner',
        joined: 'Jul 24, 2026',
        commissionRate: '1% Override',
        directSales: '$1,250.00',
        avatar: 'SA',
        children: [
          {
            id: 'node-hamza',
            name: 'Hamza Tariq',
            role: 'Tier 2 Partner',
            joined: 'Jul 28, 2026',
            commissionRate: '0.5% Override',
            directSales: '$620.00',
            avatar: 'HT',
            children: []
          },
          {
            id: 'node-zoya',
            name: 'Zoya Hassaan',
            role: 'Tier 2 Partner',
            joined: 'Jul 29, 2026',
            commissionRate: '0.5% Override',
            directSales: '$400.00',
            avatar: 'ZH',
            children: []
          }
        ]
      },
      {
        id: 'node-ali',
        name: 'Ali Raza',
        role: 'Tier 1 Partner',
        joined: 'Jul 20, 2026',
        commissionRate: '1% Override',
        directSales: '$3,400.00',
        avatar: 'AR',
        children: [
          {
            id: 'node-bilal',
            name: 'Bilal Chaudhry',
            role: 'Tier 2 Partner',
            joined: 'Jul 22, 2026',
            commissionRate: '0.5% Override',
            directSales: '$1,100.00',
            avatar: 'BC',
            children: []
          }
        ]
      },
      {
        id: 'node-fatima',
        name: 'Fatima Khan',
        role: 'Tier 1 Partner',
        joined: 'May 28, 2026',
        commissionRate: '1% Override',
        directSales: '$890.00',
        avatar: 'FK',
        children: []
      }
    ]
  };

  // Recursive Tree Render Component
  const RenderTreeNode = ({ node, level = 0 }) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="space-y-2">
        {/* Node Card */}
        <div 
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
            level === 0 
              ? 'bg-purple-900 text-white border-purple-800 shadow-md' 
              : level === 1
              ? 'bg-white text-slate-900 border-slate-200/80 hover:border-purple-300 shadow-xs ml-4 sm:ml-6'
              : 'bg-slate-50 text-slate-900 border-slate-200/60 hover:border-slate-300 ml-8 sm:ml-12'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Expand / Collapse Toggle Button */}
            {hasChildren ? (
              <button 
                onClick={() => toggleNode(node.id)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  level === 0 ? 'hover:bg-purple-800 text-purple-200' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <span className={`w-1.5 h-1.5 rounded-full ${level === 0 ? 'bg-purple-400' : 'bg-slate-300'}`} />
              </div>
            )}

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 border ${
              level === 0 
                ? 'bg-purple-600 text-white border-purple-400' 
                : 'bg-purple-100 text-purple-700 border-purple-200'
            }`}>
              {node.avatar}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-xs">{node.name}</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  level === 0 
                    ? 'bg-purple-800 text-purple-200 border-purple-700' 
                    : level === 1
                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                    : 'bg-slate-200/70 text-slate-600 border-slate-300'
                }`}>
                  {node.role}
                </span>
              </div>
              {node.joined && (
                <p className={`text-[10px] mt-0.5 ${level === 0 ? 'text-purple-300' : 'text-slate-400'}`}>
                  Joined: {node.joined}
                </p>
              )}
            </div>
          </div>

          {/* Right Metrics */}
          <div className="flex items-center gap-4 text-right">
            {node.commissionRate && (
              <div className="hidden sm:block">
                <p className={`text-[10px] uppercase font-bold ${level === 0 ? 'text-purple-300' : 'text-slate-400'}`}>Rate</p>
                <p className={`text-xs font-bold ${level === 0 ? 'text-purple-200' : 'text-purple-600'}`}>{node.commissionRate}</p>
              </div>
            )}
            <div>
              <p className={`text-[10px] uppercase font-bold ${level === 0 ? 'text-purple-300' : 'text-slate-400'}`}>Sales Volume</p>
              <p className={`text-xs font-black ${level === 0 ? 'text-emerald-300' : 'text-emerald-600'}`}>
                {node.salesVolume || node.directSales}
              </p>
            </div>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="space-y-2 relative before:absolute before:left-7 before:top-0 before:bottom-4 before:w-px before:bg-slate-200">
            {node.children.map(child => (
              <RenderTreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Referral Tree & Multi-Tier Network</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore your multi-level affiliate network topology and track multi-tier commission contributions.
        </p>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Network Size</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">12 Affiliates</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Network className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tier-1 Directs</p>
            <p className="text-2xl font-black text-purple-600 mt-0.5">3 Partners</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tier-2 Sub-Partners</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">9 Partners</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* TREE SECTION CONTAINER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Interactive Visual Tree</h2>
              <p className="text-[11px] text-slate-500">Click arrow buttons to expand sub-networks</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-900" /> Root (You)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-600" /> Tier 1 (1%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Tier 2 (0.5%)
            </span>
          </div>
        </div>

        {/* Tree Rendering */}
        <div className="pt-2">
          <RenderTreeNode node={networkTree} />
        </div>

      </div>

    </div>
  );
}