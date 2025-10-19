import * as XLSX from 'xlsx'
import { promises as fs } from 'fs'
import path from 'path'

export interface ContactSubmission {
  name: string
  email: string
  message: string
  timestamp: string
  ip?: string
}

const EXCEL_FILE_PATH = path.join(process.cwd(), 'data', 'contact_submissions.xlsx')

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.dirname(EXCEL_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Read existing Excel file or create new one
const readOrCreateExcel = async (): Promise<ContactSubmission[]> => {
  await ensureDataDirectory()
  
  try {
    // Try to read existing file
    const fileBuffer = await fs.readFile(EXCEL_FILE_PATH)
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json<ContactSubmission>(worksheet)
    return data || []
  } catch (error) {
    // File doesn't exist or is corrupted, create new one
    console.log('📊 Creating new Excel file for contact submissions')
    return []
  }
}

// Write data to Excel file
const writeToExcel = async (data: ContactSubmission[]) => {
  await ensureDataDirectory()
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 20 }, // Name
    { wch: 30 }, // Email
    { wch: 50 }, // Message
    { wch: 20 }, // Timestamp
    { wch: 15 }, // IP
  ]
  worksheet['!cols'] = columnWidths
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Submissions')
  
  // Write file
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  await fs.writeFile(EXCEL_FILE_PATH, buffer)
  
  console.log(`📊 Excel file updated with ${data.length} contact submissions`)
}

// Add new contact submission
export const addContactSubmission = async (submission: ContactSubmission): Promise<void> => {
  try {
    // Read existing data
    const existingData = await readOrCreateExcel()
    
    // Add new submission
    const updatedData = [...existingData, submission]
    
    // Write back to Excel
    await writeToExcel(updatedData)
    
    console.log(`✅ Contact submission added to Excel: ${submission.name} (${submission.email})`)
  } catch (error) {
    console.error('❌ Error adding contact submission to Excel:', error)
    throw error
  }
}

// Get all contact submissions
export const getAllContactSubmissions = async (): Promise<ContactSubmission[]> => {
  try {
    return await readOrCreateExcel()
  } catch (error) {
    console.error('❌ Error reading contact submissions from Excel:', error)
    return []
  }
}

// Get Excel file path (for downloading)
export const getExcelFilePath = (): string => {
  return EXCEL_FILE_PATH
}
