import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../types/inventory';

interface ProductDetailModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onOpenAdjust: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  product,
  onClose,
  onOpenAdjust,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{product.sku}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAdjust(product);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Adjust Stock</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Specs Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium">In Stock</span>
              <div className="font-extrabold text-slate-900 text-base mt-0.5">
                {product.quantity} {product.unit}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Threshold</span>
              <div className="font-bold text-slate-700 text-sm mt-0.5">
                {product.min_threshold} {product.unit}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Selling Price</span>
              <div className="font-extrabold text-emerald-600 text-base mt-0.5">
                ${product.selling_price.toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Cost / Markup</span>
              <div className="font-medium text-slate-700 mt-0.5">
                ${product.cost_price.toFixed(2)}{' '}
                <span className="text-emerald-600 font-bold">+{product.margin_percent}%</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Category</span>
              <div className="font-semibold text-slate-800 mt-0.5">{product.category_name || 'Unassigned'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Supplier</span>
              <div className="font-semibold text-slate-800 mt-0.5">{product.supplier_name || 'No Supplier'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Warehouse Bin</span>
              <div className="font-semibold text-slate-800 mt-0.5">{product.location || 'Aisle Unset'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Barcode / UPC</span>
              <div className="font-mono text-slate-700 mt-0.5">{product.barcode || 'N/A'}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</h4>
            <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
              {product.description || 'No description provided for this product.'}
            </p>
          </div>

          {/* Movement History */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Item Movement History</h4>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-center">Change</th>
                    <th className="py-2.5 px-3 text-center">Balance Transition</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!product.movements || product.movements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                        No recorded movements for this item yet.
                      </td>
                    </tr>
                  ) : (
                    product.movements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-500">
                          {new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`font-semibold ${
                              m.type === 'IN'
                                ? 'text-emerald-600'
                                : m.type === 'OUT'
                                ? 'text-rose-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {m.type}
                          </span>
                        </td>
                        <td
                          className={`py-2 px-3 text-center font-bold ${
                            m.type === 'IN'
                              ? 'text-emerald-600'
                              : m.type === 'OUT'
                              ? 'text-rose-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : '±'}
                          {m.quantity}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-600 font-mono">
                          {m.previous_quantity} &rarr; <b>{m.new_quantity}</b>
                        </td>
                        <td className="py-2 px-3 text-slate-700">{m.reason}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">{m.reference_no || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
