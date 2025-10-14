# Duplicate Sheet Name Dialog Implementation

## Summary

This implementation adds a user-friendly dialog that appears when importing an Excel file with duplicate sheet names. Instead of silently overwriting or throwing an error, the application now:

1. Detects duplicate sheet names during file import
2. Opens a modal dialog prompting the user to rename the conflicting sheet
3. Suggests a default name with "_1" suffix (or "_2", "_3", etc. if needed)
4. Allows the user to edit the suggested name before proceeding
5. Handles multiple duplicates recursively

## Changes Made

### 1. New Component: SheetRenameDialog.jsx
- Located at: `interactivetextanalyzer/src/components/SheetRenameDialog.jsx`
- Modal dialog component for handling sheet name conflicts
- Features:
  - Auto-focuses and selects the input text when opened
  - Validates that new name is not empty and different from conflicting name
  - Disables submit button when validation fails
  - Supports keyboard navigation (Enter to submit, Escape to cancel)
  - Prevents body scroll when modal is open

### 2. Modified: App.jsx

#### New State Variables (lines 173-180)
```javascript
const [showRenameDialog, setShowRenameDialog] = useState(false)
const [renameDialogData, setRenameDialogData] = useState({
  conflictingName: '',
  suggestedName: '',
  pendingData: null,
  pendingWorksheets: []
})
```

#### Updated handleFile Function (lines 815-930)
- Added duplicate detection loop that checks each worksheet name
- When duplicate found:
  - Parses sheets up to (but not including) the duplicate
  - Generates suggested name with incremental suffix
  - Stores pending data and shows dialog
  - Returns early to wait for user input
- No change to non-Excel file handling

#### New handleSheetRename Function (lines 937-1004)
- Finds the second occurrence of the conflicting sheet name
- Parses the duplicate sheet with the user-provided new name
- Continues parsing remaining sheets
- Handles additional duplicates recursively
- Finalizes import when all sheets are processed

#### New handleRenameCancel Function (lines 1009-1018)
- Closes dialog and clears pending data
- Aborts the import process

#### Updated JSX (lines 1781-1789)
- Added SheetRenameDialog component rendering
- Positioned after HistoryModal for consistency

### 3. New Test File: duplicateSheetName.test.jsx
- Located at: `interactivetextanalyzer/src/test/duplicateSheetName.test.jsx`
- Comprehensive test coverage including:
  - Detection of duplicate sheet names
  - Suggested name with "_1" suffix
  - User ability to edit suggested name
  - Cancel button functionality
  - Submit button validation

## How It Works

### User Flow
1. User selects an Excel file with duplicate sheet names
2. Application parses sheets until it encounters a duplicate
3. Modal dialog appears showing:
   - The conflicting sheet name
   - An input field with suggested new name (e.g., "Sheet1_1")
   - Cancel and "Rename and Continue" buttons
4. User can:
   - Accept the suggested name by clicking "Rename and Continue"
   - Edit the name to something else before submitting
   - Cancel the import by clicking "Cancel" or pressing Escape
5. After renaming, the application:
   - Continues parsing remaining sheets
   - Shows dialog again if another duplicate is found
   - Completes import when all sheets are processed

### Technical Details

**Duplicate Detection:**
- Iterates through worksheets in order
- Maintains a Set of seen sheet names
- Stops at first duplicate found

**Suggested Name Generation:**
- Starts with `{originalName}_1`
- Increments suffix if that name is also taken
- Ensures uniqueness across all sheets

**Handling Multiple Duplicates:**
- Processes one duplicate at a time
- After user renames one, checks remaining sheets
- Shows dialog again if another duplicate found
- Recursive approach ensures all conflicts resolved

## Benefits

1. **User-Friendly:** Clear explanation of the conflict with actionable options
2. **Flexible:** Users can choose their own names, not forced to accept suggestions
3. **Robust:** Handles multiple duplicates across the entire file
4. **Safe:** Prevents data loss from silent overwrites
5. **Consistent:** Uses existing modal patterns and styles from the application

## Testing

### Manual Testing Steps
1. Create an Excel file with two sheets named "Sheet1"
2. Upload the file to the application
3. Verify dialog appears with conflicting name and suggested name "Sheet1_1"
4. Test editing the name
5. Test canceling
6. Test accepting the suggested name
7. Create a file with 3+ sheets with duplicate names to test recursive handling

### Automated Tests
- Run `npm test` to execute the test suite
- Tests cover all major scenarios including validation and edge cases

## Browser Compatibility
- Uses standard React patterns compatible with modern browsers
- Modal uses CSS features supported by all modern browsers
- No special polyfills required
