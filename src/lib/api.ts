import type { MenuCategory, MenuItem, Order, OrderStatus, PaymentMethod } from "../data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getHeaders() {
  const token = localStorage.getItem("spc_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request gagal dengan status ${response.status}`);
  }
  return data;
}

export function mapDbMenuToUi(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    category: (row.category_name || "Lauk") as Exclude<MenuCategory, "Semua">,
    price: Number(row.price),
    description: row.description || "",
    image: row.image_url || null,
    available: Boolean(row.is_available),
  };
}

function normalizeStatus(status: string): OrderStatus {
  if (status === "completed" || status === "done") return "done";
  if (status === "new" || status === "processing" || status === "preparing" || status === "ready") {
    return status;
  }
  return "new";
}

function normalizePaymentMethod(method?: string): PaymentMethod {
  const m = String(method || "qris").toLowerCase();
  if (m === "cash") return "Cash";
  if (m === "debit") return "Debit";
  return "QRIS";
}

export function mapDbOrderToUi(row: any): Order {
  const created = row.created_at ? new Date(row.created_at) : new Date();
  const timeStr = created.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const rawItems = Array.isArray(row.items) ? row.items : [];

  return {
    id: row.order_number || String(row.id),
    dbId: row.id,
    table: Number(row.table_number || 1),
    customerName: row.customer_name || "Pelanggan",
    orderType: row.order_type || "dine-in",
    notes: row.notes || undefined,
    time: timeStr,
    items: rawItems.map((it: any) => ({
      menu_id: it.menu_id,
      name: it.name,
      qty: Number(it.quantity || it.qty || 1),
      price: Number(it.unit_price || it.price || 0),
      notes: it.item_notes || it.notes || undefined,
    })),
    status: normalizeStatus(row.status),
    total: Number(row.total_amount || 0),
    paymentMethod: normalizePaymentMethod(row.payment_method),
    paymentStatus: row.payment_status === "paid" ? "paid" : "pending",
    createdAt: row.created_at || created.toISOString(),
  };
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await request<{ success: boolean; token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      localStorage.setItem("spc_token", res.token);
      localStorage.setItem("spc_user", JSON.stringify(res.user));
    }
    return res;
  },

  logout() {
    localStorage.removeItem("spc_token");
    localStorage.removeItem("spc_user");
  },

  getCurrentUser() {
    const raw = localStorage.getItem("spc_user");
    return raw ? JSON.parse(raw) : null;
  },

  // Menus & Categories
  async getCategories() {
    return request<{ success: boolean; categories: any[] }>("/menus/categories");
  },

  async getMenus(category?: string, availableOnly = false) {
    const params = new URLSearchParams();
    if (category && category !== "Semua") params.append("category", category);
    if (availableOnly) params.append("available_only", "true");
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return request<{ success: boolean; menus: any[] }>(`/menus${queryStr}`);
  },

  async createMenu(menuData: {
    name: string;
    category?: string;
    category_id?: string;
    description?: string;
    price: number;
    image_url?: string | null;
    is_available?: boolean;
  }) {
    return request<{ success: boolean; menu: any }>("/menus", {
      method: "POST",
      body: JSON.stringify(menuData),
    });
  },

  async updateMenu(
    id: string | number,
    menuData: {
      name?: string;
      category?: string;
      category_id?: string;
      description?: string;
      price?: number;
      image_url?: string | null;
      is_available?: boolean;
    }
  ) {
    return request<{ success: boolean; menu: any }>(`/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(menuData),
    });
  },

  async toggleMenuAvailability(id: string | number) {
    return request<{ success: boolean; menu: any }>(`/menus/${id}/toggle`, {
      method: "PATCH",
    });
  },

  async deleteMenu(id: string | number) {
    return request<{ success: boolean; message: string }>(`/menus/${id}`, {
      method: "DELETE",
    });
  },

  // Tables
  async getTables() {
    return request<{ success: boolean; tables: any[] }>("/tables");
  },

  // Orders
  async createOrder(payload: {
    table_number?: number;
    customer_name?: string;
    order_type?: "dine-in" | "takeaway";
    notes?: string;
    payment_method?: "cash" | "debit" | "qris";
    items: Array<{ menu_id: string | number; name?: string; quantity: number; notes?: string }>;
  }) {
    return request<{ success: boolean; message: string; order: any }>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getOrders(status?: string, date?: string) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (date) params.append("date", date);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return request<{ success: boolean; orders: any[] }>(`/orders${queryStr}`);
  },

  async getOrderDetail(id: string) {
    return request<{ success: boolean; order: any }>(`/orders/${id}`);
  },

  async updateOrderStatus(id: string, status: string) {
    const dbStatus = status === "done" ? "completed" : status;
    return request<{ success: boolean; message: string; order: any }>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: dbStatus }),
    });
  },

  // Payments
  async processPayment(order_id: string, payment_method: "cash" | "debit" | "qris", amount_paid: number) {
    return request<{ success: boolean; message: string; payment: any }>("/payments", {
      method: "POST",
      body: JSON.stringify({ order_id, payment_method, amount_paid }),
    });
  },

  async getReceipt(order_id: string) {
    return request<{ success: boolean; receipt: any }>(`/payments/${order_id}/receipt`);
  },

  // Reports
  async getReportSummary() {
    return request<{ success: boolean; summary: any }>("/reports/summary");
  },

  async getSalesChart(days = 7) {
    return request<{ success: boolean; chartData: any[] }>(`/reports/sales-chart?days=${days}`);
  },

  async getBestSellers(limit = 6) {
    return request<{ success: boolean; bestSellers: any[] }>(`/reports/best-sellers?limit=${limit}`);
  },

  async getTransactions(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return request<{ success: boolean; transactions: any[] }>(`/reports/transactions${queryStr}`);
  },
};
