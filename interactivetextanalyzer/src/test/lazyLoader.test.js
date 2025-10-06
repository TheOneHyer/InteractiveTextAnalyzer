import { describe, it, expect, beforeEach, vi } from 'vitest'
import lazyLoader from '../utils/lazyLoader'

describe('LazyLoader', () => {
  beforeEach(() => {
    // Reset the loader between tests
    lazyLoader.queue = []
    lazyLoader.loadedResources.clear()
    lazyLoader.loadingPromises.clear()
    lazyLoader.isProcessing = false
    lazyLoader.listeners.clear()
  })

  describe('register', () => {
    it('should register a resource', () => {
      const loader = vi.fn(() => Promise.resolve('test-resource'))
      lazyLoader.register('test', loader, 5)
      
      expect(lazyLoader.queue).toHaveLength(1)
      expect(lazyLoader.queue[0].name).toBe('test')
      expect(lazyLoader.queue[0].priority).toBe(5)
    })

    it('should sort resources by priority', () => {
      lazyLoader.register('low-priority', () => Promise.resolve('low'), 10)
      lazyLoader.register('high-priority', () => Promise.resolve('high'), 1)
      lazyLoader.register('medium-priority', () => Promise.resolve('medium'), 5)
      
      expect(lazyLoader.queue[0].name).toBe('high-priority')
      expect(lazyLoader.queue[1].name).toBe('medium-priority')
      expect(lazyLoader.queue[2].name).toBe('low-priority')
    })

    it('should not register a resource twice', async () => {
      const loader = vi.fn(() => Promise.resolve('test-resource'))
      lazyLoader.register('test', loader, 5)
      await lazyLoader.processQueue()
      
      // Try to register again
      lazyLoader.register('test', loader, 5)
      expect(lazyLoader.queue).toHaveLength(0)
    })
  })

  describe('processQueue', () => {
    it('should load resources in order', async () => {
      const resources = []
      lazyLoader.register('first', () => {
        resources.push('first')
        return Promise.resolve('first-resource')
      }, 1)
      lazyLoader.register('second', () => {
        resources.push('second')
        return Promise.resolve('second-resource')
      }, 2)
      
      await lazyLoader.processQueue()
      
      expect(resources).toEqual(['first', 'second'])
      expect(lazyLoader.isLoaded('first')).toBe(true)
      expect(lazyLoader.isLoaded('second')).toBe(true)
    })

    it('should handle loading errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      lazyLoader.register('error-resource', () => Promise.reject(new Error('Load failed')), 1)
      lazyLoader.register('success-resource', () => Promise.resolve('success'), 2)
      
      await lazyLoader.processQueue()
      
      expect(lazyLoader.isLoaded('error-resource')).toBe(false)
      expect(lazyLoader.isLoaded('success-resource')).toBe(true)
      expect(consoleError).toHaveBeenCalled()
      
      consoleError.mockRestore()
    })
  })

  describe('get', () => {
    it('should return loaded resource immediately', async () => {
      lazyLoader.loadedResources.set('test', 'test-resource')
      const resource = await lazyLoader.get('test')
      expect(resource).toBe('test-resource')
    })

    it('should wait for resource to load', async () => {
      lazyLoader.register('test', () => Promise.resolve('test-resource'), 1)
      const promise = lazyLoader.get('test')
      await lazyLoader.processQueue()
      const resource = await promise
      expect(resource).toBe('test-resource')
    })

    it('should throw error for unregistered resource', async () => {
      await expect(lazyLoader.get('non-existent')).rejects.toThrow('Resource not registered: non-existent')
    })
  })

  describe('isLoaded', () => {
    it('should return true for loaded resources', () => {
      lazyLoader.loadedResources.set('test', 'test-resource')
      expect(lazyLoader.isLoaded('test')).toBe(true)
    })

    it('should return false for non-loaded resources', () => {
      expect(lazyLoader.isLoaded('test')).toBe(false)
    })
  })

  describe('isLoading', () => {
    it('should return true for loading resources', () => {
      lazyLoader.loadingPromises.set('test', Promise.resolve('test-resource'))
      expect(lazyLoader.isLoading('test')).toBe(true)
    })

    it('should return false for non-loading resources', () => {
      expect(lazyLoader.isLoading('test')).toBe(false)
    })
  })

  describe('subscribe', () => {
    it('should notify listeners when resource is loaded', async () => {
      const listener = vi.fn()
      lazyLoader.subscribe(listener)
      
      lazyLoader.register('test', () => Promise.resolve('test-resource'), 1)
      await lazyLoader.processQueue()
      
      expect(listener).toHaveBeenCalledWith('test', 'test-resource')
    })

    it('should allow unsubscribing', async () => {
      const listener = vi.fn()
      const unsubscribe = lazyLoader.subscribe(listener)
      unsubscribe()
      
      lazyLoader.register('test', () => Promise.resolve('test-resource'), 1)
      await lazyLoader.processQueue()
      
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('getState', () => {
    it('should return current state', () => {
      lazyLoader.register('test1', () => Promise.resolve('test1'), 1)
      lazyLoader.loadedResources.set('test2', 'test2-resource')
      
      const state = lazyLoader.getState()
      
      expect(state.queueLength).toBe(1)
      expect(state.loadedCount).toBe(1)
      expect(state.queueItems).toContain('test1')
      expect(state.loadedItems).toContain('test2')
    })
  })

  describe('startAfterDelay', () => {
    it('should start processing after delay', async () => {
      lazyLoader.register('test', () => Promise.resolve('test-resource'), 1)
      
      // Start with delay
      lazyLoader.startAfterDelay(10)
      
      // Should not be loaded immediately
      expect(lazyLoader.isLoaded('test')).toBe(false)
      
      // Wait for delay and processing
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Should be loaded after delay
      expect(lazyLoader.isLoaded('test')).toBe(true)
    })
  })
})
