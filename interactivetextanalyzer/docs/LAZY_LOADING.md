# Centralized Lazy Loading System

## Overview

The Interactive Text Analyzer now uses a centralized lazy loading system that queues and loads heavy resources one at a time after the initial page load. This provides a faster initial load experience while ensuring resources are likely available before users need them.

## Key Features

- **Queue-based loading**: Resources are loaded sequentially to prevent resource contention
- **Priority-based**: Resources can be assigned priorities to control load order
- **Automatic initialization**: System starts loading after initial page render (100ms delay)
- **Easily extensible**: New resources can be registered with a simple API
- **React integration**: Seamless integration with React components via hooks and wrappers

## Architecture

### Core Components

1. **LazyLoader** (`/src/utils/lazyLoader.js`)
   - Singleton class that manages the queue
   - Loads resources one at a time
   - Tracks loading state
   - Notifies listeners when resources are loaded

2. **useLazyLoader** (`/src/utils/useLazyLoader.js`)
   - React hook for accessing lazy-loaded resources
   - Initialization function that registers all resources
   - Called once on app mount

3. **LazyComponent** (`/src/components/LazyComponent.jsx`)
   - Wrapper component for lazy-loaded React components
   - Replaces React.lazy() with queue-based system
   - Handles loading states and errors

## How It Works

### 1. Registration Phase

On app mount, resources are registered with priorities:

```javascript
lazyLoader.register('WordCloud', () => import('../components/WordCloud'), 1)
lazyLoader.register('NetworkGraph', () => import('../components/NetworkGraph'), 2)
lazyLoader.register('Heatmap', () => import('../components/Heatmap'), 3)
lazyLoader.register('Wiki', () => import('../components/Wiki'), 4)
lazyLoader.register('compromise', async () => {
  const module = await import('compromise')
  return module.default || module
}, 10)
```

Lower priority numbers load first. The compromise NLP library has the lowest priority (10) since it's only needed for NER analysis.

### 2. Loading Phase

After a 100ms delay (to allow initial page render), the loader starts processing the queue:

```javascript
lazyLoader.startAfterDelay(100)
```

Resources are loaded one at a time in priority order. This prevents overwhelming the user's system and provides a smooth experience.

### 3. Usage Phase

Components use the `createLazyComponent` wrapper:

```javascript
const WordCloud = createLazyComponent('WordCloud')

// Later in render:
<WordCloud data={wordCloudData} />
```

The LazyComponent wrapper automatically:
- Checks if the resource is already loaded
- Shows a loading skeleton while waiting
- Renders the component when ready
- Handles errors gracefully

## Adding New Lazy-Loaded Resources

To add a new resource to the lazy loading system:

1. Register it in `initializeLazyLoading()` in `/src/utils/useLazyLoader.js`:

```javascript
lazyLoader.register('MyNewComponent', () => import('../components/MyNewComponent'), 5)
```

2. Create a wrapper in your component file:

```javascript
const MyNewComponent = createLazyComponent('MyNewComponent')
```

3. Use it in your JSX like any other component:

```javascript
<MyNewComponent prop1={value1} prop2={value2} />
```

## API Reference

### LazyLoader Methods

- `register(name, loader, priority)` - Register a resource to be lazy loaded
- `get(name)` - Get a resource (waits if still loading)
- `isLoaded(name)` - Check if a resource is loaded
- `isLoading(name)` - Check if a resource is currently loading
- `subscribe(callback)` - Subscribe to loading events
- `getState()` - Get current state for debugging

### useLazyLoader Hook

```javascript
const { resource, isLoaded, isLoading, error } = useLazyResource('ResourceName')
```

## Benefits

1. **Faster initial load**: Page becomes interactive immediately
2. **No resource contention**: Resources load one at a time
3. **Ready before needed**: Resources likely loaded before user needs them
4. **Scalable**: Easy to add new resources
5. **Maintainable**: Centralized system instead of scattered lazy loading

## Testing

The lazy loading system includes comprehensive tests in `/src/test/lazyLoader.test.js`:

- Registration and priority ordering
- Queue processing
- Error handling
- State management
- Subscription/notification system

Run tests with:
```bash
npm run test
```

## Performance Impact

- **Initial load**: Slightly faster (no upfront loading of heavy components)
- **Time to interactive**: Significantly faster (main app loads first)
- **Resource availability**: Resources typically loaded within seconds of page load
- **Memory usage**: Same as before (all resources eventually loaded)
- **Network usage**: Same as before (same resources loaded, just queued)
