import { PricingRule } from '../types';
import { ProductCatalog } from '../catalog';
import { RegularPricingRule } from './regular-pricing.rule';

/**
 * Compose the final set of pricing rules to be applied during checkout.
 *
 * If no specific rule assigned for a SKU, will use regular pricing
 * @param catalog The product catalog
 * @param pricingRules Pricing defined for specific SKUs
 * @returns Final set of pricing rules to be applied
 */
export function composePricingRules(
  catalog: ProductCatalog,
  pricingRules: PricingRule[],
): PricingRule[] {
  const rules: PricingRule[] = [];
  const skusWithRules = new Set<string>();

  for (const pricingRule of pricingRules) {
    if (!catalog.hasProduct(pricingRule.sku)) {
      console.warn(
        `Warning: Pricing rule assigned to unknown SKU: ${pricingRule.sku} - Rule ignored.`,
      );
      continue;
    }

    rules.push(pricingRule);
    skusWithRules.add(pricingRule.sku);
  }

  for (const product of catalog.getAllProducts()) {
    if (!skusWithRules.has(product.sku)) {
      // If no specific rule assigned, use regular pricing
      rules.push(new RegularPricingRule(product.sku, catalog));
    }
  }

  return rules;
}
