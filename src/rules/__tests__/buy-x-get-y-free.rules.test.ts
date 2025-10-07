import { CartItem, Product } from '../../types';

import { BuyXGetYFreeRule } from '../buy-x-get-y-free.rule';
import { ProductCatalog } from '../../catalog';

describe('BuyXGetYFreeRule', () => {
  let catalog: ProductCatalog;
  let rule: BuyXGetYFreeRule;

  // Rule configuration: Buy 3, Pay 2
  const SET_QTY = 3;
  const PAY_QTY = 2;
  const FREE_ITEMS = SET_QTY - PAY_QTY;

  const testProducts: Product[] = [
    { sku: 'atv', name: 'Apple TV', price: 109.5 },
  ];
  const UNIT_PRICE = testProducts[0].price;

  beforeEach(() => {
    catalog = new ProductCatalog(testProducts);
    rule = new BuyXGetYFreeRule('atv', SET_QTY, PAY_QTY, catalog);
  });

  describe('constructor', () => {
    it('should initialize with correct SKU and parameters', () => {
      expect(rule.sku).toBe('atv');
    });

    it('should throw an error if setQuantity is less than or equal to payQuantity', () => {
      expect(() => new BuyXGetYFreeRule('atv', 2, 3, catalog)).toThrow(
        'setQuantity must be greater than payQuantity',
      );
      expect(() => new BuyXGetYFreeRule('atv', 3, 3, catalog)).toThrow(
        'setQuantity must be greater than payQuantity',
      );
    });
  });

  describe('apply', () => {
    it('should return 0 when target item is absent or quantity is insufficient', () => {
      expect(rule.apply([{ sku: 'ipd', quantity: 3 }]) === 0).toBeTruthy(); // Wrong SKU
      expect(rule.apply([]) === 0).toBeTruthy(); // Empty cart
      expect(rule.apply([{ sku: 'atv', quantity: 0 }]) === 0).toBeTruthy(); // Zero quantity
    });

    it('should return 0 when the quantity is BELOW the set quantity', () => {
      const items: CartItem[] = [{ sku: 'atv', quantity: SET_QTY - 1 }];
      expect(rule.apply(items) === 0).toBeTruthy();
    });

    it('should apply the discount for EXACTLY one complete set', () => {
      const items: CartItem[] = [{ sku: 'atv', quantity: SET_QTY }];
      expect(rule.apply(items)).toBeCloseTo(-(1 * FREE_ITEMS * UNIT_PRICE), 2);
    });

    it('should only count free items based on complete sets, ignoring the remainder', () => {
      const items: CartItem[] = [{ sku: 'atv', quantity: SET_QTY + 1 }];
      expect(rule.apply(items)).toBeCloseTo(-(1 * FREE_ITEMS * UNIT_PRICE), 2);
    });

    it('should apply the discount correctly for multiple complete sets', () => {
      const items: CartItem[] = [{ sku: 'atv', quantity: SET_QTY * 2 }];
      expect(rule.apply(items)).toBeCloseTo(-(2 * FREE_ITEMS * UNIT_PRICE), 2);
    });

    it('should calculate multiple sets with a large remainder correctly', () => {
      const items: CartItem[] = [{ sku: 'atv', quantity: 8 }];
      expect(rule.apply(items)).toBeCloseTo(-(2 * FREE_ITEMS * UNIT_PRICE), 2);
    });

    it('should throw an error if the SKU is missing from the catalog', () => {
      const invalidRule = new BuyXGetYFreeRule(
        'unknown',
        SET_QTY,
        PAY_QTY,
        catalog,
      );
      const items: CartItem[] = [{ sku: 'unknown', quantity: SET_QTY }];

      expect(() => invalidRule.apply(items)).toThrow();
    });
  });
});
