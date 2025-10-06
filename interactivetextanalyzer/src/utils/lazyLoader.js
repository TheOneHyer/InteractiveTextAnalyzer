/**
 * LazyLoader - A centralized system for queued lazy loading of resources
 * 
 * Features:
 * - Loads resources one at a time to prevent resource contention
 * - Starts loading queue after initial page load
 * - Allows registration of new resources dynamically
 * - Tracks loading state and provides access to loaded resources
 */

class LazyLoader {
  constructor() {
    this.queue = []
    this.loadedResources = new Map()
    this.loadingPromises = new Map()
    this.isProcessing = false
    this.listeners = new Set()
  }

  /**
   * Register a resource to be lazy loaded
   * @param {string} name - Unique identifier for the resource
   * @param {Function} loader - Function that returns a Promise resolving to the resource
   * @param {number} priority - Lower numbers load first (default: 10)
   */
  register(name, loader, priority = 10) {
    if (this.loadedResources.has(name) || this.loadingPromises.has(name)) {
      return // Already loaded or loading
    }

    // Check if already in queue
    if (this.queue.find(item => item.name === name)) {
      return // Already queued
    }

    this.queue.push({ name, loader, priority })
    // Sort by priority (lower numbers first)
    this.queue.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Process the queue of resources to load
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.queue.length > 0) {
      const { name, loader } = this.queue.shift()
      
      try {
        const loadingPromise = loader()
        this.loadingPromises.set(name, loadingPromise)
        
        const resource = await loadingPromise
        this.loadedResources.set(name, resource)
        this.loadingPromises.delete(name)
        
        // Notify listeners
        this.notifyListeners(name, resource)
      } catch (error) {
        console.error(`Failed to load resource: ${name}`, error)
        this.loadingPromises.delete(name)
      }
    }

    this.isProcessing = false
  }

  /**
   * Get a loaded resource or wait for it to load
   * @param {string} name - Resource identifier
   * @returns {Promise} Promise resolving to the resource
   */
  async get(name) {
    // If already loaded, return immediately
    if (this.loadedResources.has(name)) {
      return this.loadedResources.get(name)
    }

    // If currently loading, wait for it
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)
    }

    // If in queue, wait for it to be processed
    const queueItem = this.queue.find(item => item.name === name)
    if (queueItem) {
      return new Promise((resolve, reject) => {
        const listener = (loadedName, resource) => {
          if (loadedName === name) {
            this.listeners.delete(listener)
            resolve(resource)
          }
        }
        this.listeners.add(listener)
      })
    }

    // Resource not registered
    throw new Error(`Resource not registered: ${name}`)
  }

  /**
   * Check if a resource is loaded
   * @param {string} name - Resource identifier
   * @returns {boolean}
   */
  isLoaded(name) {
    return this.loadedResources.has(name)
  }

  /**
   * Check if a resource is loading
   * @param {string} name - Resource identifier
   * @returns {boolean}
   */
  isLoading(name) {
    return this.loadingPromises.has(name)
  }

  /**
   * Subscribe to loading events
   * @param {Function} callback - Called when a resource is loaded (name, resource)
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Notify all listeners
   */
  notifyListeners(name, resource) {
    this.listeners.forEach(listener => {
      try {
        listener(name, resource)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })
  }

  /**
   * Start loading queue after a delay (to not interfere with initial page load)
   * @param {number} delay - Delay in milliseconds (default: 100)
   */
  startAfterDelay(delay = 100) {
    setTimeout(() => {
      this.processQueue()
    }, delay)
  }

  /**
   * Get current state for debugging
   */
  getState() {
    return {
      queueLength: this.queue.length,
      loadedCount: this.loadedResources.size,
      loadingCount: this.loadingPromises.size,
      isProcessing: this.isProcessing,
      queueItems: this.queue.map(item => item.name),
      loadedItems: Array.from(this.loadedResources.keys()),
      loadingItems: Array.from(this.loadingPromises.keys())
    }
  }
}

// Create singleton instance
const lazyLoader = new LazyLoader()

export default lazyLoader
