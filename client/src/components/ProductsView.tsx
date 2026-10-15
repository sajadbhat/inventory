import React, { useState } from 'react';
import {
  Search,
  Plus,
  List,
  LayoutGrid,
  SlidersHorizontal,
  Eye,
  Edit3,
  Trash2,
  PackageSearch,
  MapPin,
  Check,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import type { Category, Product, Supplier } from '../types/inventory';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  loading?: boolean;
  filters: {
    search: string;
    category_id: string;
    supplier_id: string;
    status: string;
    sort_by: string;
    sort_order: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onQuickAdjust: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  suppliers,
  filters,
  onFilterChange,
  onNewProduct,
  onEditProduct,
  onDeleteProduct,
  onQuickAdjust,
  onViewDetails,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Manage SKU master list, track stock levels, and configure pricing</p>
        </div>

        {/* View Switcher & New Product Button */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onNewProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by name, SKU, location, barcode..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filters.category_id}
            onChange={(e) => onFilterChange('category_id', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier Filter */}
        <div>
          <select
            value={filters.supplier_id}
            onChange={(e) => onFilterChange('supplier_id', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock (Healthy)</option>
            <option value="low_stock">Low Stock (Alert)</option>
            <option value="out_of_stock">Out of Stock (Zero)</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={`${filters.sort_by}:${filters.sort_order}`}
            onChange={(e) => {
              const [by, ord] = e.target.value.split(':');
              onFilterChange('sort_by', by);
              onFilterChange('sort_order', ord);
            }}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="name:asc">Sort: Name (A-Z)</option>
            <option value="name:desc">Sort: Name (Z-A)</option>
            <option value="quantity:asc">Sort: Quantity (Low &rarr; High)</option>
            <option value="quantity:desc">Sort: Quantity (High &rarr; Low)</option>
            <option value="selling_price:desc">Sort: Price (High &rarr; Low)</option>
            <option value="created_at:desc">Sort: Recently Added</option>
          </select>
        </div>
      </div>

      {/* Content Rendering: Empty State, Table, or Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <PackageSearch className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-700">No products found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query, or add a new product.</p>
          <button
            onClick={onNewProduct}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
          >
            + Add New Product
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Product Info / SKU</th>
                  <th className="py-3 px-4">Category & Supplier</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4 text-right">Pricing & Margin</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map((p) => {
                  const targetPercent = Math.min(100, Math.round((p.quantity / (p.min_threshold * 2 || 10)) * 100));
                  const barColor =
                    p.quantity === 0
                      ? 'bg-rose-500'
                      : p.quantity <= p.min_threshold
                      ? 'bg-amber-500'
                      : 'bg-emerald-500';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div
                          onClick={() => onViewDetails(p)}
                          className="font-semibold text-slate-800 hover:text-indigo-600 cursor-pointer"
                        >
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">{p.sku}</span>
                          {p.barcode && <span>UPC: {p.barcode}</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.category_name || 'Unassigned'}
                        </span>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {p.supplier_name || 'No Supplier'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 text-sm">
                            {p.quantity} <span className="text-xs text-slate-400 font-normal">{p.unit}</span>
                          </span>
                          {p.quantity === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Out
                            </span>
                          ) : p.quantity <= p.min_threshold ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertCircle className="w-3 h-3" /> Low ({p.quantity}/{p.min_threshold})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3" /> In Stock
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${targetPercent}%` }}></div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-slate-800">${p.selling_price.toFixed(2)}</div>
                        <div className="text-xs text-slate-400">
                          Cost: ${p.cost_price.toFixed(2)}{' '}
                          <span className="text-emerald-600 font-medium">(+{p.margin_percent}%)</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{p.location || 'Warehouse Shelf'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onQuickAdjust(p)}
                            title="Adjust Stock"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onViewDetails(p)}
                            title="View Details"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditProduct(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p)}
                            title="Delete Product"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const statusBorder =
              p.quantity === 0
                ? 'border-rose-300'
                : p.quantity <= p.min_threshold
                ? 'border-amber-300'
                : 'border-slate-200';

            return (
              <div
                key={p.id}
                className={`bg-white rounded-xl border ${statusBorder} p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {p.sku}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.quantity === 0
                          ? 'bg-rose-100 text-rose-700'
                          : p.quantity <= p.min_threshold
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {p.quantity} {p.unit}
                    </span>
                  </div>
                  <h4
                    onClick={() => onViewDetails(p)}
                    className="font-bold text-slate-800 text-sm line-clamp-2 hover:text-indigo-600 cursor-pointer"
                  >
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {p.category_name || 'General'} • {p.location || 'Warehouse'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-extrabold text-slate-900">${p.selling_price.toFixed(2)}</span>
                    <div className="text-[11px] text-slate-400">Cost: ${p.cost_price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onQuickAdjust(p)}
                      className="px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Adjust
                    </button>
                    <button
                      onClick={() => onEditProduct(p)}
                      className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
