import { useState, useEffect, useRef } from 'react'
import lazyLoader from './lazyLoader'

/**
 * React hook to use lazy loaded resources
 * @param {string} name - Resource identifier
 * @returns {Object} { resource, isLoaded, isLoading, error }
 */
export function useLazyResource(name) {
  const [resource, setResource] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    // Check if already loaded
    if (lazyLoader.isLoaded(name)) {
      const loadedResource = lazyLoader.loadedResources.get(name)
      setResource(loadedResource)
      setIsLoaded(true)
      return
    }

    // Check if currently loading
    if (lazyLoader.isLoading(name)) {
      setIsLoading(true)
    }

    // Subscribe to loading events
    const unsubscribe = lazyLoader.subscribe((loadedName, loadedResource) => {
      if (loadedName === name && isMounted.current) {
        setResource(loadedResource)
        setIsLoaded(true)
        setIsLoading(false)
      }
    })

    // Try to get the resource (will wait if loading or in queue)
    lazyLoader.get(name)
      .then(res => {
        if (isMounted.current) {
          setResource(res)
          setIsLoaded(true)
          setIsLoading(false)
        }
      })
      .catch(err => {
        if (isMounted.current) {
          setError(err)
          setIsLoading(false)
        }
      })

    return unsubscribe
  }, [name])

  return { resource, isLoaded, isLoading, error }
}

/**
 * Initialize lazy loading for the app
 * Should be called once when the app mounts
 */
export function initializeLazyLoading() {
  // Register React components
  lazyLoader.register('WordCloud', () => import('../components/WordCloud'), 1)
  lazyLoader.register('NetworkGraph', () => import('../components/NetworkGraph'), 2)
  lazyLoader.register('Heatmap', () => import('../components/Heatmap'), 3)
  lazyLoader.register('ScatterPlot', () => import('../components/ScatterPlot'), 4)
  lazyLoader.register('Wiki', () => import('../components/Wiki'), 5)
  lazyLoader.register('DependencyTreeVisualization', () => import('../components/DependencyTreeVisualization'), 6)
  
  // Register NLP library with lower priority (loads last)
  lazyLoader.register('compromise', async () => {
    const module = await import('compromise')
    return module.default || module
  }, 10)

  // Register Transformers.js with lowest priority (very large library)
  // Note: This is registered but not automatically loaded due to size
  // It will only load when explicitly requested
  lazyLoader.register('transformers', async () => {
    const module = await import('@huggingface/transformers')
    return module
  }, 20)

  // Start loading after a brief delay to not interfere with initial render
  lazyLoader.startAfterDelay(100)
}

export default lazyLoader
