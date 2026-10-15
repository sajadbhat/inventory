import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import {
  Package,
  DollarSign,
  Wallet,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Bell,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import type { DashboardData } from '../types/inventory';

Chart.register(...registerables);

interface DashboardViewProps {
  data: DashboardData | null;
  loading: boolean;
  theme: 'light' | 'dark';
  onRefresh: () => void;
  onFilterLowStock: () => void;
  onQuickRestock: (productId: number) => void;
  onViewAllMovements: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  loading,
  theme,
  onRefresh,
  onFilterLowStock,
  onQuickRestock,
  onViewAllMovements,
}) => {
  const categoryCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const movementCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const categoryChartRef = useRef<Chart | null>(null);
  const movementChartRef = useRef<Chart | null>(null);
  const chartTextColor = theme === 'dark' ? '#a8b4c8' : '#64748b';
  const chartGridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const chartSurfaceColor = theme === 'dark' ? '#172033' : '#ffffff';

  // Render Category Doughnut Chart
  useEffect(() => {
    if (!categoryCanvasRef.current || !data?.categoryBreakdown) return;

    if (categoryChartRef.current) {
      categoryChartRef.current.destroy();
    }

    const labels = data.categoryBreakdown.map((c) => c.category_name);
    const values = data.categoryBreakdown.map((c) => c.total_value);
    const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

    categoryChartRef.current = new Chart(categoryCanvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: chartSurfaceColor,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 12,
              color: chartTextColor,
              font: { family: "'Inter', sans-serif", size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const val = (context.raw as number) || 0;
                return ` ${label}: $${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
              },
            },
          },
        },
        cutout: '68%',
      },
    });

    return () => {
      if (categoryChartRef.current) categoryChartRef.current.destroy();
    };
  }, [data, chartSurfaceColor, chartTextColor]);

  // Render Movement Trends Bar Chart
  useEffect(() => {
    if (!movementCanvasRef.current || !data?.movementTrends) return;

    if (movementChartRef.current) {
      movementChartRef.current.destroy();
    }

    let labels: string[] = [];
    let inData: number[] = [];
    let outData: number[] = [];

    if (data.movementTrends.length > 0) {
      labels = data.movementTrends.map((d) => {
        const parts = d.move_date.split('-');
        return `${parts[1]}/${parts[2]}`;
      });
      inData = data.movementTrends.map((d) => d.total_in);
      outData = data.movementTrends.map((d) => d.total_out);
    } else {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      inData = [0, 0, 0, 0, 0, 0, 0];
      outData = [0, 0, 0, 0, 0, 0, 0];
    }

    movementChartRef.current = new Chart(movementCanvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Stock In (Received)',
            data: inData,
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderColor: '#10b981',
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Stock Out (Dispatched)',
            data: outData,
            backgroundColor: 'rgba(239, 68, 68, 0.85)',
            borderColor: '#ef4444',
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: chartTextColor, font: { family: "'Inter', sans-serif", size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: chartGridColor },
            ticks: { color: chartTextColor, precision: 0, font: { family: "'Inter', sans-serif", size: 11 } },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              color: chartTextColor,
              font: { family: "'Inter', sans-serif", size: 11 },
            },
          },
        },
      },
    });

    return () => {
      if (movementChartRef.current) movementChartRef.current.destroy();
    };
  }, [data, chartGridColor, chartTextColor]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-80 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="ml-3 text-sm font-medium">Loading Dashboard Analytics...</span>
      </div>
    );
  }

  if (!data) return null;

  const { summary, lowStockAlerts, recentMovements } = data;

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inventory Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time stock valuation, inventory health, and audit telemetry</p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Catalog Items</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.totalProducts.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-bold text-slate-700">{summary.totalUnits.toLocaleString()}</span> units in stock
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Retail Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Retail Value</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ${summary.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              Est. Margin: ${summary.projectedProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Inventory Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Inventory Cost</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ${summary.totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Acquisition valuation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Attention Needed */}
        <div
          onClick={onFilterLowStock}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-all"
        >
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Attention Needed</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-amber-600">{summary.lowStockCount}</h3>
              <span className="text-xs font-bold text-rose-600">({summary.outOfStockCount} out)</span>
            </div>
            <p className="text-xs text-amber-600 font-medium mt-1">Low / Zero stock items</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Doughnut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">Inventory by Category</h4>
            <span className="text-xs text-slate-400">By Retail Value</span>
          </div>
          <div className="h-60 relative flex items-center justify-center">
            <canvas ref={categoryCanvasRef}></canvas>
          </div>
        </div>

        {/* 14-day Movements Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Stock Movements History</h4>
              <p className="text-xs text-slate-400">Incoming deliveries vs Outgoing dispatches</p>
            </div>
          </div>
          <div className="h-60 relative">
            <canvas ref={movementCanvasRef}></canvas>
          </div>
        </div>
      </div>

      {/* Bottom Split: Low Stock Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-900">Low Stock Priority Alerts</h4>
            </div>
            <button
              onClick={onFilterLowStock}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View All &rarr;
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Product / SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-center">Stock Level</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                      All inventory levels are healthy! No stock alerts.
                    </td>
                  </tr>
                ) : (
                  lowStockAlerts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{item.sku}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600">{item.category_name || 'General'}</td>
                      <td className="py-3 px-3 text-xs text-slate-500">{item.location || 'Warehouse'}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            item.quantity === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.quantity} / {item.min_threshold} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onQuickRestock(item.id)}
                          className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-all cursor-pointer"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Movements Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-bold text-slate-900">Recent Movements</h4>
            </div>
            <button
              onClick={onViewAllMovements}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Full Ledger &rarr;
            </button>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto max-h-[340px]">
            {recentMovements.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No movements recorded yet.</div>
            ) : (
              recentMovements.map((m) => {
                const isIn = m.type === 'IN';
                const isOut = m.type === 'OUT';
                const badgeClass = isIn
                  ? 'bg-emerald-100 text-emerald-800'
                  : isOut
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-blue-100 text-blue-800';
                const icon = isIn ? (
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                ) : isOut ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                );

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg border border-slate-100 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`p-1.5 rounded-md ${badgeClass}`}>{icon}</span>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{m.product_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {m.product_sku} • {m.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p
                        className={`font-bold ${
                          isIn ? 'text-emerald-600' : isOut ? 'text-rose-600' : 'text-blue-600'
                        }`}
                      >
                        {isIn ? '+' : isOut ? '-' : '±'}
                        {m.quantity} {m.product_unit}
                      </p>
                      <p className="text-[10px] text-slate-400">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
