# Security Implementation Summary

## Overview
This document describes the comprehensive security measures implemented in the Interactive Text Analyzer to protect users from malicious content in uploaded files. All security features run automatically in the background without requiring any user intervention.

## Security Utilities Module
**Location**: `src/utils/security.js`

### Core Functions

#### 1. String Sanitization (`sanitizeString`)
- Removes script tags and their content using regex pattern matching
- Strips all HTML tags to prevent XSS attacks
- Limits string length to 10,000 characters to prevent DoS
- Handles non-string inputs safely

**Example**:
```javascript
sanitizeString('<script>alert("XSS")</script>Hello') // Returns: 'Hello'
```

#### 2. Cell Value Sanitization (`sanitizeCellValue`)
- Prevents CSV/Formula injection attacks
- Detects dangerous formula prefixes: `=`, `+`, `-`, `@`
- Prefixes dangerous formulas with a space to neutralize them
- Applies string sanitization to remove HTML/scripts

**Example**:
```javascript
sanitizeCellValue('=SUM(A1:A10)') // Returns: ' =SUM(A1:A10)'
```

#### 3. Column Name Sanitization (`sanitizeColumnName`)
- Removes HTML tags and script content
- Strips quotes and angle brackets
- Limits length to 200 characters
- Provides default "Column" name for empty inputs

#### 4. File Size Validation (`validateFileSize`)
- Maximum file size: 10MB
- Prevents denial-of-service attacks from large files
- Returns boolean for easy validation

#### 5. File Extension Validation (`validateFileExtension`)
- Whitelist approach: only `.csv`, `.xlsx`, `.xls` allowed
- Case-insensitive checking
- Rejects dangerous extensions like `.exe`, `.js`, `.html`

#### 6. Filename Sanitization (`sanitizeFilename`)
- Removes path separators to prevent directory traversal
- Strips null bytes and special characters
- Limits length to 100 characters
- Only allows alphanumeric, underscore, and hyphen

#### 7. localStorage Sanitization (`sanitizeLocalStorageData`)
- Validates JSON structure before parsing
- Type checks all fields
- Validates enum values (analysisType, viewMode)
- Enforces numeric ranges (ngramN: 1-10, minSupport: 0-1)
- Sanitizes nested objects and arrays
- Returns null for invalid data

#### 8. Row Sanitization (`sanitizeRow`)
- Sanitizes all column names in the row object
- Sanitizes all cell values in the row
- Handles null/undefined inputs safely

#### 9. Worksheet Sanitization (`sanitizeWorksheetData`)
- Sanitizes entire worksheet structure
- Processes columns and rows arrays
- Returns safe default structure for invalid input

## Integration Points

### 1. App.jsx - File Upload Handler (`handleFile`)
```javascript
// File size validation
if(!validateFileSize(file)) {
  alert('File size exceeds 10MB limit.')
  return
}

// Extension validation
if(!validateFileExtension(file.name)) {
  alert('Invalid file type. Please upload CSV, XLS, or XLSX files only.')
  return
}

// Error handling
try {
  // Parse and sanitize file content
} catch(error) {
  alert('Error reading file. The file may be corrupted or invalid.')
}
```

### 2. App.jsx - CSV Parser (`parseCsv`)
- Sanitizes column names immediately after parsing
- Applies full worksheet sanitization to parsed data

### 3. App.jsx - Excel Parser (`parseWorksheet`)
- Sanitizes column headers from first row
- Applies worksheet sanitization to all parsed data

### 4. App.jsx - localStorage Restoration
- Uses `sanitizeLocalStorageData` to validate stored settings
- Gracefully handles malformed or malicious localStorage data
- Falls back to safe defaults on error

### 5. App.jsx - Column Rename Handler (`setRename`)
- Sanitizes user input for column renames
- Prevents XSS through renamed columns

## Test Coverage

### Security Test Suite
**Location**: `src/test/security.test.js`
**Test Count**: 50 unit tests

#### Test Categories:
1. **String Sanitization Tests** (6 tests)
   - Script tag removal
   - HTML tag removal
   - Nested tags
   - Length limits
   - Non-string inputs

2. **Cell Value Tests** (7 tests)
   - Formula injection prevention (=, +, -, @)
   - HTML removal
   - Null handling
   - Normal text preservation

3. **Column Name Tests** (6 tests)
   - XSS prevention
   - Special character removal
   - Length limits
   - Empty string handling

4. **File Validation Tests** (9 tests)
   - Size limits
   - Extension whitelist
   - Invalid inputs

5. **Filename Tests** (5 tests)
   - Path traversal prevention
   - Special character removal
   - Length limits

6. **localStorage Tests** (6 tests)
   - JSON parsing
   - Type validation
   - Range validation
   - Malformed data handling

7. **Row/Worksheet Tests** (8 tests)
   - Complete data sanitization
   - Null handling
   - Empty data structures

8. **Integration Tests** (3 tests)
   - Complex malicious input
   - Legitimate data preservation

### App Integration Tests
**Location**: `src/test/App.test.jsx`
**Test Count**: 14 tests (4 security-specific)

#### Security Integration Tests:
1. Malicious localStorage handling
2. Invalid JSON in localStorage
3. File input accept attribute validation
4. File type restriction verification

## Security Best Practices Implemented

### 1. Defense in Depth
- Multiple layers of validation
- Sanitization at input, processing, and display stages
- Fail-safe defaults

### 2. Whitelist Approach
- File extensions: only allow known-safe formats
- Analysis types: enum validation
- View modes: enum validation

### 3. Input Validation
- Type checking before processing
- Range validation for numeric inputs
- Length limits on all string inputs

### 4. Output Encoding
- HTML tag removal prevents XSS
- Formula prefix prevents CSV injection
- Special character stripping in filenames

### 5. Error Handling
- Graceful degradation on invalid input
- User-friendly error messages
- Console warnings for debugging (not errors to avoid stack traces)

### 6. No Eval or Dynamic Code
- All parsing is explicit
- No use of eval() or Function()
- No dynamic script loading from user input

## Performance Considerations

- **Minimal Overhead**: Sanitization functions are optimized with single-pass algorithms
- **Lazy Evaluation**: Security checks only run when needed
- **Caching**: No redundant sanitization of already-processed data
- **Regex Optimization**: Pre-compiled patterns at module level

## Threat Model Coverage

### Prevented Attacks:
✅ **Cross-Site Scripting (XSS)** - HTML/script tag removal  
✅ **CSV Injection** - Formula prefix neutralization  
✅ **Path Traversal** - Filename sanitization  
✅ **Denial of Service** - File size limits, string length limits  
✅ **Code Injection** - No eval, sanitized localStorage  
✅ **Data Corruption** - Type validation, safe defaults  

### Out of Scope:
- Server-side attacks (app is client-side only)
- Network attacks (all processing is local)
- Browser vulnerabilities (relies on browser security)

## Future Enhancements

Potential security improvements for future versions:
1. Content Security Policy (CSP) headers
2. Subresource Integrity (SRI) for CDN resources
3. File content signature verification
4. Rate limiting for file uploads
5. Sandboxed iframe for data preview
6. Encrypted localStorage option

## Compliance & Standards

This implementation follows security guidelines from:
- OWASP Top 10 Web Application Security Risks
- CWE/SANS Top 25 Most Dangerous Software Errors
- NIST Secure Software Development Framework

## Conclusion

The Interactive Text Analyzer now has comprehensive, production-ready security measures that:
- Protect users automatically without configuration
- Have zero impact on user experience
- Are thoroughly tested with 50+ unit tests
- Follow industry best practices
- Cover common attack vectors

All security features work transparently in the background, ensuring users are protected even if they upload files containing malicious content.
