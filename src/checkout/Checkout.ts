import { CartItem, PricingRule } from '..';

/**
 * Checkout system implementing scan and total calculation.
 */
export class Checkout {
  private items: Map<string, CartItem> = new Map();

  constructor(private readonly pricingRules: PricingRule[]) {}

  /**
   * Scans an item and adds it to the cart.
   * @param itemSku - The SKU of the item to scan.
   */
  scan(itemSku: string): void {}

  /**
   * Calculates the total price applying all pricing rules.
   * @returns
   */
  total(): number {
    return 0;
  }
}
