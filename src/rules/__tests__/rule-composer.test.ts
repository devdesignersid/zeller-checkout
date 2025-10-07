import { PricingRule, Product } from '../../types';

import { ProductCatalog } from '../../catalog';
import { RegularPricingRule } from '../regular-pricing.rule';
import { composePricingRules } from '../rule-composer';

class MockPromoRule implements PricingRule {
  constructor(public readonly sku: string) {}
  apply() {
    return -10;
  } // Returns a discount
}

describe('composePricingRules', () => {
  let catalog: ProductCatalog;
  const testProducts: Product[] = [
    { sku: 'ipd', name: 'Super iPad', price: 549.99 },
    { sku: 'mbp', name: 'MacBook Pro', price: 1399.99 },
    { sku: 'atv', name: 'Apple TV', price: 109.5 },
  ];

  beforeEach(() => {
    catalog = new ProductCatalog(testProducts);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a total list of rules equal to catalog size plus promotions', () => {
    const promoRules: PricingRule[] = [
      new MockPromoRule('ipd'),
      new MockPromoRule('atv'),
    ];

    const finalRules = composePricingRules(catalog, promoRules);

    expect(finalRules).toHaveLength(5);
  });

  it('should always list RegularPricingRules before promotional rules', () => {
    const promoRule = new MockPromoRule('ipd');
    const finalRules = composePricingRules(catalog, [promoRule]);

    expect(finalRules[0]).toBeInstanceOf(RegularPricingRule);
    expect(finalRules[1]).toBeInstanceOf(RegularPricingRule);

    expect(finalRules[3]).toBe(promoRule);

    expect(finalRules.map((r) => r.sku)).toEqual(['ipd', 'mbp', 'atv', 'ipd']);
  });

  it('should create a RegularPricingRule for every SKU in the catalog', () => {
    const promoRules: PricingRule[] = [new MockPromoRule('ipd')];
    const finalRules = composePricingRules(catalog, promoRules);

    const regularRules = finalRules.filter(
      (r) => r instanceof RegularPricingRule,
    );

    expect(regularRules).toHaveLength(3);
    expect(regularRules.map((r) => r.sku)).toEqual(
      expect.arrayContaining(['ipd', 'mbp', 'atv']),
    );
  });

  it('should ignore promotional rules for SKUs not in the catalog and log a warning', () => {
    const unknownRule: PricingRule = new MockPromoRule('unknown_sku');
    const validRule: PricingRule = new MockPromoRule('ipd');

    const finalRules = composePricingRules(catalog, [unknownRule, validRule]);

    expect(finalRules).toHaveLength(4);

    expect(finalRules).not.toContain(unknownRule);

    expect(console.warn).toHaveBeenCalledWith(
      'Warning: Pricing rule assigned to unknown SKU: unknown_sku - Rule ignored.',
    );
  });
});
