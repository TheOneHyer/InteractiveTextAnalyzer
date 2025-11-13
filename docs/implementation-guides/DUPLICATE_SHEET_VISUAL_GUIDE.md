# Sheet Rename Dialog - Visual Guide

## Dialog Appearance

When a duplicate sheet name is detected during file import, a modal dialog appears:

```
┌──────────────────────────────────────────────────────┐
│ Duplicate Sheet Name                              × │
├──────────────────────────────────────────────────────┤
│                                                      │
│  A sheet named "Sheet1" already exists in this      │
│  file. Please rename one of the sheets to continue  │
│  importing.                                          │
│                                                      │
│  New Sheet Name:                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │ Sheet1_1                                       │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│                        ┌────────┐  ┌──────────────┐ │
│                        │ Cancel │  │ Rename and   │ │
│                        │        │  │ Continue     │ │
│                        └────────┘  └──────────────┘ │
└──────────────────────────────────────────────────────┘
```

## Dialog States

### Initial State
- Dialog opens with conflicting sheet name in the message
- Input field is pre-filled with suggested name (e.g., "Sheet1_1")
- Input text is auto-selected for easy editing
- "Rename and Continue" button is enabled
- Focus is on the input field

### Empty Name State
```
  New Sheet Name:
  ┌────────────────────────────────────────────────┐
  │                                                │
  └────────────────────────────────────────────────┘

                     ┌────────┐  ┌──────────────┐
                     │ Cancel │  │ Rename and   │ (disabled)
                     │        │  │ Continue     │
                     └────────┘  └──────────────┘
```
- "Rename and Continue" button is **disabled**
- User cannot proceed without a valid name

### Same Name State
```
  New Sheet Name:
  ┌────────────────────────────────────────────────┐
  │ Sheet1                                         │
  └────────────────────────────────────────────────┘

                     ┌────────┐  ┌──────────────┐
                     │ Cancel │  │ Rename and   │ (disabled)
                     │        │  │ Continue     │
                     └────────┘  └──────────────┘
```
- "Rename and Continue" button is **disabled**
- User cannot use the same conflicting name

### Valid Custom Name State
```
  New Sheet Name:
  ┌────────────────────────────────────────────────┐
  │ MyCustomSheetName                              │
  └────────────────────────────────────────────────┘

                     ┌────────┐  ┌──────────────┐
                     │ Cancel │  │ Rename and   │ (enabled)
                     │        │  │ Continue     │
                     └────────┘  └──────────────┘
```
- "Rename and Continue" button is **enabled**
- User can proceed with their custom name

## User Interactions

### Keyboard Support
- **Enter**: Submit the form (when button is enabled)
- **Escape**: Close the dialog and cancel import
- **Tab**: Navigate between input and buttons
- **Text editing**: All standard text editing shortcuts work

### Mouse Support
- Click input to edit text
- Click "Cancel" to abort import
- Click "Rename and Continue" to proceed (when enabled)
- Click × button in header to cancel
- Click outside dialog (on overlay) to cancel

## Multiple Duplicates Flow

If a file has multiple sheets with duplicate names:

1. First duplicate found:
   ```
   Sheet1 (first occurrence)
   Sheet1 (second occurrence) ← Dialog shown
   Sheet2
   ```

2. After renaming first duplicate:
   ```
   Sheet1 (first occurrence)
   Sheet1_1 (renamed)
   Sheet2 (first occurrence)
   Sheet2 (second occurrence) ← Dialog shown again
   ```

3. After renaming second duplicate:
   ```
   Sheet1 (first occurrence)
   Sheet1_1 (renamed)
   Sheet2 (first occurrence)
   Sheet2_1 (renamed)
   ✓ Import complete
   ```

## Styling Details

### Colors (Using CSS Variables)
- Background: `var(--c-surface)` - matches app theme
- Text: `var(--c-text)` - adjusts with light/dark mode
- Border: `var(--c-border)` - subtle border
- Overlay: `rgba(0, 0, 0, 0.75)` with blur effect

### Animations
- Fade in: Modal overlay appears with smooth fade
- Slide up: Dialog slides up 20px while fading in
- Duration: 200-300ms for smooth transitions

### Responsive Design
- Max width: 500px
- Width: 90% on small screens
- Centered on screen
- Adapts to viewport height
- Prevents body scroll when open

## Example Scenarios

### Scenario 1: Simple Duplicate
**File contents:**
- Data
- Data (duplicate)

**User flow:**
1. Dialog appears: "A sheet named 'Data' already exists"
2. Input shows: "Data_1"
3. User clicks "Rename and Continue"
4. Import completes with sheets: "Data", "Data_1"

### Scenario 2: Multiple Duplicates
**File contents:**
- Report
- Report (duplicate)
- Report (duplicate)

**User flow:**
1. First dialog: "A sheet named 'Report' already exists"
   - Suggests: "Report_1"
   - User renames to: "Report_Jan"
2. Second dialog: "A sheet named 'Report' already exists"
   - Suggests: "Report_1"
   - User clicks "Rename and Continue"
3. Import completes with sheets: "Report", "Report_Jan", "Report_1"

### Scenario 3: User Cancels
**File contents:**
- Sales
- Sales (duplicate)

**User flow:**
1. Dialog appears: "A sheet named 'Sales' already exists"
2. User clicks "Cancel"
3. Import is aborted
4. No sheets are loaded

## Integration with Existing UI

The dialog:
- Uses same modal overlay as HistoryModal and VisualModal
- Matches existing color scheme and typography
- Follows same interaction patterns
- Works with light and dark themes
- Maintains app's visual consistency
