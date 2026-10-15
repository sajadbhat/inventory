import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { MovementsView } from './components/MovementsView';
import { CategoriesView } from './components/CategoriesView';
import { SuppliersView } from './components/SuppliersView';
import { ProductModal } from './components/ProductModal';
import { QuickAdjustModal } from './components/QuickAdjustModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CategoryModal } from './components/CategoryModal';
import { SupplierModal } from './components/SupplierModal';
import { Toast } from './components/Toast';
import { API } from './services/api';
import type {
  Category,
  DashboardData,
  Movement,
  Product,
  Supplier,
  ToastMessage,
  ViewTab,
} from './types/inventory';

export function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Entities
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [movementsSummary, setMovementsSummary] = useState({
    total_records: 0,
    total_in_units: 0,
    total_out_units: 0,
  });

  // Filters for products
  const [productFilters, setProductFilters] = useState({
    search: '',
    category_id: 'all',
    supplier_id: 'all',
    status: 'all',
    sort_by: 'name',
    sort_order: 'asc',
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch dashboard stats
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.dashboard.getStats();
      if (res.success) setDashboardData(res.data);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.products.list(productFilters);
      if (res.success) setProducts(res.data);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [productFilters]);

  // Fetch categories & suppliers metadata
  const fetchMetadata = useCallback(async () => {
    try {
      const [catsRes, supsRes] = await Promise.all([API.categories.list(), API.suppliers.list()]);
      if (catsRes.success) setCategories(catsRes.data);
      if (supsRes.success) setSuppliers(supsRes.data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  // Fetch movements
  const fetchMovements = useCallback(async (type = 'all', search = '') => {
    try {
      setLoading(true);
      const res = await API.movements.list({ type, search, limit: 100 });
      if (res.success) {
        setMovements(res.data);
        if (res.summary) setMovementsSummary(res.summary);
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Load tab-specific data
  useEffect(() => {
    if (currentTab === 'dashboard') {
      fetchDashboard();
    } else if (currentTab === 'products') {
      fetchProducts();
    } else if (currentTab === 'movements') {
      fetchMovements();
    } else if (currentTab === 'categories') {
      API.categories.list().then((r) => r.success && setCategories(r.data));
    } else if (currentTab === 'suppliers') {
      API.suppliers.list().then((r) => r.success && setSuppliers(r.data));
    }
  }, [currentTab, fetchDashboard, fetchProducts, fetchMovements]);

  // Handle Product Save (Create or Update)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct?.id) {
        await API.products.update(editingProduct.id, productData);
        addToast('Product updated successfully', 'success');
      } else {
        await API.products.create(productData);
        addToast('Product added successfully', 'success');
      }
      if (currentTab === 'products') fetchProducts();
      if (currentTab === 'dashboard') fetchDashboard();
      fetchMetadata();
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Handle Product Delete
  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?\nAll associated stock movements will be removed.`)) {
      try {
        await API.products.delete(product.id);
        addToast(`Product "${product.name}" deleted`, 'success');
        fetchProducts();
        fetchDashboard();
      } catch (err: any) {
        addToast(err.message, 'error');
      }
    }
  };

  // Handle Stock Adjust Confirmation
  const handleConfirmAdjust = async (adjustData: {
    type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    reason: string;
    reference_no?: string;
  }) => {
    if (!adjustingProduct) return;
    try {
      await API.products.adjust(adjustingProduct.id, adjustData);
      addToast('Stock level adjusted successfully', 'success');
      if (currentTab === 'products') fetchProducts();
      if (currentTab === 'dashboard') fetchDashboard();
      if (currentTab === 'movements') fetchMovements();
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Handle View Details
  const handleViewDetails = async (product: Product) => {
    try {
      const res = await API.products.get(product.id);
      if (res.success) {
        setDetailProduct(res.data);
        setDetailModalOpen(true);
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // Handle Category Save & Delete
  const handleSaveCategory = async (data: { name: string; description?: string }) => {
    try {
      if (editingCategory?.id) {
        await API.categories.update(editingCategory.id, data);
        addToast('Category updated', 'success');
      } else {
        await API.categories.create(data);
        addToast('Category created', 'success');
      }
      const res = await API.categories.list();
      if (res.success) setCategories(res.data);
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (confirm(`Delete category "${category.name}"? Products will become uncategorized.`)) {
      try {
        await API.categories.delete(category.id);
        addToast('Category deleted', 'success');
        const res = await API.categories.list();
        if (res.success) setCategories(res.data);
      } catch (err: any) {
        addToast(err.message, 'error');
      }
    }
  };

  // Handle Supplier Save & Delete
  const handleSaveSupplier = async (data: Partial<Supplier>) => {
    try {
      if (editingSupplier?.id) {
        await API.suppliers.update(editingSupplier.id, data);
        addToast('Supplier updated', 'success');
      } else {
        await API.suppliers.create(data);
        addToast('Supplier added', 'success');
      }
      const res = await API.suppliers.list();
      if (res.success) setSuppliers(res.data);
    } catch (err: any) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (confirm(`Delete supplier "${supplier.name}"?`)) {
      try {
        await API.suppliers.delete(supplier.id);
        addToast('Supplier deleted', 'success');
        const res = await API.suppliers.list();
        if (res.success) setSuppliers(res.data);
      } catch (err: any) {
        addToast(err.message, 'error');
      }
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (confirm('Are you sure you want to restore demo sample data?\nThis resets all products, movements, and suppliers.')) {
      try {
        await API.resetDemo();
        addToast('Demo sample data restored!', 'success');
        await fetchMetadata();
        if (currentTab === 'dashboard') fetchDashboard();
        else if (currentTab === 'products') fetchProducts();
        else if (currentTab === 'movements') fetchMovements();
      } catch (err: any) {
        addToast(err.message, 'error');
      }
    }
  };

  const totalAttentionCount =
    dashboardData ? dashboardData.summary.lowStockCount + dashboardData.summary.outOfStockCount : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          alertCount={totalAttentionCount}
          onFilterAlerts={() => {
            setCurrentTab('products');
            setProductFilters((prev) => ({ ...prev, status: 'low_stock' }));
          }}
          onReceiveStock={() => {
            const first = products[0] || null;
            setAdjustingProduct(first);
            setAdjustType('IN');
            setAdjustModalOpen(true);
          }}
          onDispatchStock={() => {
            const first = products[0] || null;
            setAdjustingProduct(first);
            setAdjustType('OUT');
            setAdjustModalOpen(true);
          }}
          onNewProduct={() => {
            setEditingProduct(null);
            setProductModalOpen(true);
          }}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              data={dashboardData}
              loading={loading}
              onRefresh={fetchDashboard}
              onFilterLowStock={() => {
                setCurrentTab('products');
                setProductFilters((prev) => ({ ...prev, status: 'low_stock' }));
              }}
              onQuickRestock={(productId) => {
                const p =
                  dashboardData?.lowStockAlerts.find((item) => item.id === productId) ||
                  products.find((item) => item.id === productId);
                if (p) {
                  setAdjustingProduct(p);
                  setAdjustType('IN');
                  setAdjustModalOpen(true);
                }
              }}
              onViewAllMovements={() => setCurrentTab('movements')}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              suppliers={suppliers}
              loading={loading}
              filters={productFilters}
              onFilterChange={(k, v) => setProductFilters((prev) => ({ ...prev, [k]: v }))}
              onNewProduct={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onQuickAdjust={(p) => {
                setAdjustingProduct(p);
                setAdjustType('IN');
                setAdjustModalOpen(true);
              }}
              onViewDetails={handleViewDetails}
            />
          )}

          {currentTab === 'movements' && (
            <MovementsView
              movements={movements}
              summary={movementsSummary}
              loading={loading}
              onFilterChange={(type, search) => fetchMovements(type, search)}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              loading={loading}
              onNewCategory={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              onEditCategory={(c) => {
                setEditingCategory(c);
                setCategoryModalOpen(true);
              }}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {currentTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              loading={loading}
              onNewSupplier={() => {
                setEditingSupplier(null);
                setSupplierModalOpen(true);
              }}
              onEditSupplier={(s) => {
                setEditingSupplier(s);
                setSupplierModalOpen(true);
              }}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}
        </main>
      </div>

      {/* Product Create / Edit Modal */}
      <ProductModal
        isOpen={productModalOpen}
        product={editingProduct}
        categories={categories}
        suppliers={suppliers}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Quick Adjust Modal */}
      <QuickAdjustModal
        isOpen={adjustModalOpen}
        product={adjustingProduct}
        defaultType={adjustType}
        onClose={() => setAdjustModalOpen(false)}
        onConfirm={handleConfirmAdjust}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={detailModalOpen}
        product={detailProduct}
        onClose={() => setDetailModalOpen(false)}
        onOpenAdjust={(p) => {
          setAdjustingProduct(p);
          setAdjustType('IN');
          setAdjustModalOpen(true);
        }}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        category={editingCategory}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={supplierModalOpen}
        supplier={editingSupplier}
        onClose={() => setSupplierModalOpen(false)}
        onSave={handleSaveSupplier}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
