import React from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone, MapPin } from 'lucide-react';
import type { Supplier } from '../types/inventory';

interface SuppliersViewProps {
  suppliers: Supplier[];
  loading?: boolean;
  onNewSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplier: Supplier) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  onNewSupplier,
  onEditSupplier,
  onDeleteSupplier,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Suppliers Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Maintain vendor contact cards, purchase sources, and addresses</p>
        </div>
        <button
          onClick={onNewSupplier}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-base">{sup.name}</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {sup.product_count} Products
                </span>
              </div>
              {sup.contact_person && (
                <p className="text-xs text-slate-700 font-medium flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.contact_person}</span>
                </p>
              )}
              {sup.email && (
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{sup.email}</span>
                </p>
              )}
              {sup.phone && (
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.phone}</span>
                </p>
              )}
              {sup.address && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.address}</span>
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Supplied Units: <b>{sup.total_units_supplied}</b>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditSupplier(sup)}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteSupplier(sup)}
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
