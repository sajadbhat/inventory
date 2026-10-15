import React, { useState } from 'react';
import { FileSpreadsheet, Search, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import type { Movement } from '../types/inventory';

interface MovementsViewProps {
  movements: Movement[];
  summary: {
    total_records: number;
    total_in_units: number;
    total_out_units: number;
  };
  loading?: boolean;
  onFilterChange: (type: string, search: string) => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  summary,
  onFilterChange,
}) => {
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');

  const handleTypeChange = (newType: string) => {
    setType(newType);
    onFilterChange(newType, search);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    onFilterChange(type, newSearch);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock Movements Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit trail of every stock inflow, outflow, and manual inventory adjustment
          </p>
        </div>
        <a
          href="/api/export/movements/csv"
          download
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Ledger CSV</span>
        </a>
      </div>

      {/* Mini Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium uppercase">Total Transactions</span>
          <div className="text-xl font-black text-slate-900 mt-1">{(summary.total_records || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-emerald-600 font-medium uppercase">Units Received (In)</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            +{(summary.total_in_units || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-rose-600 font-medium uppercase">Units Dispatched (Out)</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            -{(summary.total_out_units || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by SKU, product, reason, reference #..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="w-full sm:w-56">
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Movement Types</option>
            <option value="IN">IN (Deliveries & Returns)</option>
            <option value="OUT">OUT (Sales & Dispatches)</option>
            <option value="ADJUST">ADJUST (Audits & Recounts)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4 text-center">Qty Delta</th>
                <th className="py-3 px-4 text-center">Balance Transition</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">
                    No movements found matching the filters.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isIn = m.type === 'IN';
                  const isOut = m.type === 'OUT';
                  const badgeClass = isIn
                    ? 'bg-emerald-100 text-emerald-800'
                    : isOut
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800';
                  const icon = isIn ? (
                    <ArrowDownLeft className="w-3 h-3" />
                  ) : isOut ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  );

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(m.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold ${badgeClass}`}>
                          {icon}
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 text-sm">{m.product_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{m.product_sku}</div>
                      </td>
                      <td
                        className={`py-3 px-4 text-center font-bold text-sm ${
                          isIn ? 'text-emerald-600' : isOut ? 'text-rose-600' : 'text-blue-600'
                        }`}
                      >
                        {isIn ? '+' : isOut ? '-' : '±'}
                        {m.quantity} {m.product_unit}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        {m.previous_quantity} &rarr; <span className="font-bold text-slate-900">{m.new_quantity}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{m.reason}</div>
                        {m.reference_no && (
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {m.reference_no}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{m.performed_by || 'Admin'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
