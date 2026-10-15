import React, { useState, useEffect } from 'react';
import { X, Wand2 } from 'lucide-react';
import type { Category, Product, Supplier } from '../types/inventory';

interface ProductModalProps {
  isOpen: boolean;
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  categories,
  suppliers,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [supplierId, setSupplierId] = useState<number | string>('');
  const [unit, setUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState<number | string>('');
  const [sellingPrice, setSellingPrice] = useState<number | string>('');
  const [quantity, setQuantity] = useState<number | string>('0');
  const [minThreshold, setMinThreshold] = useState<number | string>('5');
  const [location, setLocation] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setCategoryId(product.category_id || '');
      setSupplierId(product.supplier_id || '');
      setUnit(product.unit || 'pcs');
      setCostPrice(product.cost_price ?? '');
      setSellingPrice(product.selling_price ?? '');
      setQuantity(product.quantity ?? '0');
      setMinThreshold(product.min_threshold ?? '5');
      setLocation(product.location || '');
      setBarcode(product.barcode || '');
      setDescription(product.description || '');
    } else {
      setName('');
      setSku('');
      setCategoryId('');
      setSupplierId('');
      setUnit('pcs');
      setCostPrice('');
      setSellingPrice('');
      setQuantity('0');
      setMinThreshold('5');
      setLocation('');
      setBarcode('');
      setDescription('');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const cost = parseFloat(String(costPrice)) || 0;
  const price = parseFloat(String(sellingPrice)) || 0;
  const margin = cost > 0 && price > 0 ? (((price - cost) / cost) * 100).toFixed(1) : null;

  const generateRandomSKU = () => {
    const selectedCat = categories.find((c) => String(c.id) === String(categoryId));
    const prefix = (selectedCat?.name.replace(/[^a-zA-Z]/g, '').slice(0, 3) || 'PRD').toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${rand}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category_id: categoryId ? Number(categoryId) : null,
        supplier_id: supplierId ? Number(supplierId) : null,
        unit,
        cost_price: parseFloat(String(costPrice)) || 0,
        selling_price: parseFloat(String(sellingPrice)) || 0,
        quantity: parseInt(String(quantity), 10) || 0,
        min_threshold: parseInt(String(minThreshold), 10) || 5,
        location: location.trim(),
        barcode: barcode.trim(),
        description: description.trim(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-900">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ergonomic Office Desk"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* SKU with Generator */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Auto-generated if blank"
                  className="w-full px-3 py-2 text-xs uppercase font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={generateRandomSKU}
                  title="Generate SKU"
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium shrink-0 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="box">Box (box)</option>
                <option value="pack">Pack (pack)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="set">Set (set)</option>
                <option value="liters">Liters (l)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Selling Price */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Selling Price ($)</label>
                {margin && (
                  <span
                    className={`text-xs font-semibold ${
                      parseFloat(margin) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    Markup: +{margin}%
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">In Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Alert Threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Low Stock Alert Threshold</label>
              <input
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Aisle B-04"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode / UPC</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 789100101"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specifications, supplier details, warranty terms..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
