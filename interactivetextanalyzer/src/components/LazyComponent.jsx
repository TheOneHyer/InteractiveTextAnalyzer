import { Suspense, useEffect, useState } from 'react'
import lazyLoader from '../utils/lazyLoader'

/**
 * LazyComponent - A wrapper component that uses the centralized lazy loader
 * Replaces React.lazy() with our queue-based system
 */
export function LazyComponent({ name, fallback, ...props }) {
  const [Component, setComponent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    // Try to get the component from the lazy loader
    lazyLoader.get(name)
      .then(module => {
        if (mounted) {
          // Handle both default exports and named exports
          const ComponentModule = module.default || module
          setComponent(() => ComponentModule)
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err)
          console.error(`Failed to load component: ${name}`, err)
        }
      })

    return () => {
      mounted = false
    }
  }, [name])

  if (error) {
    return <div className="error">Failed to load component: {name}</div>
  }

  if (!Component) {
    return fallback || <div className="skel block" />
  }

  return (
    <Suspense fallback={fallback || <div className="skel block" />}>
      <Component {...props} />
    </Suspense>
  )
}

/**
 * Helper to create lazy component wrappers for easier migration
 * @type {function}
 */
// eslint-disable-next-line react-refresh/only-export-components
export function createLazyComponent(name) {
  return (props) => <LazyComponent name={name} {...props} />
}

export default LazyComponent
