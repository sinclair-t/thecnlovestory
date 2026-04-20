export interface Guest {
  id: string;
  full_name: string;
  normalized_phone: string;
  country_code: string;
  local_phone: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface RSVP {
  id: string;
  guest_id: string;
  attending: boolean;
  guest_count: number;
  note?: string;
  source: string;
  created_at: string;
  updated_at: string;
  guest?: Guest;
}

export interface AsoebeCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AsoebeProduct {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  price_per_yard: number;
  image_url?: string;
  active: boolean;
  stock_note?: string;
  created_at: string;
  updated_at: string;
  category?: AsoebeCategory;
}

export interface Order {
  id: string;
  guest_id?: string;
  buyer_name: string;
  normalized_phone: string;
  country_code: string;
  local_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  delivery_notes?: string;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'shipped';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  guest?: Guest;
  items?: OrderItem[];
  receipts?: Receipt[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity_in_yards: number;
  price_per_yard: number;
  subtotal: number;
  created_at: string;
  product?: AsoebeProduct;
}

export interface Gift {
  id: string;
  guest_id?: string;
  giver_name: string;
  normalized_phone: string;
  country_code: string;
  local_phone: string;
  amount?: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  guest?: Guest;
  receipts?: Receipt[];
}

export interface Receipt {
  id: string;
  reference_type: 'order' | 'gift';
  reference_id: string;
  file_path: string;
  file_url?: string;
  file_name?: string;
  uploaded_at: string;
}

export interface BankAccount {
  id: string;
  label: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  currency: string;
  purpose: string;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductBankAccount {
  id: string;
  product_id: string;
  bank_account_id: string;
  display_order: number;
  created_at: string;
  bank_account?: BankAccount;
}

export interface GiftBankAccount {
  id: string;
  bank_account_id: string;
  display_order: number;
  created_at: string;
  bank_account?: BankAccount;
}

export interface Setting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      guests: { Row: Guest; Insert: Omit<Guest, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Guest>; };
      rsvps: { Row: RSVP; Insert: Omit<RSVP, 'id' | 'created_at' | 'updated_at'>; Update: Partial<RSVP>; };
      asoebe_categories: { Row: AsoebeCategory; Insert: Omit<AsoebeCategory, 'id' | 'created_at' | 'updated_at'>; Update: Partial<AsoebeCategory>; };
      asoebe_products: { Row: AsoebeProduct; Insert: Omit<AsoebeProduct, 'id' | 'created_at' | 'updated_at'>; Update: Partial<AsoebeProduct>; };
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Order>; };
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id' | 'created_at'>; Update: Partial<OrderItem>; };
      gifts: { Row: Gift; Insert: Omit<Gift, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Gift>; };
      receipts: { Row: Receipt; Insert: Omit<Receipt, 'id' | 'uploaded_at'>; Update: Partial<Receipt>; };
      bank_accounts: { Row: BankAccount; Insert: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>; Update: Partial<BankAccount>; };
      product_bank_accounts: { Row: ProductBankAccount; Insert: Omit<ProductBankAccount, 'id' | 'created_at'>; Update: Partial<ProductBankAccount>; };
      gift_bank_accounts: { Row: GiftBankAccount; Insert: Omit<GiftBankAccount, 'id' | 'created_at'>; Update: Partial<GiftBankAccount>; };
      settings: { Row: Setting; Insert: Omit<Setting, 'id' | 'updated_at'>; Update: Partial<Setting>; };
      audit_logs: { Row: AuditLog; Insert: Omit<AuditLog, 'id' | 'created_at'>; Update: Partial<AuditLog>; };
    };
  };
};
