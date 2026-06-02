import { NextResponse } from 'next/server'
import { seedGoals, initDatabase } from '../../../../lib/db'

// The 52-day learning plan data
const LEARNING_PLAN = [
  // Phase 1: Advanced Backend & Cloud (Days 1-14)
  { day_number: 1, phase: 'Backend & Cloud', topic: 'REST API Best Practices', description: 'Pagination, Filtering, Sorting — learn how production APIs handle large datasets efficiently.' },
  { day_number: 2, phase: 'Backend & Cloud', topic: 'API Security 101', description: 'Rate Limiting, CORS, OWASP Top 10 — protect your APIs from common attack vectors.' },
  { day_number: 3, phase: 'Backend & Cloud', topic: 'Advanced Authentication (JWT)', description: 'Deep dive into JWT tokens, refresh token rotation, and secure session management.' },
  { day_number: 4, phase: 'Backend & Cloud', topic: 'OAuth 2.0 Implementation', description: 'Implement "Login with Google/GitHub" — understand authorization code flow.' },
  { day_number: 5, phase: 'Backend & Cloud', topic: 'Docker Basics', description: 'Containerizing a Python/Django or Java app — write your first Dockerfile.' },
  { day_number: 6, phase: 'Backend & Cloud', topic: 'Docker Compose', description: 'Running app + PostgreSQL together — multi-container orchestration.' },
  { day_number: 7, phase: 'Backend & Cloud', topic: 'CI/CD with GitHub Actions', description: 'Writing a workflow to run tests automatically on every push.' },
  { day_number: 8, phase: 'Backend & Cloud', topic: 'Cloud Foundations', description: 'Setting up AWS/Azure, understanding IAM, regions, and basic services.' },
  { day_number: 9, phase: 'Backend & Cloud', topic: 'Database Hosting', description: 'Deploying a managed PostgreSQL DB on AWS RDS or Azure Database.' },
  { day_number: 10, phase: 'Backend & Cloud', topic: 'App Deployment', description: 'Deploying a Dockerized app to AWS EC2 or Azure App Service.' },
  { day_number: 11, phase: 'Backend & Cloud', topic: 'Caching with Redis', description: 'Introduction to Redis for faster API responses and session storage.' },
  { day_number: 12, phase: 'Backend & Cloud', topic: 'Message Queues & Celery', description: 'Background task processing — offload heavy work from your API.' },
  { day_number: 13, phase: 'Backend & Cloud', topic: 'Microservices Architecture', description: 'Understanding when and why to split a monolith into services.' },
  { day_number: 14, phase: 'Backend & Cloud', topic: 'Phase 1 Mini-Project', description: 'Deploy a secure, containerized, cached API to the cloud. Tie everything together.' },

  // Phase 2: AI Engineering & Integration (Days 15-28)
  { day_number: 15, phase: 'AI Engineering', topic: 'LLM API Basics', description: 'Setting up OpenAI/Gemini API in Python — your first AI-powered script.' },
  { day_number: 16, phase: 'AI Engineering', topic: 'Prompt Engineering for Devs', description: 'System prompts, few-shot learning, and formatting JSON output from LLMs.' },
  { day_number: 17, phase: 'AI Engineering', topic: 'Building a Chat Endpoint', description: 'Create a backend API that wraps an LLM with conversation memory.' },
  { day_number: 18, phase: 'AI Engineering', topic: 'Introduction to LangChain', description: 'Chains, Models, and Output Parsers — the framework for AI apps.' },
  { day_number: 19, phase: 'AI Engineering', topic: 'Data Parsing with AI', description: 'Extracting structured data from unstructured text (invoices, emails, etc.).' },
  { day_number: 20, phase: 'AI Engineering', topic: 'Vector Databases', description: 'What are embeddings? Setting up Pinecone or ChromaDB.' },
  { day_number: 21, phase: 'AI Engineering', topic: 'Document Ingestion', description: 'Reading PDFs, chunking text, and creating embeddings for search.' },
  { day_number: 22, phase: 'AI Engineering', topic: 'RAG Step 1: Retrieval', description: 'Searching a vector database to find relevant context for a query.' },
  { day_number: 23, phase: 'AI Engineering', topic: 'RAG Step 2: Generation', description: 'Combining retrieved context with an LLM to answer questions accurately.' },
  { day_number: 24, phase: 'AI Engineering', topic: 'Agentic AI Basics', description: 'Giving the LLM tools — search, math, code execution.' },
  { day_number: 25, phase: 'AI Engineering', topic: 'AI Error Handling', description: 'What to do when the LLM hallucinates, timeouts, or returns garbage.' },
  { day_number: 26, phase: 'AI Engineering', topic: 'Optimizing AI Costs', description: 'Token counting, model selection, and caching strategies.' },
  { day_number: 27, phase: 'AI Engineering', topic: 'Vision APIs', description: 'Using AI to analyze images — receipt scanning, object detection.' },
  { day_number: 28, phase: 'AI Engineering', topic: 'Phase 2 Mini-Project', description: 'Add a RAG chatbot to your OMS or Fintech app. Full integration.' },

  // Phase 3: Automation & Scripting (Days 29-38)
  { day_number: 29, phase: 'Automation', topic: 'Advanced Web Scraping', description: 'BeautifulSoup for static sites, handling pagination and rate limits.' },
  { day_number: 30, phase: 'Automation', topic: 'Browser Automation', description: 'Selenium/Playwright basics — automating browser interactions.' },
  { day_number: 31, phase: 'Automation', topic: 'Task Scheduling', description: 'Cron jobs, Windows Task Scheduler — running scripts at specific times.' },
  { day_number: 32, phase: 'Automation', topic: 'Email Automation', description: 'Sending automated emails via SendGrid/Nodemailer with templates.' },
  { day_number: 33, phase: 'Automation', topic: 'ChatOps & Bot Building', description: 'Creating a Slack/Discord bot that reports server status.' },
  { day_number: 34, phase: 'Automation', topic: 'Data Pipelines (ETL)', description: 'Extract → Transform → Load: moving data between systems automatically.' },
  { day_number: 35, phase: 'Automation', topic: 'File Automation', description: 'Scripts to organize, rename, convert, or process files in bulk.' },
  { day_number: 36, phase: 'Automation', topic: 'System Monitoring', description: 'Writing a script that checks if your website is up and alerts you.' },
  { day_number: 37, phase: 'Automation', topic: 'Test Automation', description: 'Writing automated test suites with pytest/JUnit.' },
  { day_number: 38, phase: 'Automation', topic: 'Phase 3 Mini-Project', description: 'Build a job-posting scraper that emails you daily summaries.' },

  // Phase 4: Portfolio & Job Prep (Days 39-52)
  { day_number: 39, phase: 'Job Prep', topic: 'Portfolio Goals Page (Design)', description: 'Design and build the /goals tracker page on maulikjoshi.com.' },
  { day_number: 40, phase: 'Job Prep', topic: 'Portfolio Goals Page (Backend)', description: 'API routes, database, and chatbot integration.' },
  { day_number: 41, phase: 'Job Prep', topic: 'Portfolio Goals Page (Frontend)', description: 'Interactive UI, animations, responsive layout.' },
  { day_number: 42, phase: 'Job Prep', topic: 'Portfolio Goals Page (Deploy)', description: 'Deploy, test, and polish the final version.' },
  { day_number: 43, phase: 'Job Prep', topic: 'Resume Revamp', description: 'Highlight OMS, Fintech, and new AI skills on your resume.' },
  { day_number: 44, phase: 'Job Prep', topic: 'LinkedIn Optimization', description: 'Professional headline, featured projects, and recruiter-friendly profile.' },
  { day_number: 45, phase: 'Job Prep', topic: 'System Design Interview Prep', description: 'How to talk about scaling apps — load balancers, databases, caching.' },
  { day_number: 46, phase: 'Job Prep', topic: 'Behavioral Interview Prep', description: 'The STAR method — Situation, Task, Action, Result.' },
  { day_number: 47, phase: 'Job Prep', topic: 'Mock Technical Interviews', description: 'Practice explaining your code and architecture decisions out loud.' },
  { day_number: 48, phase: 'Job Prep', topic: 'Open Source Contribution', description: 'Find a small bug on GitHub and submit your first PR.' },
  { day_number: 49, phase: 'Job Prep', topic: 'Cold Outreach Strategy', description: 'How to message engineers and recruiters on LinkedIn effectively.' },
  { day_number: 50, phase: 'Job Prep', topic: 'Apply to 20 Jobs', description: 'Targeted applications with customized cover letters.' },
  { day_number: 51, phase: 'Job Prep', topic: 'Buffer Day', description: 'Interview prep, finishing touches on portfolio, or catching up.' },
  { day_number: 52, phase: 'Job Prep', topic: 'Birthday! 🎂', description: 'July 24th — Happy 20th Birthday! Celebrate your massive growth.' },
]

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
