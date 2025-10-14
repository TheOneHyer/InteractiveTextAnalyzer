# Code Changes Summary - Duplicate Sheet Name Dialog

## Overview
This document provides a detailed before/after comparison of the code changes made to implement the duplicate sheet name dialog feature.

---

## File 1: App.jsx - Import Statement

### BEFORE
```javascript
import HistoryModal from './components/HistoryModal'
import { DataVersionManager, applyDataTransformation } from './utils/dataVersioning'
```

### AFTER
```javascript
import HistoryModal from './components/HistoryModal'
import SheetRenameDialog from './components/SheetRenameDialog'
import { DataVersionManager, applyDataTransformation } from './utils/dataVersioning'
```

**Change:** Added import for the new SheetRenameDialog component

---

## File 2: App.jsx - State Variables

### BEFORE
```javascript
const [showHistoryModal, setShowHistoryModal] = useState(false)

// Editor view text search filter
const [textSearchFilter, setTextSearchFilter] = useState('')
```

### AFTER
```javascript
const [showHistoryModal, setShowHistoryModal] = useState(false)

// Sheet rename dialog state
const [showRenameDialog, setShowRenameDialog] = useState(false)
const [renameDialogData, setRenameDialogData] = useState({
  conflictingName: '',
  suggestedName: '',
  pendingData: null,
  pendingWorksheets: []
})

// Editor view text search filter
const [textSearchFilter, setTextSearchFilter] = useState('')
```

**Change:** Added state management for the rename dialog

---

## File 3: App.jsx - handleFile Function (Excel Processing)

### BEFORE
```javascript
} else { 
  const data=evt.target.result
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(data)
  
  workbook.worksheets.forEach(ws => {
    parsedData[ws.name] = parseWorksheet(ws)
  })
}
```

### AFTER
```javascript
} else { 
  const data=evt.target.result
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(data)
  
  // Check for duplicate sheet names
  const worksheets = workbook.worksheets
  const sheetNames = new Set()
  let duplicateFound = null
  let duplicateIndex = -1
  
  for (let i = 0; i < worksheets.length; i++) {
    const ws = worksheets[i]
    if (sheetNames.has(ws.name)) {
      duplicateFound = ws.name
      duplicateIndex = i
      break
    }
    sheetNames.add(ws.name)
  }
  
  if (duplicateFound) {
    // Found duplicate - show rename dialog
    // Parse sheets up to (but not including) the duplicate
    const parsedSheets = {}
    for (let i = 0; i < duplicateIndex; i++) {
      const ws = worksheets[i]
      parsedSheets[ws.name] = parseWorksheet(ws)
    }
    
    // Generate suggested name with _1 suffix
    let suffix = 1
    let suggestedName = `${duplicateFound}_${suffix}`
    while (sheetNames.has(suggestedName)) {
      suffix++
      suggestedName = `${duplicateFound}_${suffix}`
    }
    
    // Store data for later processing
    setRenameDialogData({
      conflictingName: duplicateFound,
      suggestedName: suggestedName,
      pendingData: parsedSheets,
      pendingWorksheets: worksheets
    })
    setShowRenameDialog(true)
    return // Exit early, wait for user input
  }
  
  // No duplicates - parse all sheets normally
  workbook.worksheets.forEach(ws => {
    parsedData[ws.name] = parseWorksheet(ws)
  })
}
```

**Changes:**
1. Added duplicate detection loop
2. Parse sheets only up to duplicate
3. Generate suggested name with incremental suffix
4. Show dialog and return early when duplicate found

---

## File 4: App.jsx - New Handler Functions

### BEFORE
(Functions did not exist)

### AFTER
```javascript
/**
 * Handle sheet rename confirmation from dialog
 * Completes the file import process with the renamed sheet
 */
const handleSheetRename = (newName) => {
  try {
    const { pendingData, pendingWorksheets, conflictingName } = renameDialogData
    
    // Find the duplicate sheet (the second occurrence with the same name)
    let duplicateIndex = -1
    let foundFirst = false
    for (let i = 0; i < pendingWorksheets.length; i++) {
      if (pendingWorksheets[i].name === conflictingName) {
        if (foundFirst) {
          duplicateIndex = i
          break
        }
        foundFirst = true
      }
    }
    
    // Parse the duplicate sheet with the new name
    if (duplicateIndex !== -1) {
      pendingData[newName] = parseWorksheet(pendingWorksheets[duplicateIndex])
    }
    
    // Parse any remaining sheets after the duplicate
    for (let i = duplicateIndex + 1; i < pendingWorksheets.length; i++) {
      const ws = pendingWorksheets[i]
      // Check for more duplicates
      if (!pendingData[ws.name]) {
        pendingData[ws.name] = parseWorksheet(ws)
      } else {
        // If there's another duplicate, handle it recursively
        let suffix = 1
        let suggestedName = `${ws.name}_${suffix}`
        while (pendingData[suggestedName]) {
          suffix++
          suggestedName = `${ws.name}_${suffix}`
        }
        
        // Show dialog for the next duplicate
        setRenameDialogData({
          conflictingName: ws.name,
          suggestedName: suggestedName,
          pendingData: pendingData,
          pendingWorksheets: pendingWorksheets
        })
        return // Exit and wait for next rename
      }
    }
    
    // All sheets processed - finalize import
    versionManager.current.initialize(pendingData)
    setHistoryInfo(versionManager.current.getHistoryInfo())
    
    setWorkbookData(pendingData)
    setActiveSheet(Object.keys(pendingData)[0] || null)
    setSelectedColumns([])
    setHiddenColumns([])
    setRenames({})
    
    // Auto-detect sheets suitable for analysis
    const detectedInclusion = autoDetectSheetsForAnalysis(pendingData)
    setIncludedSheets(detectedInclusion)
    
    // Auto-detect categorical columns
    const firstSheet = Object.keys(pendingData)[0]
    if (firstSheet && pendingData[firstSheet]) {
      const detected = detectCategoricalColumns(pendingData[firstSheet].rows, pendingData[firstSheet].columns)
      setCategoricalColumns(detected)
    }
    
    // Close the dialog
    setShowRenameDialog(false)
    setRenameDialogData({
      conflictingName: '',
      suggestedName: '',
      pendingData: null,
      pendingWorksheets: []
    })
  } catch (error) {
    console.error('Error processing renamed sheet:', error)
    alert('Error processing renamed sheet: ' + error.message)
    setShowRenameDialog(false)
  }
}

/**
 * Handle sheet rename dialog cancellation
 */
const handleRenameCancel = () => {
  setShowRenameDialog(false)
  setRenameDialogData({
    conflictingName: '',
    suggestedName: '',
    pendingData: null,
    pendingWorksheets: []
  })
}
```

**Changes:** Added two new handler functions for rename dialog actions

---

## File 5: App.jsx - JSX Rendering

### BEFORE
```jsx
{showHistoryModal && (
  <HistoryModal
    isOpen={showHistoryModal}
    onClose={() => setShowHistoryModal(false)}
    versionManager={versionManager.current}
    onJumpToVersion={jumpToHistoryVersion}
    currentIndex={historyInfo.currentIndex}
  />
)}
<aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
```

### AFTER
```jsx
{showHistoryModal && (
  <HistoryModal
    isOpen={showHistoryModal}
    onClose={() => setShowHistoryModal(false)}
    versionManager={versionManager.current}
    onJumpToVersion={jumpToHistoryVersion}
    currentIndex={historyInfo.currentIndex}
  />
)}
{showRenameDialog && (
  <SheetRenameDialog
    isOpen={showRenameDialog}
    onClose={handleRenameCancel}
    onRename={handleSheetRename}
    conflictingName={renameDialogData.conflictingName}
    suggestedName={renameDialogData.suggestedName}
  />
)}
<aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
```

**Change:** Added SheetRenameDialog component rendering

---

## File 6: SheetRenameDialog.jsx (NEW FILE)

**Location:** `interactivetextanalyzer/src/components/SheetRenameDialog.jsx`

**Content:** New 142-line React component file providing:
- Modal dialog for handling duplicate sheet names
- Input field with auto-focus and selection
- Validation (prevents empty names or same-as-conflicting names)
- Cancel and submit buttons
- Keyboard support (Enter, Escape)
- Responsive design using existing CSS classes

---

## File 7: duplicateSheetName.test.jsx (NEW FILE)

**Location:** `interactivetextanalyzer/src/test/duplicateSheetName.test.jsx`

**Content:** New test file with 6 comprehensive test cases:
1. Detects duplicate sheet names and shows dialog
2. Suggests name with _1 suffix
3. Allows user to edit suggested name
4. Has cancel button to abort import
5. Disables rename button for invalid names
6. Multiple duplicate handling tests

---

## Summary of Changes

### Files Modified: 1
- `interactivetextanalyzer/src/App.jsx`
  - 1 import added
  - 6 lines of state management added
  - ~50 lines in handleFile function modified/added
  - ~90 lines for two new handler functions
  - 8 lines of JSX added

### Files Created: 2
- `interactivetextanalyzer/src/components/SheetRenameDialog.jsx` (142 lines)
- `interactivetextanalyzer/src/test/duplicateSheetName.test.jsx` (369 lines)

### Total Lines Changed: ~676 lines
- Modified: ~155 lines
- New: ~521 lines

### Behavior Changes
- **Before:** Duplicate sheet names were silently overwritten
- **After:** User is prompted to rename conflicting sheets
- **User Impact:** Prevents data loss, provides control over sheet naming
