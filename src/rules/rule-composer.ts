import { PricingRule } from '../types';
import { ProductCatalog } from '../catalog';
import { RegularPricingRule } from './regular-pricing.rule';

/**
 * Composes the final set of pricing rules to be applied during checkout.
 *
 * This function ensures that every item in the catalog has a base price
 * calculated via a RegularPricingRule, and then adds all promotional rules
 * to apply discounts/adjustments on top.
 * @param catalog The product catalog
 * @param pricingRules Pricing defined for specific SKUs
 * @returns Final set of pricing rules to be applied
 */
export function composePricingRules(
  catalog: ProductCatalog,
  pricingRules: PricingRule[],
): PricingRule[] {
  const rules: PricingRule[] = [];
  const skusInCatalog = catalog.getAllProducts().map((p) => p.sku);

  for (const sku of skusInCatalog) {
    rules.push(new RegularPricingRule(sku, catalog));
  }

  for (const rule of pricingRules) {
    if (!catalog.hasProduct(rule.sku)) {
      console.warn(
        `Warning: Pricing rule assigned to unknown SKU: ${rule.sku} - Rule ignored.`,
      );
      continue;
    }
    rules.push(rule);
  }

  return rules;
}
