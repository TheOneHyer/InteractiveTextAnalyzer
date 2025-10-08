import { describe, it, expect, beforeEach } from 'vitest'
import { DataVersionManager, applyDataTransformation } from '../utils/dataVersioning'

describe('DataVersionManager', () => {
  let manager
  let testData

  beforeEach(() => {
    manager = new DataVersionManager()
    testData = {
      'Sheet1': {
        columns: ['col1', 'col2', 'col3'],
        rows: [
          { col1: 'a', col2: 'b', col3: 'c' },
          { col1: 'd', col2: 'e', col3: 'f' }
        ]
      }
    }
  })

  describe('initialization', () => {
    it('should initialize with data', () => {
      manager.initialize(testData)
      expect(manager.getCurrent()).toEqual(testData)
      expect(manager.getOriginal()).toEqual(testData)
    })

    it('should have correct initial history state', () => {
      manager.initialize(testData)
      const info = manager.getHistoryInfo()
      expect(info.currentIndex).toBe(0)
      expect(info.historyLength).toBe(1)
      expect(info.canUndo).toBe(false)
      expect(info.canRedo).toBe(false)
    })
  })

  describe('version management', () => {
    beforeEach(() => {
      manager.initialize(testData)
    })

    it('should push new version', () => {
      const newData = JSON.parse(JSON.stringify(testData))
      newData.Sheet1.rows.push({ col1: 'g', col2: 'h', col3: 'i' })
      
      manager.pushVersion(newData)
      expect(manager.getCurrent()).toEqual(newData)
      expect(manager.getHistoryInfo().historyLength).toBe(2)
    })

    it('should not modify original data when pushing versions', () => {
      const originalCopy = JSON.parse(JSON.stringify(testData))
      
      const newData = JSON.parse(JSON.stringify(testData))
      newData.Sheet1.rows.push({ col1: 'g', col2: 'h', col3: 'i' })
      manager.pushVersion(newData)
      
      expect(manager.getOriginal()).toEqual(originalCopy)
    })
  })

  describe('undo/redo', () => {
    beforeEach(() => {
      manager.initialize(testData)
    })

    it('should undo to previous version', () => {
      const newData = JSON.parse(JSON.stringify(testData))
      newData.Sheet1.rows.push({ col1: 'g', col2: 'h', col3: 'i' })
      manager.pushVersion(newData)
      
      const undone = manager.undo()
      expect(undone).toEqual(testData)
      expect(manager.canRedo()).toBe(true)
    })

    it('should redo to next version', () => {
      const newData = JSON.parse(JSON.stringify(testData))
      newData.Sheet1.rows.push({ col1: 'g', col2: 'h', col3: 'i' })
      manager.pushVersion(newData)
      
      manager.undo()
      const redone = manager.redo()
      expect(redone).toEqual(newData)
    })

    it('should not undo beyond first version', () => {
      expect(manager.canUndo()).toBe(false)
      expect(manager.undo()).toBeNull()
    })

    it('should not redo beyond last version', () => {
      expect(manager.canRedo()).toBe(false)
      expect(manager.redo()).toBeNull()
    })

    it('should clear redo history when pushing new version after undo', () => {
      const data2 = JSON.parse(JSON.stringify(testData))
      data2.Sheet1.rows.push({ col1: 'g', col2: 'h', col3: 'i' })
      manager.pushVersion(data2)
      
      const data3 = JSON.parse(JSON.stringify(data2))
      data3.Sheet1.rows.push({ col1: 'j', col2: 'k', col3: 'l' })
      manager.pushVersion(data3)
      
      manager.undo() // Go back to data2
      expect(manager.getHistoryInfo().historyLength).toBe(3)
      
      const data4 = JSON.parse(JSON.stringify(testData))
      data4.Sheet1.rows.push({ col1: 'm', col2: 'n', col3: 'o' })
      manager.pushVersion(data4)
      
      expect(manager.getHistoryInfo().historyLength).toBe(3)
      expect(manager.canRedo()).toBe(false)
    })
  })

  describe('reset to original', () => {
    it('should reset to original data', () => {
      manager.initialize(testData)
      
      const newData = JSON.parse(JSON.stringify(testData))
      newData.Sheet1.rows = []
      manager.pushVersion(newData)
      
      const reset = manager.resetToOriginal()
      expect(reset).toEqual(testData)
      expect(manager.getCurrent()).toEqual(testData)
    })
  })

  describe('history limits', () => {
    it('should limit history size', () => {
      manager.maxHistorySize = 5
      manager.initialize(testData)
      
      for (let i = 0; i < 10; i++) {
        const newData = JSON.parse(JSON.stringify(testData))
        newData.Sheet1.rows.push({ col1: `${i}`, col2: `${i}`, col3: `${i}` })
        manager.pushVersion(newData)
      }
      
      expect(manager.getHistoryInfo().historyLength).toBe(5)
    })
  })

  describe('clear', () => {
    it('should clear all data and history', () => {
      manager.initialize(testData)
      manager.pushVersion(testData)
      
      manager.clear()
      
      expect(manager.getCurrent()).toBeNull()
      expect(manager.getOriginal()).toBeNull()
      expect(manager.getHistoryInfo().historyLength).toBe(0)
    })
  })
})

describe('applyDataTransformation', () => {
  let testData

  beforeEach(() => {
    testData = {
      'Sheet1': {
        columns: ['col1', 'col2', 'col3'],
        rows: [
          { col1: 'a', col2: 'b', col3: 'c' },
          { col1: 'd', col2: 'e', col3: 'f' },
          { col1: 'g', col2: 'h', col3: 'i' }
        ]
      }
    }
  })

  describe('DELETE_ROW', () => {
    it('should delete specified rows', () => {
      const transformation = {
        type: 'DELETE_ROW',
        sheetName: 'Sheet1',
        rowIndices: [1]
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData.Sheet1.rows).toHaveLength(2)
      expect(result.newData.Sheet1.rows[0].col1).toBe('a')
      expect(result.newData.Sheet1.rows[1].col1).toBe('g')
      expect(result.actionDescription).toContain('Deleted')
    })

    it('should delete multiple rows', () => {
      const transformation = {
        type: 'DELETE_ROW',
        sheetName: 'Sheet1',
        rowIndices: [0, 2]
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData.Sheet1.rows).toHaveLength(1)
      expect(result.newData.Sheet1.rows[0].col1).toBe('d')
      expect(result.actionDescription).toContain('Deleted')
    })
  })

  describe('DELETE_COLUMN', () => {
    it('should delete specified column', () => {
      const transformation = {
        type: 'DELETE_COLUMN',
        sheetName: 'Sheet1',
        columnName: 'col2'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData.Sheet1.columns).toEqual(['col1', 'col3'])
      expect(result.newData.Sheet1.rows[0]).toEqual({ col1: 'a', col3: 'c' })
      expect(result.newData.Sheet1.rows[0].col2).toBeUndefined()
      expect(result.actionDescription).toContain('Deleted column')
    })
  })

  describe('RENAME_COLUMN', () => {
    it('should rename specified column', () => {
      const transformation = {
        type: 'RENAME_COLUMN',
        sheetName: 'Sheet1',
        oldName: 'col2',
        newName: 'newCol2'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData.Sheet1.columns).toEqual(['col1', 'newCol2', 'col3'])
      expect(result.newData.Sheet1.rows[0].newCol2).toBe('b')
      expect(result.newData.Sheet1.rows[0].col2).toBeUndefined()
      expect(result.actionDescription).toContain('Renamed column')
    })
  })

  describe('UPDATE_CELL', () => {
    it('should update specified cell', () => {
      const transformation = {
        type: 'UPDATE_CELL',
        sheetName: 'Sheet1',
        rowIndex: 1,
        columnName: 'col2',
        value: 'updated'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData.Sheet1.rows[1].col2).toBe('updated')
      expect(result.actionDescription).toContain('Updated cell')
    })
  })

  describe('data immutability', () => {
    it('should not modify original data', () => {
      const originalCopy = JSON.parse(JSON.stringify(testData))
      
      const transformation = {
        type: 'DELETE_ROW',
        sheetName: 'Sheet1',
        rowIndices: [0]
      }
      
      applyDataTransformation(testData, transformation)
      expect(testData).toEqual(originalCopy)
    })
  })
  
  describe('action descriptions', () => {
    it('should return descriptive action for DELETE_COLUMN', () => {
      const transformation = {
        type: 'DELETE_COLUMN',
        sheetName: 'Sheet1',
        columnName: 'testCol'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.actionDescription).toBe('Deleted column: testCol')
    })
    
    it('should return descriptive action for RENAME_COLUMN', () => {
      const transformation = {
        type: 'RENAME_COLUMN',
        sheetName: 'Sheet1',
        oldName: 'oldCol',
        newName: 'newCol'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.actionDescription).toBe('Renamed column: oldCol → newCol')
    })
    
    it('should return descriptive action for DELETE_ROW', () => {
      const transformation = {
        type: 'DELETE_ROW',
        sheetName: 'Sheet1',
        rowIndices: [0, 1, 2]
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.actionDescription).toBe('Deleted 3 row(s)')
    })
    
    it('should return descriptive action for TRANSFORM_COLUMN', () => {
      const transformation = {
        type: 'TRANSFORM_COLUMN',
        sheetName: 'Sheet1',
        columnName: 'col1',
        transformType: 'uppercase'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.actionDescription).toBe('Transformed column col1 to uppercase')
    })
    
    it('should return descriptive action for SET_COLUMN_TYPE', () => {
      const transformation = {
        type: 'SET_COLUMN_TYPE',
        sheetName: 'Sheet1',
        columnName: 'col1',
        columnType: 'categorical'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.actionDescription).toBe('Set col1 as categorical')
    })
  })
})

describe('History with action descriptions', () => {
  let manager
  let testData
  
  beforeEach(() => {
    manager = new DataVersionManager()
    testData = {
      'Sheet1': {
        columns: ['col1', 'col2', 'col3'],
        rows: [
          { col1: 'a', col2: 'b', col3: 'c' },
          { col1: 'd', col2: 'e', col3: 'f' }
        ]
      }
    }
  })
  
  it('should store action descriptions with versions', () => {
    manager.initialize(testData)
    
    const newData = JSON.parse(JSON.stringify(testData))
    newData.Sheet1.rows.push({ col1: 'g', col2: 'h', col3: 'i' })
    
    manager.pushVersion(newData, 'Added new row')
    
    const history = manager.getHistoryWithSummaries()
    expect(history).toHaveLength(2)
    expect(history[0].summary).toBe('Initial data load')
    expect(history[1].summary).toBe('Added new row')
  })
  
  it('should use action descriptions in history summaries', () => {
    manager.initialize(testData)
    manager.pushVersion(testData, 'Renamed column: old → new')
    manager.pushVersion(testData, 'Deleted column: test')
    
    const history = manager.getHistoryWithSummaries()
    expect(history[1].summary).toBe('Renamed column: old → new')
    expect(history[2].summary).toBe('Deleted column: test')
  })
})

describe('Sheet transformations', () => {
  let testData
  
  beforeEach(() => {
    testData = {
      'Sheet1': {
        columns: ['col1', 'col2'],
        rows: [{ col1: 'a', col2: 'b' }]
      },
      'Sheet2': {
        columns: ['col3', 'col4'],
        rows: [{ col3: 'c', col4: 'd' }]
      }
    }
  })
  
  describe('RENAME_SHEET', () => {
    it('should rename a sheet', () => {
      const transformation = {
        type: 'RENAME_SHEET',
        oldName: 'Sheet1',
        newName: 'Data'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData['Data']).toBeDefined()
      expect(result.newData['Sheet1']).toBeUndefined()
      expect(result.newData['Data']).toEqual(testData['Sheet1'])
      expect(result.actionDescription).toBe('Renamed sheet: Sheet1 → Data')
    })
    
    it('should not affect other sheets when renaming', () => {
      const transformation = {
        type: 'RENAME_SHEET',
        oldName: 'Sheet1',
        newName: 'Data'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData['Sheet2']).toEqual(testData['Sheet2'])
    })
    
    it('should handle renaming non-existent sheet gracefully', () => {
      const transformation = {
        type: 'RENAME_SHEET',
        oldName: 'NonExistent',
        newName: 'NewName'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData['NonExistent']).toBeUndefined()
      expect(result.newData['NewName']).toBeUndefined()
    })
  })
  
  describe('DELETE_SHEET', () => {
    it('should delete a sheet', () => {
      const transformation = {
        type: 'DELETE_SHEET',
        sheetName: 'Sheet1'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData['Sheet1']).toBeUndefined()
      expect(result.newData['Sheet2']).toBeDefined()
      expect(result.actionDescription).toBe('Deleted sheet: Sheet1')
    })
    
    it('should not affect other sheets when deleting', () => {
      const transformation = {
        type: 'DELETE_SHEET',
        sheetName: 'Sheet1'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.newData['Sheet2']).toEqual(testData['Sheet2'])
    })
    
    it('should handle deleting non-existent sheet gracefully', () => {
      const transformation = {
        type: 'DELETE_SHEET',
        sheetName: 'NonExistent'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(Object.keys(result.newData)).toHaveLength(2)
    })
  })
  
  describe('INCLUDE_SHEET and EXCLUDE_SHEET', () => {
    it('should generate action description for including sheet', () => {
      const transformation = {
        type: 'INCLUDE_SHEET',
        sheetName: 'Sheet1'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.actionDescription).toBe('Included sheet "Sheet1" for analysis')
      // Data should remain unchanged (inclusion is managed in state)
      expect(result.newData).toEqual(testData)
    })
    
    it('should generate action description for excluding sheet', () => {
      const transformation = {
        type: 'EXCLUDE_SHEET',
        sheetName: 'Sheet1'
      }
      
      const result = applyDataTransformation(testData, transformation)
      expect(result.actionDescription).toBe('Excluded sheet "Sheet1" from analysis')
      // Data should remain unchanged (exclusion is managed in state)
      expect(result.newData).toEqual(testData)
    })
  })
})
