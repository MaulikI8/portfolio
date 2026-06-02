import { NextRequest, NextResponse } from 'next/server'
import { getAllGoals, updateGoal, initDatabase } from '../../../lib/db'

// GET /api/goals — fetch all 52 days
export async function GET() {
  try {
    await initDatabase()
    const goals = await getAllGoals()
    return NextResponse.json({ goals }, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

// PATCH /api/goals — update a day's status/notes/hours
export async function PATCH(request: NextRequest) {
  try {
    await initDatabase()
    const { dayNumber, status, hours_spent, notes } = await request.json()

    if (!dayNumber) {
      return NextResponse.json({ error: 'dayNumber is required' }, { status: 400 })
    }

    if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (hours_spent !== undefined && (hours_spent < 0 || hours_spent > 24)) {
      return NextResponse.json({ error: 'hours_spent must be between 0 and 24' }, { status: 400 })
    }

    const updated = await updateGoal(dayNumber, { status, hours_spent, notes })
    return NextResponse.json({ goal: updated }, { status: 200 })
  } catch (error) {
    console.error('❌ Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}
