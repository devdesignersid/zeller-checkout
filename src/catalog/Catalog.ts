import { Product } from '../types';

/**
 * ProductCatalog managing product data and price lookups.
 */
export class ProductCatalog {
  private products: Map<string, Product>;

  constructor(products: Product[]) {
    this.products = new Map(products.map((p) => [p.sku, p]));
  }

  /**
   * Get the product price by SKU.
   */
  getPrice(sku: string): number {
    const product = this.products.get(sku);
    if (!product) {
      throw new Error(`Product with SKU ${sku} not found.`);
    }
    return product.price;
  }

  /**
   * Get the product details by SKU.
   */
  getProduct(sku: string): Product | undefined {
    return this.products.get(sku);
  }

  /**
   * Check if SKU exists in the catalog.
   */
  hasProduct(sku: string): boolean {
    return this.products.has(sku);
  }
}
