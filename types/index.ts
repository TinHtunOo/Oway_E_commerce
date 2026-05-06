// =====================
// AUTH
// =====================
export type User = {
  id: string;
  email: string;
  created_at: string;
};

// =====================
// PROFILE
// =====================
export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

// =====================
// CATEGORY
// =====================
export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
}[];

export type CategoryWithChildren = Category & {
  children?: Category[];
};

// =====================
// PRODUCT
// =====================
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Product with joined relations
export type ProductWithDetails = Product & {
  product_images: ProductImage[];
  categories: Category | null;
};

// Product card (minimal — for listing pages)
export type ProductCard =
  | {
      id: string;
      name: string;
      slug: string;
      price: number;
      stock: number;
      description: string;
      product_images: {
        url: string;
        is_primary: boolean;
      }[];
      categories: {
        id: string;
        name: string;
        slug: string;
      };
    }[]
  | null;

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  description: string;
  product_images: {
    url: string;
    is_primary: boolean;
  }[];
  categories: {
    id: string;
    name: string;
    slug: string;
  };
} | null;

export type ProductResult =
  | {
      id: string;
      name: string;
      slug: string;
      price: number;
      stock: number;
      description: string;
      product_images: {
        url: string;
        is_primary: boolean;
      }[];
      categories: {
        id: string;
        name: string;
        slug: string;
      };
    }[]
  | null;

// =====================
// PRODUCT IMAGE
// =====================
export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
};

// =====================
// ADDRESS
// =====================
export type Address = {
  id: string;
  user_id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
};

// =====================
// ORDER
// =====================
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  shipping_address_id: string | null;
  created_at: string;
  updated_at: string;
};

// Order with joined relations
export type OrderWithDetails = Order & {
  order_items: OrderItemWithProduct[];
  addresses: Address | null;
};

// =====================
// ORDER ITEM
// =====================
export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export type OrderItemWithProduct = OrderItem & {
  products: Pick<Product, "id" | "name" | "slug"> & {
    product_images: Pick<ProductImage, "url" | "is_primary">[];
  };
};

// =====================
// CART
// =====================
export type Cart = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type CartWithItems = Cart & {
  cart_items: CartItemWithProduct[];
};

// =====================
// CART ITEM
// =====================
export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
};

export type CartItemWithProduct = CartItem & {
  products: Pick<Product, "id" | "name" | "slug" | "price" | "stock"> & {
    product_images: Pick<ProductImage, "url" | "is_primary">[];
  };
};

// =====================
// API RESPONSE
// =====================
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

// =====================
// PAGINATION
// =====================
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// =====================
// SUPABASE DATABASE TYPE MAP
// (matches your table structure)
// =====================
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "created_at">;
        Update: Partial<Omit<Category, "id">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id">>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, "created_at">;
        Update: Partial<Omit<ProductImage, "id">>;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, "created_at">;
        Update: Partial<Omit<Address, "id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "created_at" | "updated_at">;
        Update: Partial<Omit<Order, "id">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "created_at">;
        Update: Partial<Omit<OrderItem, "id">>;
      };
      carts: {
        Row: Cart;
        Insert: Omit<Cart, "created_at" | "updated_at">;
        Update: Partial<Omit<Cart, "id">>;
      };
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, "created_at">;
        Update: Partial<Omit<CartItem, "id">>;
      };
    };
  };
};
