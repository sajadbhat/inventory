import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Product } from '../types/inventory';

interface QuickAdjustModalProps {
  isOpen: boolean;
  product: Product | null;
  defaultType?: 'IN' | 'OUT' | 'ADJUST';
  onClose: () => void;
  onConfirm: (data: {
    type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    reason: string;
    reference_no?: string;
  }) => Promise<void>;
}

export const QuickAdjustModal: React.FC<QuickAdjustModalProps> = ({
  isOpen,
  product,
  defaultType = 'IN',
  onClose,
  onConfirm,
}) => {
  const [type, setType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [quantity, setQuantity] = useState<number | string>('');
  const [reason, setReason] = useState('');
  const [refNo, setRefNo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setType(defaultType);
    setQuantity('');
    setRefNo('');
    if (defaultType === 'IN') setReason('Supplier Delivery Received');
    else if (defaultType === 'OUT') setReason('Customer Order Fulfillment');
    else setReason('Stock Audit Count Correction');
  }, [defaultType, product, isOpen]);

  if (!isOpen || !product) return null;

  const cur = product.quantity;
  const qty = parseInt(String(quantity), 10) || 0;

  let next = cur;
  if (type === 'IN') next = cur + qty;
  else if (type === 'OUT') next = cur - qty;
  else if (type === 'ADJUST') next = qty;

  const isInvalid = type === 'OUT' && next < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) return;
    if (isInvalid) return;

    setSubmitting(true);
    try {
      await onConfirm({
        type,
        quantity: qty,
        reason: reason.trim(),
        reference_no: refNo.trim() || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Adjust Stock Level</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{product.sku}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800 text-xs">{product.name}</div>
              <div className="text-[11px] text-slate-400">Current Balance:</div>
            </div>
            <span className="text-base font-black text-indigo-600">
              {product.quantity} {product.unit}
            </span>
          </div>

          {/* Movement Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Type</label>
            <select
              value={type}
              onChange={(e) => {
                const newT = e.target.value as 'IN' | 'OUT' | 'ADJUST';
                setType(newT);
                if (newT === 'IN') setReason('Supplier Delivery Received');
                else if (newT === 'OUT') setReason('Customer Order Fulfillment');
                else setReason('Stock Audit Count Correction');
              }}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="IN">Stock In / Receipt (+ Add to stock)</option>
              <option value="OUT">Stock Out / Dispatch (- Deduct from stock)</option>
              <option value="ADJUST">Audit / Physical Count (= Reset balance)</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter units..."
              className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="text-xs text-slate-500 mt-1.5 font-medium">
              {isInvalid ? (
                <span className="text-rose-600 font-bold">Error: Stock cannot fall below 0! (Result: {next})</span>
              ) : (
                <span>
                  Resulting balance will be: <b className="text-indigo-600">{next}</b> {product.unit}
                </span>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Movement Note</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Reference # */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Number (Optional)</label>
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="e.g. PO-9801, INV-4402"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isInvalid || qty <= 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
