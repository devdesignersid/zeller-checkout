# Zeller Checkout System 🛒

A flexible, extensible checkout system built in TypeScript that supports configurable pricing rules for promotional campaigns. Designed with clean architecture principles to accommodate frequent pricing changes without modifying core business logic.

## Overview

A checkout system that can handle dynamic promotional pricing. The system manages a catalog of products (iPads, MacBooks, Apple TVs, and accessories) and applies flexible pricing rules such as "3-for-2" deals and bulk discounts.

This implementation uses TypeScript with a Strategy Pattern approach, where pricing rules are composable, testable units. The system is built without frameworks, focusing on clarity and maintainability, with comprehensive unit tests ensuring correctness.

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd zeller-checkout

# Install dependencies
npm install

# Run tests
npm test

# Run demo
npm run dev
```

### How It Works

The system consists of three core components:

- `Checkout` – Manages the shopping cart and orchestrates pricing calculation
- `PricingRule` – Interface that all pricing rules implement (Strategy Pattern)
- `composePricingRules()` – Factory function that sets the price floor and ensures complete price coverage.

### Architecture: Additive Pricing Model

The system uses an additive pricing model where:

- Every item receives base catalog pricing via `RegularPricingRule`.
- **Promotional rules** apply negative adjustments (discounts)
- The **total** is the sum of all rule results

```typescript
// Example: 3 Apple TVs with 3-for-2 promotion
RegularPricingRule('atv') → +$328.50  // Base price
BuyXGetYFreeRule('atv')   → -$109.50  // Discount
Total                     →  $219.00
```

This design allows **multiple promotions to stack** on the same item and guarantees that no product goes unpriced.

### Adding New Rules

Implement the PricingRule interface:

```typescript
export interface PricingRule {
  sku: string;
  apply(items: CartItem[]): number;
}
```

Then add it via the composer:

```typescript
const rules = composePricingRules(catalog, [
  new BuyXGetYFreeRule('atv', 3, 2, catalog),
  new YourNewRule('sku', params, catalog), // ✅ No core changes needed
]);
```

### Pricing Rules

| SKU | Name        | Price    | Active Promotion                            |
| --- | ----------- | -------- | ------------------------------------------- |
| ipd | Super iPad  | $549.99  | Bulk discount: $499.99 each when buying > 4 |
| mbp | MacBook Pro | $1399.99 | None                                        |
| atv | Apple TV    | $109.50  | 3-for-2 deal                                |
| vga | VGA adapter | $30.00   | None                                        |

### Example Usage

```typescript
import {
  Checkout,
  ProductCatalog,
  composePricingRules,
  BuyXGetYFreeRule,
  BulkDiscountRule,
} from './src';

// Setup catalog
const catalog = new ProductCatalog([
  { sku: 'ipd', name: 'Super iPad', price: 549.99 },
  { sku: 'mbp', name: 'MacBook Pro', price: 1399.99 },
  { sku: 'atv', name: 'Apple TV', price: 109.5 },
  { sku: 'vga', name: 'VGA adapter', price: 30.0 },
]);

// Configure pricing rules
const pricingRules = composePricingRules(catalog, [
  new BuyXGetYFreeRule('atv', 3, 2, catalog),
  new BulkDiscountRule('ipd', 4, 499.99, catalog),
]);

// Create checkout and scan items
const co = new Checkout(pricingRules, catalog);
co.scan('atv');
co.scan('atv');
co.scan('atv');
co.scan('vga');

console.log(co.total()); // Output: 249.00
```

### Testing

The test suite covers:

- Unit tests for each pricing rule (boundary conditions, edge cases)
- Integration tests for the `Checkout` class (multi-rule scenarios)
- Edge cases: empty carts, unknown SKUs, threshold boundaries

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Generate coverage report
```

Coverage targets: 80%+ lines, branches, and functions.

### Design Rationale

- **Extensibility** – New pricing rules are added by implementing a single interface without touching core `Checkout` logic (Open/Closed Principle).
- **Guaranteed Coverage** – The `composePricingRules()` factory ensures every product in the catalog has base pricing, preventing silent $0 totals.
- **Testability** – Each rule is independently testable. Discount rules return negative values, making audit trails transparent and debugging straightforward.

### Future Enhancements

- **Rule Priority System** – Handle overlapping promotions with explicit precedence
- **Customer Context** – Support customer-specific pricing (VIP discounts, loyalty programs)
- **Configuration-Driven Rules** – Load pricing rules from JSON/YAML for non-developers to manage promotions
- **Receipt Breakdown** – Add `getPriceBreakdown()` method to show itemized base prices and discounts

### Quick Summary

- **Core Principle**: Additive pricing model (base price + discount adjustments) ensures transparent calculations and stackable promotions.
- **Key Extensibility Choice**: Strategy Pattern with rule composition guarantees all products are priced while allowing unlimited promotional rules.
- **Testing Strategy**: Isolated unit tests for each rule plus integration tests for real-world checkout scenarios, achieving 80%+ coverage.
