/**
 * Static catalog data for a product.
 * Source of truth for product details.
 */
export interface Product {
  sku: string;
  name: string;
  price: number;
}

/**
 * Represents the dynamic, transactional state of an item in the cart.
 */
export interface CartItem {
  sku: string;
  quantity: number;
}
