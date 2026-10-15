import type { Category, DashboardData, Movement, Product, Supplier } from '../types/inventory';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return data;
}

export const API = {
  dashboard: {
    getStats: () => request<{ success: boolean; data: DashboardData }>('/api/dashboard/stats'),
  },

  products: {
    list: (params: Record<string, string | number> = {}) => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '' && v !== 'all')
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return request<{ success: boolean; count: number; data: Product[] }>(`/api/products${query ? '?' + query : ''}`);
    },
    get: (id: number) => request<{ success: boolean; data: Product }>(`/api/products/${id}`),
    create: (data: Partial<Product>) =>
      request<{ success: boolean; message: string; data: { id: number; sku: string; name: string; quantity: number } }>('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Product>) =>
      request<{ success: boolean; message: string }>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ success: boolean; message: string }>(`/api/products/${id}`, {
        method: 'DELETE',
      }),
    adjust: (id: number, data: { type: 'IN' | 'OUT' | 'ADJUST'; quantity: number; reason: string; reference_no?: string; performed_by?: string }) =>
      request<{ success: boolean; message: string; data: any }>(`/api/products/${id}/adjust`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  categories: {
    list: () => request<{ success: boolean; count: number; data: Category[] }>('/api/categories'),
    create: (data: { name: string; description?: string }) =>
      request<{ success: boolean; message: string; data: Category }>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { name: string; description?: string }) =>
      request<{ success: boolean; message: string }>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ success: boolean; message: string }>(`/api/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  suppliers: {
    list: () => request<{ success: boolean; count: number; data: Supplier[] }>('/api/suppliers'),
    create: (data: Partial<Supplier>) =>
      request<{ success: boolean; message: string; data: Supplier }>('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Supplier>) =>
      request<{ success: boolean; message: string }>(`/api/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ success: boolean; message: string }>(`/api/suppliers/${id}`, {
        method: 'DELETE',
      }),
  },

  movements: {
    list: (params: Record<string, string | number> = {}) => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '' && v !== 'all')
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return request<{
        success: boolean;
        summary: { total_records: number; total_in_units: number; total_out_units: number };
        count: number;
        data: Movement[];
      }>(`/api/movements${query ? '?' + query : ''}`);
    },
    create: (data: Partial<Movement>) =>
      request<{ success: boolean; message: string; data: any }>('/api/movements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  resetDemo: () =>
    request<{ success: boolean; message: string }>('/api/export/reset-demo', {
      method: 'POST',
    }),
};
