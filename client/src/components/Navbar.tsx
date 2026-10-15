import React from 'react';
import { Menu, AlertTriangle, Download, PlusCircle, MinusCircle, Plus } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  alertCount: number;
  onFilterAlerts: () => void;
  onReceiveStock: () => void;
  onDispatchStock: () => void;
  onNewProduct: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  alertCount,
  onFilterAlerts,
  onReceiveStock,
  onDispatchStock,
  onNewProduct,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {alertCount > 0 && (
          <button
            onClick={onFilterAlerts}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{alertCount} items need attention</span>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <a
          href="/api/export/products/csv"
          download
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Export CSV</span>
        </a>

        <button
          onClick={onReceiveStock}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Receive</span>
        </button>

        <button
          onClick={onDispatchStock}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
        >
          <MinusCircle className="w-3.5 h-3.5" />
          <span>Dispatch</span>
        </button>

        <button
          onClick={onNewProduct}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>
    </header>
  );
};
