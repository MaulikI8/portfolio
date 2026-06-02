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

export interface DailyGoal {
  id: number
  day_number: number
  date: string
  phase: string
  topic: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  hours_spent: number
  notes: string | null
  completed_at: string | null
  created_at: string
}

export interface ChatMessage {
  id: number
  session_id: string
  role: 'user' | 'model'
  content: string
  created_at: string
}

// Initialize the database tables
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

    // Create daily_goals table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_goals (
        id SERIAL PRIMARY KEY,
        day_number INTEGER NOT NULL UNIQUE,
        date DATE NOT NULL,
        phase VARCHAR(50) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        hours_spent DECIMAL(3,1) DEFAULT 0,
        notes TEXT,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create chat_messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    console.log('✅ Database tables initialized successfully')
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

// ============================================================================
// GOALS
// ============================================================================

export async function getAllGoals(): Promise<DailyGoal[]> {
  try {
    const result = await sql`
      SELECT id, day_number, date, phase, topic, description, status, hours_spent, notes, completed_at, created_at
      FROM daily_goals
      ORDER BY day_number ASC
    `
    return result.rows as DailyGoal[]
  } catch (error) {
    console.error('❌ Error fetching goals:', error)
    return []
  }
}

export async function updateGoal(
  dayNumber: number,
  updates: { status?: string; hours_spent?: number; notes?: string }
) {
  try {
    const completedAt = updates.status === 'completed' ? new Date().toISOString() : null

    const result = await sql`
      UPDATE daily_goals
      SET 
        status = COALESCE(${updates.status || null}, status),
        hours_spent = COALESCE(${updates.hours_spent ?? null}, hours_spent),
        notes = COALESCE(${updates.notes || null}, notes),
        completed_at = CASE WHEN ${updates.status || null} = 'completed' THEN ${completedAt} ELSE completed_at END
      WHERE day_number = ${dayNumber}
      RETURNING *
    `
    return result.rows[0] as DailyGoal
  } catch (error) {
    console.error('❌ Error updating goal:', error)
    throw error
  }
}

export async function seedGoals(goals: Omit<DailyGoal, 'id' | 'created_at' | 'completed_at' | 'status' | 'hours_spent' | 'notes'>[]) {
  try {
    for (const goal of goals) {
      await sql`
        INSERT INTO daily_goals (day_number, date, phase, topic, description)
        VALUES (${goal.day_number}, ${goal.date}, ${goal.phase}, ${goal.topic}, ${goal.description})
        ON CONFLICT (day_number) DO NOTHING
      `
    }
    console.log(`✅ Seeded ${goals.length} goals`)
  } catch (error) {
    console.error('❌ Error seeding goals:', error)
    throw error
  }
}

// ============================================================================
// CHAT
// ============================================================================

export async function saveChatMessage(sessionId: string, role: string, content: string) {
  try {
    await sql`
      INSERT INTO chat_messages (session_id, role, content)
      VALUES (${sessionId}, ${role}, ${content})
    `
  } catch (error) {
    console.error('❌ Error saving chat message:', error)
  }
}

export async function getChatHistory(sessionId: string, limit: number = 20): Promise<ChatMessage[]> {
  try {
    const result = await sql`
      SELECT id, session_id, role, content, created_at
      FROM chat_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return (result.rows as ChatMessage[]).reverse()
  } catch (error) {
    console.error('❌ Error fetching chat history:', error)
    return []
  }
}
