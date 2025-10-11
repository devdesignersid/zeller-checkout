import { CartItem, PricingRule, Product } from '../../types';

import { Checkout } from '../Checkout';
import { ProductCatalog } from '../../catalog';
import { toCents } from '../../utils';

describe('Checkout', () => {
  let catalog: ProductCatalog;
  let mockRules: PricingRule[];

  const testProducts: Product[] = [
    { sku: 'ipd', name: 'Super iPad', price: toCents(549.99) },
    { sku: 'mbp', name: 'MacBook Pro', price: toCents(1399.99) },
    { sku: 'atv', name: 'Apple TV', price: toCents(109.5) },
    { sku: 'vga', name: 'VGA adapter', price: toCents(30.0) },
  ];

  beforeEach(() => {
    catalog = new ProductCatalog(testProducts);
    // Create a rule for each product that calculates price at catalog price
    mockRules = testProducts.map((product) => ({
      sku: product.sku,
      apply: jest.fn((items: CartItem[]) => {
        const item = items.find((i) => i.sku === product.sku);
        if (!item) return 0;
        return item.quantity * catalog.getPrice(product.sku);
      }),
    }));
  });

  describe('scan', () => {
    it('should add items to the cart', () => {
      const checkout = new Checkout(mockRules, catalog);
      checkout.scan('ipd');

      expect(checkout.total()).toBe(549.99);
    });

    it('should accumulate quantity when scanning the same item multiple times', () => {
      const checkout = new Checkout(mockRules, catalog);
      checkout.scan('atv');
      checkout.scan('atv');
      checkout.scan('atv');

      expect(checkout.total()).toBe(328.5);
    });

    it('should handle multiple different items', () => {
      const checkout = new Checkout(mockRules, catalog);
      checkout.scan('ipd');
      checkout.scan('mbp');
      checkout.scan('vga');

      expect(checkout.total()).toBe(1979.98);
    });

    it('should warn & ignore scanning of unknown SKU', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const checkout = new Checkout(mockRules, catalog);

      checkout.scan('unknown_sku');
      checkout.scan('ipd');

      expect(checkout.total()).toBe(549.99);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Warning: Attempted to scan unknown item: unknown_sku - Scan ignored.',
      );
      consoleSpy.mockRestore();
    });
  });

  describe('total', () => {
    it('should return 0 for an empty cart', () => {
      const checkout = new Checkout(mockRules, catalog);
      expect(checkout.total()).toBe(0);
    });

    it('should sum results from all independent pricing rules', () => {
      const rule1: PricingRule = {
        sku: 'ipd',
        apply: jest.fn((items: CartItem[]) => toCents(100)),
      };
      const rule2: PricingRule = {
        sku: 'mbp',
        apply: jest.fn((items: CartItem[]) => toCents(200)),
      };
      const rule3: PricingRule = {
        sku: 'atv',
        apply: jest.fn((items: CartItem[]) => toCents(50.5)),
      };

      const checkout = new Checkout([rule1, rule2, rule3], catalog);
      checkout.scan('ipd');

      expect(checkout.total()).toBe(350.5);
      expect(rule1.apply).toHaveBeenCalledWith([{ sku: 'ipd', quantity: 1 }]);
      expect(rule2.apply).toHaveBeenCalledWith([{ sku: 'ipd', quantity: 1 }]);
      expect(rule3.apply).toHaveBeenCalledWith([{ sku: 'ipd', quantity: 1 }]);
    });

    it('should pass all cart items to each pricing rule', () => {
      const spyRule: PricingRule = {
        sku: 'ipd',
        apply: jest.fn((items: CartItem[]) => {
          expect(items).toHaveLength(3);
          expect(items.find((item) => item.sku === 'ipd')?.quantity).toBe(2);
          expect(items.find((item) => item.sku === 'mbp')?.quantity).toBe(3);
          expect(items.find((item) => item.sku === 'atv')?.quantity).toBe(1);
          return 0;
        }),
      };

      const checkout = new Checkout([spyRule], catalog);
      checkout.scan('ipd');
      checkout.scan('ipd');
      checkout.scan('mbp');
      checkout.scan('mbp');
      checkout.scan('mbp');
      checkout.scan('atv');

      expect(checkout.total()).toBe(0);
      expect(spyRule.apply).toHaveBeenCalledTimes(1);
    });

    it('should round the total to 2 decimal places', () => {
      const preciseRule: PricingRule = {
        sku: 'ipd',
        apply: jest.fn((items: CartItem[]) => {
          return toCents(123.456789);
        }),
      };

      const checkout = new Checkout([preciseRule], catalog);
      checkout.scan('ipd');

      expect(checkout.total()).toBe(123.46);
    });

    it('should correctly sum base price and negative discount rules', () => {
      const baseRule: PricingRule = {
        sku: 'atv',
        apply: jest.fn((items) => {
          const item = items.find((i) => i.sku === 'atv');
          return item ? item.quantity * toCents(109.5) : 0;
        }),
      };

      const discountRule: PricingRule = {
        sku: 'atv',
        apply: jest.fn(() => toCents(-50.0)),
      };

      const otherRule: PricingRule = {
        sku: 'mbp',
        apply: jest.fn(() => 0),
      };

      // Base Rule MUST come before Discount Rule in the final rules array
      const checkout = new Checkout(
        [baseRule, discountRule, otherRule],
        catalog,
      );
      checkout.scan('atv');
      checkout.scan('atv');

      expect(checkout.total()).toBe(169.0);
      expect(baseRule.apply).toHaveBeenCalled();
      expect(discountRule.apply).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should remove all items from the cart', () => {
      const checkout = new Checkout(mockRules, catalog);
      checkout.scan('ipd');
      checkout.scan('mbp');
      checkout.scan('vga');

      expect(checkout.total()).toBeGreaterThan(0);
      checkout.clear();
      expect(checkout.total()).toBe(0);
    });

    it('should allow scanning new items after clearing the cart', () => {
      const checkout = new Checkout(mockRules, catalog);
      checkout.scan('atv');
      checkout.clear();
      checkout.scan('vga');
      expect(checkout.total()).toBe(30.0);
    });
  });
});
