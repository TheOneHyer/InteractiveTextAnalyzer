/**
 * Centralized Statistical Utilities
 * 
 * This module provides statistical functions used across the application
 * including basic statistics (mean, standard deviation) and hypothesis testing.
 */

/**
 * Calculate the mean (average) of an array of numbers
 * @param {number[]} arr - Array of numbers
 * @returns {number} The mean value
 */
export function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/**
 * Calculate the standard deviation of an array of numbers
 * @param {number[]} arr - Array of numbers
 * @returns {number} The standard deviation
 */
export function stdDev(arr) {
  const avg = mean(arr)
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2))
  return Math.sqrt(mean(squareDiffs))
}

/**
 * Error function approximation (Abramowitz and Stegun)
 * Used in normal distribution calculations
 * @param {number} x - Input value
 * @returns {number} Error function value
 */
export function erf(x) {
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)
  
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  
  return sign * y
}

/**
 * Cumulative distribution function for standard normal distribution
 * @param {number} z - Z-score value
 * @returns {number} Probability value
 */
export function normalCDF(z) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)))
}

/**
 * Perform Welch's t-test for comparing two samples with potentially unequal variances
 * @param {number[]} arr1 - First sample array
 * @param {number[]} arr2 - Second sample array
 * @returns {Object} Object containing t-statistic, degrees of freedom, and p-value
 */
export function welchTTest(arr1, arr2) {
  const mean1 = mean(arr1)
  const mean2 = mean(arr2)
  const var1 = Math.pow(stdDev(arr1), 2)
  const var2 = Math.pow(stdDev(arr2), 2)
  const n1 = arr1.length
  const n2 = arr2.length
  
  const tStatistic = (mean1 - mean2) / Math.sqrt(var1 / n1 + var2 / n2)
  
  // Degrees of freedom (Welch-Satterthwaite equation)
  const df = Math.pow(var1 / n1 + var2 / n2, 2) /
    (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1))
  
  // Approximate p-value using t-distribution (simplified)
  // For df > 30, t-distribution approximates normal distribution
  const pValue = 2 * (1 - normalCDF(Math.abs(tStatistic)))
  
  return { tStatistic, df, pValue }
}
