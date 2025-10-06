/**
 * Data versioning system for managing undo/redo of data changes
 */

export class DataVersionManager {
  constructor() {
    this.originalData = null
    this.history = []
    this.actionDescriptions = [] // Track action descriptions for each version
    this.currentIndex = -1
    this.maxHistorySize = 50
  }

  /**
   * Initialize with original data
   */
  initialize(data) {
    this.originalData = JSON.parse(JSON.stringify(data))
    this.history = [JSON.parse(JSON.stringify(data))]
    this.actionDescriptions = ['Initial data load']
    this.currentIndex = 0
  }

  /**
   * Get current data state
   */
  getCurrent() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return JSON.parse(JSON.stringify(this.history[this.currentIndex]))
    }
    return null
  }

  /**
   * Get original data
   */
  getOriginal() {
    return this.originalData ? JSON.parse(JSON.stringify(this.originalData)) : null
  }

  /**
   * Push a new version to history with action description
   */
  pushVersion(data, actionDescription = 'Data modified') {
    // Remove any redo history when pushing a new version
    this.history = this.history.slice(0, this.currentIndex + 1)
    this.actionDescriptions = this.actionDescriptions.slice(0, this.currentIndex + 1)
    
    // Add new version
    this.history.push(JSON.parse(JSON.stringify(data)))
    this.actionDescriptions.push(actionDescription)
    this.currentIndex++
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.actionDescriptions.shift()
      this.currentIndex--
    }
  }

  /**
   * Undo - go back one version
   */
  undo() {
    if (this.canUndo()) {
      this.currentIndex--
      return this.getCurrent()
    }
    return null
  }

  /**
   * Redo - go forward one version
   */
  redo() {
    if (this.canRedo()) {
      this.currentIndex++
      return this.getCurrent()
    }
    return null
  }

  /**
   * Check if undo is possible
   */
  canUndo() {
    return this.currentIndex > 0
  }

  /**
   * Check if redo is possible
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Reset to original data
   */
  resetToOriginal() {
    if (this.originalData) {
      const original = this.getOriginal()
      this.pushVersion(original)
      return original
    }
    return null
  }

  /**
   * Clear all history
   */
  clear() {
    this.originalData = null
    this.history = []
    this.actionDescriptions = []
    this.currentIndex = -1
  }

  /**
   * Get history info
   */
  getHistoryInfo() {
    return {
      currentIndex: this.currentIndex,
      historyLength: this.history.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    }
  }

  /**
   * Get history with summaries
   */
  getHistoryWithSummaries() {
    return this.history.map((data, index) => {
      const summary = this.actionDescriptions[index] || this.generateSummary(data, index)
      return {
        index,
        isCurrent: index === this.currentIndex,
        summary
      }
    })
  }

  /**
   * Generate a brief summary for a version
   */
  generateSummary(data, index) {
    if (index === 0) {
      return 'Initial state'
    }
    
    if (index === this.currentIndex) {
      return 'Current state'
    }
    
    // Compare with previous version to detect changes
    if (index > 0) {
      const prev = this.history[index - 1]
      const changes = []
      
      Object.keys(data).forEach(sheetName => {
        if (!prev[sheetName]) {
          changes.push(`Added sheet: ${sheetName}`)
        } else {
          const prevSheet = prev[sheetName]
          const currSheet = data[sheetName]
          
          // Check for column changes
          if (prevSheet.columns.length !== currSheet.columns.length) {
            const diff = currSheet.columns.length - prevSheet.columns.length
            if (diff > 0) {
              changes.push(`+${diff} column(s)`)
            } else {
              changes.push(`${diff} column(s)`)
            }
          } else {
            // Check for renamed columns
            const renamed = currSheet.columns.filter(col => !prevSheet.columns.includes(col))
            if (renamed.length > 0) {
              changes.push(`Renamed column`)
            }
          }
          
          // Check for row changes
          if (prevSheet.rows.length !== currSheet.rows.length) {
            const diff = currSheet.rows.length - prevSheet.rows.length
            if (diff > 0) {
              changes.push(`+${diff} row(s)`)
            } else {
              changes.push(`${diff} row(s)`)
            }
          }
          
          // Check for data changes
          if (prevSheet.rows.length > 0 && currSheet.rows.length > 0) {
            const samplePrevRow = JSON.stringify(prevSheet.rows[0])
            const sampleCurrRow = JSON.stringify(currSheet.rows[0])
            if (samplePrevRow !== sampleCurrRow && changes.length === 0) {
              changes.push('Modified data')
            }
          }
        }
      })
      
      if (changes.length === 0) {
        return 'No changes'
      }
      
      return changes.slice(0, 2).join(', ')
    }
    
    return `Version ${index + 1}`
  }

  /**
   * Jump to a specific version in history
   */
  jumpToVersion(index) {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index
      return this.getCurrent()
    }
    return null
  }
}

/**
 * Apply a transformation to data and track in version history
 * @returns {object} { newData, actionDescription }
 */
export function applyDataTransformation(currentData, transformation) {
  const newData = JSON.parse(JSON.stringify(currentData))
  let actionDescription = 'Data modified'
  
  switch (transformation.type) {
    case 'DELETE_ROW':
      Object.keys(newData).forEach(sheetName => {
        if (transformation.sheetName === sheetName || transformation.sheetName === '__ALL__') {
          newData[sheetName].rows = newData[sheetName].rows.filter(
            (_, index) => !transformation.rowIndices.includes(index)
          )
        }
      })
      actionDescription = `Deleted ${transformation.rowIndices.length} row(s)`
      break
      
    case 'DELETE_COLUMN':
      Object.keys(newData).forEach(sheetName => {
        if (transformation.sheetName === sheetName || transformation.sheetName === '__ALL__') {
          const columnToDelete = transformation.columnName
          newData[sheetName].columns = newData[sheetName].columns.filter(
            col => col !== columnToDelete
          )
          newData[sheetName].rows = newData[sheetName].rows.map(row => {
            const newRow = { ...row }
            delete newRow[columnToDelete]
            return newRow
          })
        }
      })
      actionDescription = `Deleted column: ${transformation.columnName}`
      break
      
    case 'RENAME_COLUMN':
      Object.keys(newData).forEach(sheetName => {
        if (transformation.sheetName === sheetName || transformation.sheetName === '__ALL__') {
          const { oldName, newName } = transformation
          const colIndex = newData[sheetName].columns.indexOf(oldName)
          if (colIndex !== -1) {
            newData[sheetName].columns[colIndex] = newName
            newData[sheetName].rows = newData[sheetName].rows.map(row => {
              const newRow = { ...row }
              newRow[newName] = newRow[oldName]
              delete newRow[oldName]
              return newRow
            })
          }
        }
      })
      actionDescription = `Renamed column: ${transformation.oldName} → ${transformation.newName}`
      break
      
    case 'UPDATE_CELL':
      if (newData[transformation.sheetName]) {
        const row = newData[transformation.sheetName].rows[transformation.rowIndex]
        if (row) {
          row[transformation.columnName] = transformation.value
        }
      }
      actionDescription = `Updated cell in ${transformation.columnName}`
      break
      
    case 'TRANSFORM_COLUMN':
      Object.keys(newData).forEach(sheetName => {
        if (transformation.sheetName === sheetName || transformation.sheetName === '__ALL__') {
          const { columnName, transformType } = transformation
          newData[sheetName].rows = newData[sheetName].rows.map(row => {
            const newRow = { ...row }
            if (newRow[columnName] !== null && newRow[columnName] !== undefined) {
              const value = String(newRow[columnName])
              if (transformType === 'uppercase') {
                newRow[columnName] = value.toUpperCase()
              } else if (transformType === 'lowercase') {
                newRow[columnName] = value.toLowerCase()
              }
            }
            return newRow
          })
        }
      })
      actionDescription = `Transformed column ${transformation.columnName} to ${transformation.transformType}`
      break
      
    case 'TRANSFORM_ALL':
      Object.keys(newData).forEach(sheetName => {
        if (transformation.sheetName === sheetName || transformation.sheetName === '__ALL__') {
          const { transformType } = transformation
          newData[sheetName].rows = newData[sheetName].rows.map(row => {
            const newRow = {}
            Object.keys(row).forEach(key => {
              if (row[key] !== null && row[key] !== undefined) {
                const value = String(row[key])
                if (transformType === 'uppercase') {
                  newRow[key] = value.toUpperCase()
                } else if (transformType === 'lowercase') {
                  newRow[key] = value.toLowerCase()
                } else {
                  newRow[key] = row[key]
                }
              } else {
                newRow[key] = row[key]
              }
            })
            return newRow
          })
        }
      })
      actionDescription = `Transformed all columns to ${transformation.transformType}`
      break
      
    case 'SET_COLUMN_TYPE':
      // This transformation only tracks the column type change for history
      // The actual columnTypes state is managed separately
      actionDescription = `Set ${transformation.columnName} as ${transformation.columnType}`
      break
      
    default:
      console.warn('Unknown transformation type:', transformation.type)
  }
  
  return { newData, actionDescription }
}
