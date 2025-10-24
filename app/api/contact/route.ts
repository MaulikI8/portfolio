import { NextRequest, NextResponse } from 'next/server'
import { addContactSubmission, initDatabase } from '../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    // Initialize database on first request
    await initDatabase()
    
    const { name, email, message } = await request.json()

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Message length validation
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString()
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Log the submission
    console.log('📊 Contact form submission:', {
      name,
      email,
      message: message.substring(0, 50) + '...', // Log first 50 chars only
      timestamp,
      ip,
    })

    // Add to database
    const savedSubmission = await addContactSubmission({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      timestamp,
      ip,
    })

    return NextResponse.json(
      { 
        message: 'Message saved successfully! I\'ll get back to you soon.',
        timestamp,
        saved: true,
        id: savedSubmission.id
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again or email me directly.' },
      { status: 500 }
    )
  }
}
