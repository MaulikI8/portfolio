import { NextResponse } from 'next/server'
import { seedGoals, initDatabase } from '../../../../lib/db'

// The 52-day learning plan data
import { GOALS_DATA } from '../../../goals/data'

const LEARNING_PLAN = GOALS_DATA;

// POST /api/goals/seed — one-time seeding of all 52 days
export async function POST() {
  try {
    await initDatabase()

    // Calculate dates starting from June 3, 2026 (Day 1)
    const startDate = new Date('2026-06-03')
    const goalsWithDates = LEARNING_PLAN.map((goal) => ({
      ...goal,
      date: new Date(startDate.getTime() + (goal.day_number - 1) * 86400000)
        .toISOString()
        .split('T')[0],
    }))

    await seedGoals(goalsWithDates)

    return NextResponse.json(
      { message: `Successfully seeded ${goalsWithDates.length} goals`, count: goalsWithDates.length },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error seeding goals:', error)
    return NextResponse.json({ error: 'Failed to seed goals' }, { status: 500 })
  }
}
