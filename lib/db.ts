// Database connection and schema setup for Vercel Postgres
import { sql } from '@vercel/postgres'

export interface ContactSubmission {
  id: number
  name: string
  email: string
  message: string
  timestamp: string
  ip?: string
}

// Initialize the database table
export async function initDatabase() {
  try {
    // Create contact_submissions table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ip VARCHAR(45)
      )
    `
    console.log('✅ Database table initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}

// Add a new contact submission
export async function addContactSubmission(submission: Omit<ContactSubmission, 'id'>) {
  try {
    const result = await sql`
      INSERT INTO contact_submissions (name, email, message, timestamp, ip)
      VALUES (${submission.name}, ${submission.email}, ${submission.message}, ${submission.timestamp}, ${submission.ip || null})
      RETURNING id, name, email, message, timestamp, ip
    `
    
    console.log(`✅ Contact submission added to database: ${submission.name} (${submission.email})`)
    return result.rows[0] as ContactSubmission
  } catch (error) {
    console.error('❌ Error adding contact submission to database:', error)
    throw error
  }
}

// Get all contact submissions
export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const result = await sql`
      SELECT id, name, email, message, timestamp, ip
      FROM contact_submissions
      ORDER BY timestamp DESC
    `
    return result.rows as ContactSubmission[]
  } catch (error) {
    console.error('❌ Error fetching contact submissions:', error)
    return []
  }
}

// Get contact submissions count
export async function getContactSubmissionsCount(): Promise<number> {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM contact_submissions`
    return parseInt(result.rows[0].count)
  } catch (error) {
    console.error('❌ Error getting contact submissions count:', error)
    return 0
  }
}
