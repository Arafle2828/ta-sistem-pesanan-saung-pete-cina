// Tipe database ditulis manual mengikuti supabase/migrations/0001_init.sql.
// Setelah project Supabase dibuat, bisa digantikan hasil generate resmi:
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts

export type UserRole = "admin" | "cashier" | "kitchen";
export type TableStatus = "available" | "occupied";
export type OrderType = "dine-in" | "takeaway";
export type OrderStatus = "new" | "processing" | "preparing" | "ready" | "completed" | "cancelled";
export type PaymentMethod = "cash" | "debit" | "qris";
export type PaymentStatus = "paid" | "pending";

type Timestamp = string;

interface ProfileRow {
  id: string;
  name: string;
  role: UserRole;
  created_at: Timestamp;
}
interface TableRow {
  id: string;
  table_number: number;
  qr_code_url: string | null;
  status: TableStatus;
  created_at: Timestamp;
}
interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: Timestamp;
}
interface MenuRow {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: Timestamp;
}
interface OrderRow {
  id: string;
  order_number: string;
  table_id: string | null;
  customer_name: string;
  order_type: OrderType;
  status: OrderStatus;
  notes: string | null;
  total_amount: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}
interface OrderItemRow {
  id: string;
  order_id: string;
  menu_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  item_notes: string | null;
}
interface PaymentRow {
  id: string;
  order_id: string;
  cashier_id: string | null;
  payment_method: PaymentMethod;
  amount_paid: number;
  change_amount: number;
  payment_status: PaymentStatus;
  paid_at: Timestamp;
}
interface ExpenseRow {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  created_at: Timestamp;
}

type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "id" | "name">;
      tables: Table<TableRow, "table_number">;
      categories: Table<CategoryRow, "name" | "slug">;
      menus: Table<MenuRow, "name" | "price">;
      orders: Table<OrderRow, never>;
      order_items: Table<OrderItemRow, "order_id" | "menu_id" | "quantity" | "unit_price" | "subtotal">;
      payments: Table<PaymentRow, "order_id" | "payment_method" | "amount_paid">;
      expenses: Table<ExpenseRow, "description" | "amount">;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      table_status: TableStatus;
      order_type: OrderType;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
