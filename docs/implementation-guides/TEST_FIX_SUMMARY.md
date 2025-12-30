# Test Fix Summary - Duplicate Sheet Name Tests

## Problem
The tests were failing with the error:
```
Error: cannot spy on a non-function value
❯ vi.spyOn(ExcelJS, 'default').mockImplementation(() => mockWorkbook)
```

## Root Cause
The tests were trying to use `vi.spyOn(ExcelJS, 'default')` to mock the ExcelJS module, but:
1. `ExcelJS.default` is not a function, it's a class constructor object
2. `vi.spyOn()` requires a function to spy on
3. The approach didn't properly mock the `new ExcelJS.Workbook()` constructor calls in App.jsx

## Solution
Changed the mocking strategy from using `vi.spyOn()` to using `vi.mock()` at the module level:

### Before (Broken)
```javascript
describe('Duplicate Sheet Name Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should detect duplicate sheet names', async () => {
    // ... create mock worksheets ...
    
    const mockWorkbook = {
      xlsx: { load: vi.fn().mockResolvedValue() },
      worksheets: [mockWorksheet1, mockWorksheet2]
    }
    
    // ❌ This fails - cannot spy on non-function
    const ExcelJS = await import('exceljs')
    vi.spyOn(ExcelJS, 'default').mockImplementation(() => mockWorkbook)
    
    // ... rest of test ...
  })
})
```

### After (Fixed)
```javascript
// ✅ Mock at module level
vi.mock('exceljs', () => {
  return {
    default: {
      Workbook: vi.fn()
    }
  }
})

describe('Duplicate Sheet Name Handling', () => {
  let mockWorkbookInstance
  
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get the mocked ExcelJS
    const ExcelJS = await import('exceljs')
    
    // Reset the mock implementation
    mockWorkbookInstance = null
    ExcelJS.default.Workbook.mockImplementation(function() {
      return mockWorkbookInstance
    })
  })

  it('should detect duplicate sheet names', async () => {
    // ... create mock worksheets ...
    
    // ✅ Set the instance that will be returned
    mockWorkbookInstance = {
      xlsx: { load: vi.fn().mockResolvedValue() },
      worksheets: [mockWorksheet1, mockWorksheet2]
    }
    
    // ... rest of test ...
  })
})
```

## Key Changes

### 1. Module-Level Mock (Line 7-13)
```javascript
vi.mock('exceljs', () => {
  return {
    default: {
      Workbook: vi.fn()
    }
  }
})
```
- Mocks the entire `exceljs` module before any tests run
- Provides a mock `Workbook` constructor function

### 2. Shared Mock Instance (Line 16)
```javascript
let mockWorkbookInstance
```
- Declared in the describe block scope
- Each test sets this to their specific mock workbook
- The mocked constructor returns this instance

### 3. beforeEach Hook (Line 18-30)
```javascript
beforeEach(async () => {
  vi.clearAllMocks()
  
  const ExcelJS = await import('exceljs')
  
  mockWorkbookInstance = null
  ExcelJS.default.Workbook.mockImplementation(function() {
    return mockWorkbookInstance
  })
})
```
- Resets all mocks before each test
- Sets up the mock constructor to return `mockWorkbookInstance`
- Allows each test to control what the constructor returns

### 4. Per-Test Mock Setup (Example from line 59-64)
```javascript
mockWorkbookInstance = {
  xlsx: {
    load: vi.fn().mockResolvedValue()
  },
  worksheets: [mockWorksheet1, mockWorksheet2]
}
```
- Each test sets `mockWorkbookInstance` to their specific mock
- When App.jsx calls `new ExcelJS.Workbook()`, it gets this instance
- No more `vi.spyOn()` calls needed

## Tests Fixed

All 6 test cases were updated with the new mocking pattern:

1. ✅ `should detect duplicate sheet names and show rename dialog`
2. ✅ `should suggest name with _1 suffix for duplicate sheets`
3. ✅ `should allow user to edit the suggested name`
4. ✅ `should have cancel button to abort import`
5. ✅ `should have rename button disabled when name is empty or same as conflicting name`

## Why This Works

### How App.jsx Uses ExcelJS
```javascript
import ExcelJS from 'exceljs'

// Later in handleFile:
const workbook = new ExcelJS.Workbook()
await workbook.xlsx.load(data)
workbook.worksheets.forEach(ws => { /* ... */ })
```

### How Our Mock Intercepts It
1. `vi.mock('exceljs')` replaces the entire module
2. `ExcelJS.Workbook` is now a mock function
3. When `new ExcelJS.Workbook()` is called, our mock function runs
4. It returns `mockWorkbookInstance` that we set in each test
5. The test can control exactly what the workbook contains

## Verification

The fix can be verified by:
```bash
npm test duplicateSheetName
```

Expected output:
```
✓ src/test/duplicateSheetName.test.jsx (6)
  ✓ Duplicate Sheet Name Handling (6)
    ✓ should detect duplicate sheet names and show rename dialog
    ✓ should suggest name with _1 suffix for duplicate sheets
    ✓ should allow user to edit the suggested name
    ✓ should have cancel button to abort import
    ✓ should have rename button disabled when name is empty or same as conflicting name
```

## Files Changed

- `src/test/duplicateSheetName.test.jsx`
  - Added module-level `vi.mock('exceljs')` 
  - Added `mockWorkbookInstance` shared variable
  - Updated `beforeEach` to configure the mock
  - Replaced all 5 instances of `vi.spyOn()` with `mockWorkbookInstance =`

## Commit

Commit: `483c9bb`
Message: "Fix test mocking to properly mock ExcelJS module"

## Benefits

1. **More Reliable** - Uses the proper Vitest mocking API
2. **More Maintainable** - Consistent pattern across all tests
3. **Better Isolation** - Each test completely controls its mock
4. **Clearer Intent** - The mock setup clearly shows what's being tested
5. **Future-Proof** - Won't break if ExcelJS module structure changes slightly
