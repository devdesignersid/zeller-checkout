import { CartItem, Product } from '../../types';

import { BulkDiscountRule } from '../bulk-discount.rule';
import { ProductCatalog } from '../../catalog';

describe('BulkDiscountRule', () => {
  let catalog: ProductCatalog;
  let rule: BulkDiscountRule;

  const testProducts: Product[] = [
    { sku: 'ipd', name: 'Super iPad', price: 549.99 },
    { sku: 'atv', name: 'Apple TV', price: 109.5 },
  ];

  // Rule configuration: Buy 4 or more, price drops to 499.99
  const THRESHOLD = 4;
  const DISCOUNTED_PRICE = 499.99;

  beforeEach(() => {
    catalog = new ProductCatalog(testProducts);
    rule = new BulkDiscountRule('ipd', THRESHOLD, DISCOUNTED_PRICE, catalog);
  });

  describe('constructor', () => {
    it('should initialize with valid SKU', () => {
      expect(rule.sku).toBe('ipd');
    });
  });

  describe('apply', () => {
    it('should return 0 when target item is absent or quantity is zero', () => {
      expect(rule.apply([{ sku: 'atv', quantity: 2 }])).toBe(0); // Wrong SKU
      expect(rule.apply([])).toBe(0); // Empty cart
      expect(rule.apply([{ sku: 'ipd', quantity: 0 }])).toBe(0); // Zero quantity
    });

    it('should return 0 when the quantity is BELOW the threshold', () => {
      const items: CartItem[] = [{ sku: 'ipd', quantity: THRESHOLD - 1 }];
      expect(rule.apply(items)).toBe(0);
    });

    it('should apply the discount and handle fractional prices correctly', () => {
      const atvRule = new BulkDiscountRule('atv', 5, 100.0, catalog);
      const items: CartItem[] = [{ sku: 'atv', quantity: 7 }];
      expect(atvRule.apply(items)).toBe(-66.5);
    });

    it('should NOT apply discount when quantity equals threshold', () => {
      const rule = new BulkDiscountRule('ipd', 4, 499.99, catalog);
      const items = [{ sku: 'ipd', quantity: 4 }];

      expect(rule.apply(items)).toBe(0);
    });

    it('should throw an error if the SKU is missing from the catalog', () => {
      const invalidRule = new BulkDiscountRule(
        'unknown',
        THRESHOLD,
        DISCOUNTED_PRICE,
        catalog,
      );
      const items: CartItem[] = [{ sku: 'unknown', quantity: THRESHOLD }];

      expect(() => invalidRule.apply(items)).toThrow();
    });
  });
});
