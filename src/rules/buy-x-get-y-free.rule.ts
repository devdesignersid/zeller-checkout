import { CartItem, PricingRule, Product } from '../types';

import { ProductCatalog } from '../catalog';

/**
 * Buy X Get Y Free pricing rule.
 * E.g., Buy 3 for the price of 2.
 * - setQuantity: 3
 * - payQuantity: 2
 */
export class BuyXGetYFreeRule implements PricingRule {
  /**
   *
   * @param sku SKU of the product the rule applies to
   * @param setQuantity the minimum quantity of items the customer must buy to trigger the deal
   * @param payQuantity  the quantity of items the customer has to pay for in the deal
   * @param catalog Product catalog to fetch unit price
   * @throws Error if buyQuantity is not strictly greater than payQuantity
   */
  constructor(
    public readonly sku: string,
    private readonly setQuantity: number,
    private readonly payQuantity: number,
    private readonly catalog: ProductCatalog,
  ) {
    if (setQuantity <= payQuantity)
      throw new Error('buyQuantity must be greater than payQuantity');
  }

  apply(items: CartItem[]): number {
    const itemsForSku = items.find((item) => item.sku === this.sku);
    if (!itemsForSku) return 0;

    const unitPrice = this.catalog.getPrice(this.sku);

    /** How many times customer fully qualifies for the deal */
    const completeSets = Math.floor(itemsForSku.quantity / this.setQuantity);
    const remainingItems = itemsForSku.quantity % this.setQuantity;

    const chargeableQuantity = completeSets * this.payQuantity + remainingItems;
    return chargeableQuantity * unitPrice;
  }
}
