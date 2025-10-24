import { NextRequest, NextResponse } from 'next/server'
import { getAllContactSubmissions, getContactSubmissionsCount } from '../../../lib/db'

// GET all contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // Simple admin check - you can enhance this with proper authentication
    const authHeader = request.headers.get('authorization')
    const adminKey = process.env.ADMIN_KEY || 'admin123' // Set this in Vercel environment variables
    
    if (authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const submissions = await getAllContactSubmissions()
    const count = await getContactSubmissionsCount()

    return NextResponse.json({
      submissions,
      count,
      message: `Found ${count} contact submissions`
    })
  } catch (error) {
    console.error('❌ Error fetching contact submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
