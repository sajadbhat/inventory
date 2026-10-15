import React from 'react';
import { Boxes, LayoutDashboard, Package, History, Tags, Truck, RotateCcw } from 'lucide-react';
import type { ViewTab } from '../types/inventory';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onResetDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
  onResetDemo,
}) => {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Inventory Items', icon: <Package className="w-4 h-4" /> },
    { id: 'movements', label: 'Stock Movements', icon: <History className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <Tags className="w-4 h-4" /> },
    { id: 'suppliers', label: 'Suppliers', icon: <Truck className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-300 z-40 fixed inset-y-0 left-0 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-base">StockFlow</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">React + TS Edition</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'text-indigo-600 bg-indigo-50 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & demo reset */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SQLite Engine Active</span>
            </div>
            <p className="text-[11px] text-slate-400">Node.js 24 + Express Backend</p>
          </div>

          <button
            onClick={onResetDemo}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
