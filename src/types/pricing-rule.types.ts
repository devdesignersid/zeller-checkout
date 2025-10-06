import { CartItem } from './product.types';

/**
 * Interface for all pricing rules.
 * Each rule calculates the total price of the item it applies to.
 */
export interface PricingRule {
  /**
   * Apply the pricing rule and return the calculated total for applicable items.
   * @param items - All items in the cart (Transactional Data).
   * @return Total price after applying this rule (0 if rule doesn't apply).
   */
  apply(items: CartItem[]): number;
}
