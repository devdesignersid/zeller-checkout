import { CartItem, Product } from '../../types';

import { ProductCatalog } from '../../catalog';
import { RegularPricingRule } from '../regular-pricing.rule';

describe('RegularPricingRule', () => {
  let catalog: ProductCatalog;
  let rule: RegularPricingRule;

  const testProducts: Product[] = [
    { sku: 'ipd', name: 'Super iPad', price: 549.99 },
    { sku: 'mbp', name: 'MacBook Pro', price: 1399.99 },
    { sku: 'atv', name: 'Apple TV', price: 109.5 },
    { sku: 'vga', name: 'VGA adapter', price: 30.0 },
  ];

  beforeEach(() => {
    catalog = new ProductCatalog(testProducts);
    rule = new RegularPricingRule('ipd', catalog);
  });

  describe('constructor', () => {
    it('should initialize with valid SKU', () => {
      expect(rule.sku).toBe('ipd');
    });
  });

  describe('apply', () => {
    it('should return 0 when its target SKU is missing from the items array', () => {
      const items: CartItem[] = [{ sku: 'atv', quantity: 2 }];
      expect(rule.apply(items)).toBe(0);
    });

    it('should return 0 when cart is empty or quantity is 0', () => {
      expect(rule.apply([])).toBe(0);
      expect(rule.apply([{ sku: 'ipd', quantity: 0 }])).toBe(0);
    });

    it('should calculate price for a single item (core logic)', () => {
      const items: CartItem[] = [{ sku: 'ipd', quantity: 1 }];
      expect(rule.apply(items)).toBe(549.99);
    });

    it('should calculate total price for multiple items and handle fractional prices', () => {
      const atvRule = new RegularPricingRule('atv', catalog);
      const items: CartItem[] = [{ sku: 'atv', quantity: 5 }];
      expect(atvRule.apply(items)).toBe(547.5);
    });

    it('should only price items matching the rule SKU, ignoring others in the cart', () => {
      const items: CartItem[] = [
        { sku: 'ipd', quantity: 2 }, // Target item (549.99 * 2 = 1099.98)
        { sku: 'atv', quantity: 3 }, // Ignored
      ];
      expect(rule.apply(items)).toBe(1099.98);
    });

    it('should return 0 for case-mismatching SKU (SKUs are case-sensitive)', () => {
      const items: CartItem[] = [{ sku: 'IPD', quantity: 1 }];
      expect(rule.apply(items)).toBe(0);
    });

    it('should throw an error if the SKU is missing from the catalog', () => {
      const invalidRule = new RegularPricingRule('unknown', catalog);
      const items: CartItem[] = [{ sku: 'unknown', quantity: 1 }];

      expect(() => invalidRule.apply(items)).toThrow();
    });
  });
});
