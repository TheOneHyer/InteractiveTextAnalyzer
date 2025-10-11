# New Utility Modules

This document describes the new utility modules created as part of the code refactoring effort.

## File Handlers (`src/utils/fileHandlers.js`)

Provides functions for parsing CSV and Excel files.

### Functions

- **`parseCsv(text)`** - Parse CSV text into rows and columns
  - Handles quoted values and special characters
  - Returns `{ rows: [], columns: [] }`
  
- **`parseWorksheet(ws)`** - Parse ExcelJS worksheet into rows and columns
  - Handles rich text, formulas, and cell types
  - Returns `{ rows: [], columns: [] }`

### Usage

```javascript
import { parseCsv, parseWorksheet } from './utils/fileHandlers'

// Parse CSV
const { rows, columns } = parseCsv(csvText)

// Parse Excel worksheet
const { rows, columns } = parseWorksheet(worksheet)
```

## Data Helpers (`src/utils/dataHelpers.js`)

Provides functions for data transformation and filtering.

### Functions

- **`detectCategoricalColumns(rows, columns)`** - Auto-detect categorical columns
  - Returns array of column names with ≤5 unique values
  
- **`getActiveSheetRows(activeSheet, workbookData)`** - Get rows for active sheet
  - Handles '__ALL__' special case for combined sheets
  
- **`getActiveSheetColumns(activeSheet, workbookData)`** - Get columns for active sheet
  - Returns unique column names for multi-sheet selection
  
- **`applyCategoricalFilters(rows, categoricalFilters)`** - Filter rows by categorical values
  
- **`applyTextSearchFilter(rows, searchText, columns)`** - Filter rows by text search

### Usage

```javascript
import { 
  detectCategoricalColumns,
  getActiveSheetRows,
  applyCategoricalFilters 
} from './utils/dataHelpers'

// Detect categorical columns
const catCols = detectCategoricalColumns(rows, columns)

// Get active sheet data
const activeRows = getActiveSheetRows('Sheet1', workbookData)

// Apply filters
const filtered = applyCategoricalFilters(rows, { category: ['A', 'B'] })
```

## Visualization Helpers (`src/utils/visualizationHelpers.js`)

Provides functions for preparing data for various visualizations.

### Functions

- **`getWordCloudData(params)`** - Prepare data for word cloud visualization
  - Supports TF-IDF, n-grams, NER, YAKE, lemmatization, POS, and topic modeling
  - Returns array of `{ text, value }` objects
  
- **`getBarData(params)`** - Prepare data for bar chart visualization
  - Supports all analysis types
  - Returns array formatted for Recharts
  
- **`getNetworkData(params)`** - Prepare data for network graph visualization
  - Supports associations, dependencies, lemmatization, and topics
  - Returns `{ nodes: [], edges: [] }`
  
- **`getHeatmapData(params)`** - Prepare data for heatmap visualization
  - Supports TF-IDF and topic modeling
  - Returns `{ matrix: [], xLabels: [], yLabels: [] }`

### Usage

```javascript
import { 
  getWordCloudData, 
  getBarData, 
  getNetworkData,
  getHeatmapData 
} from './utils/visualizationHelpers'

// Get word cloud data
const wordCloud = getWordCloudData({
  analysisType: 'tfidf',
  tfidf: tfidfResults,
  // ... other params
})

// Get network graph data
const network = getNetworkData({
  analysisType: 'assoc',
  associations: associationResults
})
```

## Component Extraction

The following inline components were extracted to separate files:

- **`SheetSelector`** - Sheet tab navigation component
- **`InfoTooltip`** - Info icon with tooltip
- **`ColumnManager`** - Column management UI (rename, hide, select)
- **`SimpleColumnSelector`** - Simple column activation UI
- **`HistoryModal`** - Version history modal

All components maintain the same props API and functionality as their inline counterparts.

## Benefits

1. **Reduced App.jsx size** - From 2996 to 2606 lines (-13%)
2. **Better code organization** - Related functions grouped by domain
3. **Improved reusability** - Utilities can be imported anywhere
4. **Enhanced testability** - Isolated functions easier to test
5. **Clearer separation of concerns** - Business logic vs. presentation
