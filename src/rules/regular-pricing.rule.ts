import { CartItem, PricingRule } from '../types';

import { ProductCatalog } from '../catalog';

/**
 * Regular pricing rule applies standard unit price from the catalog
 */
export class RegularPricingRule implements PricingRule {
  /**
   *
   * @param sku SKU of the product the rule applies to
   * @param catalog Product catalog to fetch unit price
   */
  constructor(
    public readonly sku: string,
    private readonly catalog: ProductCatalog,
  ) {}
  apply(items: CartItem[]): number {
    const itemsForSku = items.find((item) => item.sku === this.sku);
    if (!itemsForSku) return 0;

    const unitPrice = this.catalog.getPrice(this.sku);
    return itemsForSku.quantity * unitPrice;
  }
}
