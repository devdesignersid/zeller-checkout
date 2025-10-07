import { CartItem, PricingRule } from '../types';

import { ProductCatalog } from '../catalog';

/**
 * Applies a discount to a product when a minimum quantity is purchased.
 *
 * E.g., If you buy 5 or more, the price drops to $8.99 each.
 * - threshold: 5
 * - discountedPrice: 8.99
 */
export class BulkDiscountRule implements PricingRule {
  /**
   *
   * @param sku SKU of the product the rule applies to
   * @param threshold  minimum quantity to qualify for discount
   * @param discountedPrice  the new unit price when threshold is met
   * @param catalog  Product catalog to fetch unit price
   */
  constructor(
    public readonly sku: string,
    private readonly threshold: number,
    private readonly discountedPrice: number,
    private readonly catalog: ProductCatalog,
  ) {}
  apply(items: CartItem[]): number {
    const itemsForSku = items.find((item) => item.sku === this.sku);
    if (!itemsForSku) return 0;

    if (itemsForSku.quantity >= this.threshold) {
      const unitPrice = this.catalog.getPrice(this.sku);
      const discountPerItem = unitPrice - this.discountedPrice;
      return -(itemsForSku.quantity * discountPerItem);
    }

    return 0;
  }
}
