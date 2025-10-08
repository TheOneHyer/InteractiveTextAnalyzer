import ExcelJS from 'exceljs'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function createTestExcelFile() {
  const workbook = new ExcelJS.Workbook()
  
  // Create Q1 Sales sheet with standard columns
  const q1Sheet = workbook.addWorksheet('Q1 Sales')
  q1Sheet.columns = [
    { header: 'ProductID', key: 'productid' },
    { header: 'Product Name', key: 'productname' },
    { header: 'Price', key: 'price' },
    { header: 'Quantity', key: 'quantity' },
    { header: 'Revenue', key: 'revenue' }
  ]
  
  const q1Data = [
    { productid: 'P001', productname: 'Widget A', price: 10.99, quantity: 150, revenue: 1648.50 },
    { productid: 'P002', productname: 'Widget B', price: 15.99, quantity: 120, revenue: 1918.80 },
    { productid: 'P003', productname: 'Widget C', price: 20.99, quantity: 90, revenue: 1889.10 },
    { productid: 'P004', productname: 'Gadget A', price: 25.99, quantity: 80, revenue: 2079.20 },
    { productid: 'P005', productname: 'Gadget B', price: 30.99, quantity: 60, revenue: 1859.40 }
  ]
  q1Data.forEach(row => q1Sheet.addRow(row))
  
  // Create Q2 Sales sheet with similar columns (slightly different names)
  const q2Sheet = workbook.addWorksheet('Q2 Sales')
  q2Sheet.columns = [
    { header: 'Product-ID', key: 'productid' },
    { header: 'Product_Name', key: 'productname' },
    { header: 'Unit Price', key: 'unitprice' },
    { header: 'Units Sold', key: 'unitssold' },
    { header: 'Total Revenue', key: 'totalrevenue' }
  ]
  
  const q2Data = [
    { productid: 'P001', productname: 'Widget A', unitprice: 10.99, unitssold: 175, totalrevenue: 1923.25 },
    { productid: 'P002', productname: 'Widget B', unitprice: 15.99, unitssold: 140, totalrevenue: 2238.60 },
    { productid: 'P003', productname: 'Widget C', unitprice: 20.99, unitssold: 105, totalrevenue: 2203.95 },
    { productid: 'P006', productname: 'Gadget C', unitprice: 35.99, unitssold: 70, totalrevenue: 2519.30 },
    { productid: 'P007', productname: 'Tool A', unitprice: 45.99, unitssold: 50, totalrevenue: 2299.50 }
  ]
  q2Data.forEach(row => q2Sheet.addRow(row))
  
  // Create Document Info metadata sheet with completely different columns
  const metadataSheet = workbook.addWorksheet('Document Info')
  metadataSheet.columns = [
    { header: 'Property', key: 'property' },
    { header: 'Value', key: 'value' },
    { header: 'Notes', key: 'notes' }
  ]
  
  const metadataData = [
    { property: 'Author', value: 'Sales Department', notes: 'Generated from sales system' },
    { property: 'Created Date', value: '2024-01-01', notes: 'Q1 report creation date' },
    { property: 'Last Modified', value: '2024-07-01', notes: 'Updated with Q2 data' },
    { property: 'Version', value: '2.0', notes: 'Includes both Q1 and Q2' },
    { property: 'Fiscal Year', value: '2024', notes: 'Calendar year basis' },
    { property: 'Currency', value: 'USD', notes: 'All amounts in US Dollars' },
    { property: 'Report Type', value: 'Quarterly Sales Summary', notes: 'Executive summary' }
  ]
  metadataData.forEach(row => metadataSheet.addRow(row))
  
  // Save the workbook
  const buffer = await workbook.xlsx.writeBuffer()
  const outputPath = join(__dirname, '..', 'public', 'sample-sales-data.xlsx')
  writeFileSync(outputPath, buffer)
  
  console.log('✓ Test Excel file created:', outputPath)
  console.log('✓ Contains 3 sheets:')
  console.log('  - Q1 Sales (data sheet with ProductID, Product Name, Price, Quantity, Revenue)')
  console.log('  - Q2 Sales (data sheet with Product-ID, Product_Name, Unit Price, Units Sold, Total Revenue)')
  console.log('  - Document Info (metadata sheet with Property, Value, Notes)')
}

createTestExcelFile().catch(console.error)
