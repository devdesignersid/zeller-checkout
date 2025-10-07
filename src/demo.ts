/**
 * Demo/playground file for development
 * Run with: npm run dev
 */

import {
  BulkDiscountRule,
  BuyXGetYFreeRule,
  Checkout,
  Product,
  ProductCatalog,
  composePricingRules,
} from '.';

const products = [
  { sku: 'ipd', name: 'Super iPad', price: 549.99 },
  { sku: 'mbp', name: 'MacBook Pro', price: 1399.99 },
  { sku: 'atv', name: 'Apple TV', price: 109.5 },
  { sku: 'vga', name: 'VGA adapter', price: 30.0 },
];

const catalog = new ProductCatalog(products);

const pricingRules = composePricingRules(catalog, [
  new BuyXGetYFreeRule('atv', 3, 2, catalog), // Buy 3 Apple TVs, pay for 2
  new BulkDiscountRule('ipd', 4, 499.99, catalog), // If more than 4 iPads, price drops to $499.99 each
]);

const checkout = new Checkout(pricingRules, catalog);
checkout.scan('atv');
checkout.scan('atv');
checkout.scan('atv');
checkout.scan('vga');

console.log('Total price: $', checkout.total().toFixed(2)); // Expected: $249.00

checkout.clear();
