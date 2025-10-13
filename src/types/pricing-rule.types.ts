import { CartItem } from './product.types';

/**
 * Interface for all pricing rules.
 * Rules can either ADD to the total (base pricing) or SUBTRACT from it (discounts).
 */
export interface PricingRule {
  readonly sku: string;
  /**
   * Apply the pricing rule and return the price adjustment for applicable items.
   *
   * RETURN VALUES:
   * - Positive: Adds to cart total (e.g., base product pricing)
   * - Negative: Subtracts from cart total (e.g., discounts, promotions)
   * - Zero: Rule doesn't apply to current cart state
   *
   * @param items - All items in the cart (immutable snapshot)
   * @return Price adjustment in cents (positive for charges, negative for discounts)
   */
  apply(items: CartItem[]): number;
}
