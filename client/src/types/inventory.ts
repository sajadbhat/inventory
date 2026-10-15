export interface Product {
  id: number;
  sku: string;
  name: string;
  category_id: number | null;
  supplier_id: number | null;
  description: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  quantity: number;
  min_threshold: number;
  location: string;
  barcode: string;
  category_name?: string;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone?: string;
  total_cost_value?: number;
  total_retail_value?: number;
  margin_percent?: number;
  stock_status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  created_at?: string;
  updated_at?: string;
  movements?: Movement[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  product_count?: number;
  total_units?: number;
  total_value?: number;
  created_at?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  product_count?: number;
  total_units_supplied?: number;
  created_at?: string;
}

export interface Movement {
  id: number;
  product_id: number;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  unit_price: number;
  total_amount?: number;
  reason: string;
  reference_no?: string;
  performed_by: string;
  timestamp: string;
  product_name?: string;
  product_sku?: string;
  product_unit?: string;
  category_name?: string;
}

export interface DashboardSummary {
  totalProducts: number;
  totalUnits: number;
  totalCostValue: number;
  totalRetailValue: number;
  projectedProfit: number;
  outOfStockCount: number;
  lowStockCount: number;
  healthyStockCount: number;
  totalCategories: number;
  totalSuppliers: number;
}

export interface CategoryBreakdown {
  category_name: string;
  product_count: number;
  total_quantity: number;
  total_value: number;
  total_cost: number;
}

export interface MovementTrend {
  move_date: string;
  total_in: number;
  total_out: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  lowStockAlerts: Product[];
  categoryBreakdown: CategoryBreakdown[];
  recentMovements: Movement[];
  movementTrends: MovementTrend[];
}

export type ViewTab = 'dashboard' | 'products' | 'movements' | 'categories' | 'suppliers';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
