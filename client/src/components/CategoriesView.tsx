import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Category } from '../types/inventory';

interface CategoriesViewProps {
  categories: Category[];
  loading?: boolean;
  onNewCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onNewCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">Organize your inventory catalog by merchandise departments</p>
        </div>
        <button
          onClick={onNewCategory}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-base">{cat.name}</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {cat.product_count} Products
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{cat.description || 'No description provided.'}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Units: <span className="font-bold text-slate-800">{cat.total_units}</span>
                <span className="mx-1.5">•</span>
                Valuation: <span className="font-bold text-emerald-600">${cat.total_value?.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditCategory(cat)}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteCategory(cat)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
