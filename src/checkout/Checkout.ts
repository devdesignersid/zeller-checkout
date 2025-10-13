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
   *
   * The total price is calculated by summing the results of all pricing rules.
   * The pricing rules expect the cart items prices to be in the smallest currency unit (for example, cents).
   * The total is then divided by 100 to convert it to the standard currency unit (for example, dollars).
   * @returns The total price of all items in the cart.
   */
  total(): number {
    const CENTS_PER_DOLLAR = 100;

    const cartItems = Array.from(this.items.values());

    const immutableCartItems: CartItem[] = cartItems.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
    }));

    const totalInCents = this.pricingRules.reduce(
      (sum, rule) => sum + rule.apply(immutableCartItems),
      0,
    );

    return totalInCents / CENTS_PER_DOLLAR; // Round to 2 decimal places for floating point precision
  }

  /**
   * Clears the cart.
   */
  clear(): void {
    this.items.clear();
  }
}
