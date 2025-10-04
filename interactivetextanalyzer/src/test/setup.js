import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Mock canvas for d3-cloud and d3 components
beforeAll(() => {
  // Setup canvas mock globally
  if (!HTMLCanvasElement.prototype.getContext) {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillText: vi.fn(),
      measureText: vi.fn((text) => ({ width: text ? text.length * 10 : 0 })),
      save: vi.fn(),
      restore: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4)
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4)
      })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
    }))
  }

  // Mock HTMLCanvasElement.prototype properties
  Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
    get: function() { return this._width || 300 },
    set: function(val) { this._width = val }
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
    get: function() { return this._height || 150 },
    set: function(val) { this._height = val }
  })
})

// Cleanup after each test case
afterEach(() => {
  cleanup()
})
