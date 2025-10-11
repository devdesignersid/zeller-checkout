/**
 * Helper function to convert dollars (float) to cents (integer)
 *
 * Floating point numbers are not ideal for storing prices because they can introduce rounding errors.
 * For example, the result of 0.1 + 0.2
 * in floating point arithmetic is not exactly 0.3,
 * but rather a very close approximation such as 0.300000000000004.
 * This can lead to unexpected behavior when performing calculations on prices.
 * Storing prices in the smallest unit possible, such as cents, eliminates this problem.
 * By using integers to represent prices, we can ensure precise calculations and avoid rounding errors.
 * This is especially important in financial calculations where accuracy is paramount.
 *
 * @param priceInDollars Price in dollars
 * @returns Price in cents
 */
export const toCents = (priceInDollars: number) => {
  return Math.round(priceInDollars * 100);
};
