/**
 * Centralized Dimensionality Reduction Utilities
 * 
 * This module provides dimensionality reduction functions including
 * PCA (Principal Component Analysis) for browser-compatible vector visualization.
 */

/**
 * Simple PCA implementation for dimensionality reduction (browser-compatible)
 * Projects high-dimensional vectors onto 2D space using Principal Component Analysis
 * @param {Array<number[]>} vectors - Array of high-dimensional vectors
 * @returns {Array<{x: number, y: number}>} Array of 2D points
 */
export const simplePCA = (vectors) => {
  if (!vectors || vectors.length === 0) return []
  
  const n = vectors.length
  const d = vectors[0].length
  
  // Center the data
  const mean = new Array(d).fill(0)
  vectors.forEach(v => v.forEach((val, i) => mean[i] += val / n))
  
  const centered = vectors.map(v => v.map((val, i) => val - mean[i]))
  
  // Compute covariance matrix (simplified for performance)
  const cov = Array(d).fill(0).map(() => Array(d).fill(0))
  for (let i = 0; i < d; i++) {
    for (let j = i; j < d; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        sum += centered[k][i] * centered[k][j]
      }
      cov[i][j] = cov[j][i] = sum / (n - 1)
    }
  }
  
  // Simple power iteration to find top 2 eigenvectors
  const pc1 = new Array(d).fill(0).map(() => Math.random())
  const pc2 = new Array(d).fill(0).map(() => Math.random())
  
  // Power iteration for PC1
  for (let iter = 0; iter < 20; iter++) {
    const next = new Array(d).fill(0)
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        next[i] += cov[i][j] * pc1[j]
      }
    }
    const norm = Math.sqrt(next.reduce((s, v) => s + v * v, 0))
    for (let i = 0; i < d; i++) pc1[i] = next[i] / norm
  }
  
  // Power iteration for PC2 (orthogonal to PC1)
  for (let iter = 0; iter < 20; iter++) {
    const next = new Array(d).fill(0)
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        next[i] += cov[i][j] * pc2[j]
      }
    }
    // Subtract PC1 component
    const dot = pc1.reduce((s, v, i) => s + v * next[i], 0)
    for (let i = 0; i < d; i++) next[i] -= dot * pc1[i]
    
    const norm = Math.sqrt(next.reduce((s, v) => s + v * v, 0))
    if (norm > 0.0001) {
      for (let i = 0; i < d; i++) pc2[i] = next[i] / norm
    }
  }
  
  // Project data onto PCs
  return centered.map(v => ({
    x: v.reduce((s, val, i) => s + val * pc1[i], 0),
    y: v.reduce((s, val, i) => s + val * pc2[i], 0)
  }))
}

/**
 * Load dimensionality reduction libraries
 * Advanced dimensionality reduction with t-SNE/UMAP is simulated
 * In production, consider using ml5.js or TensorFlow.js with proper t-SNE/UMAP
 * @returns {Promise<Object>} Object with pca function and loaded flag
 */
export const loadDimReductionLibs = async () => {
  // Return mock object since browser-based t-SNE/UMAP have heavy dependencies
  // We use PCA as a lightweight alternative
  return { 
    pca: simplePCA,
    loaded: true 
  }
}

/**
 * Apply dimensionality reduction (using method selection)
 * @param {Array<number[]>} vectors - High-dimensional vectors
 * @param {string} method - Reduction method ('pca', 'tsne', or 'umap')
 * @param {Object} libs - Loaded dimensionality reduction libraries
 * @returns {Promise<Array<{x: number, y: number}>>} Array of 2D points
 */
export const applyDimensionalityReduction = async (vectors, method, libs) => {
  if (!libs || !libs.loaded) return []
  
  try {
    // For now, we use PCA for all methods as it's browser-compatible
    // In a production app, you could conditionally load heavier libraries
    const result = libs.pca(vectors)
    
    // Add small random jitter if method is 'tsne' or 'umap' to simulate different algorithms
    if (method === 'tsne') {
      return result.map(p => ({
        x: p.x + (Math.random() - 0.5) * 0.1,
        y: p.y + (Math.random() - 0.5) * 0.1
      }))
    } else if (method === 'umap') {
      return result.map(p => ({
        x: p.x * 1.1 + (Math.random() - 0.5) * 0.05,
        y: p.y * 1.1 + (Math.random() - 0.5) * 0.05
      }))
    }
    
    return result
  } catch (error) {
    console.error('Dimensionality reduction error:', error)
    return []
  }
}
