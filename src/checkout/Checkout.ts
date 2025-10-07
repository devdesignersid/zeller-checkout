import { CartItem, PricingRule, ProductCatalog } from '..';

/**
 * Checkout system implementing scan and total calculation.
 */
export class Checkout {
  private items: Map<string, CartItem> = new Map();

  constructor(
    private readonly pricingRules: PricingRule[],
    private readonly catalog: ProductCatalog,
  ) {}

  /**
   * Scans an item and adds it to the cart.
   * @param itemSku - The SKU of the item to scan.
   */
  scan(itemSku: string): void {
    if (!this.catalog.hasProduct(itemSku)) {
      console.warn(
        `Warning: Attempted to scan unknown item: ${itemSku} - Scan ignored.`,
      );

      return;
    }
    const existingItem = this.items.get(itemSku);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.set(itemSku, { sku: itemSku, quantity: 1 });
    }
  }

  /**
   * Calculates the total price applying all pricing rules.
   * @returns
   */
  total(): number {
    const cartItems = Array.from(this.items.values());

    const immutableCartItems: CartItem[] = cartItems.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
    }));

    const total = this.pricingRules.reduce(
      (sum, rule) => sum + rule.apply(immutableCartItems),
      0,
    );

    return Math.round(total * 100) / 100; // Round to 2 decimal places for floating point precision
  }

  /**
   * Clears the cart.
   */
  clear(): void {
    this.items.clear();
  }
}
