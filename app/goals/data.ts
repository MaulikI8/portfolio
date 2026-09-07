export interface GoalDay {
  id?: number;
  day_number: number;
  date: string;
  phase: string;
  topic: string;
  description: string;
  status?: 'completed' | 'in_progress' | 'pending';
  hours_spent?: number;
  notes?: string | null;
  completed_at?: string | null;
}

export const GOALS_DATA: GoalDay[] = [
  { day_number: 1, date: '2026-06-03', phase: 'Core Tech', topic: 'TypeScript Advanced Types', description: 'Deep dive into generics, conditional types, and utility types.' },
  { day_number: 2, date: '2026-06-04', phase: 'Core Tech', topic: 'React 18 Concurrent Rendering', description: 'Master useTransition, useDeferredValue, and suspense patterns.' },
  { day_number: 3, date: '2026-06-05', phase: 'Core Tech', topic: 'Next.js App Router & Server Components', description: 'RSC vs Client components, streaming, and server actions.' },
  { day_number: 4, date: '2026-06-06', phase: 'Core Tech', topic: 'State Management Architecture', description: 'Zustand vs Redux Toolkit vs Jotai evaluation & benchmarks.' },
  { day_number: 5, date: '2026-06-07', phase: 'Core Tech', topic: 'CSS Architecture & Design Systems', description: 'Tailwind CSS v4, CSS Modules, and design token strategy.' },
  { day_number: 6, date: '2026-06-08', phase: 'Core Tech', topic: 'Web Vitals & Performance Optimization', description: 'LCP, CLS, INP profiling and image/bundle optimization.' },
  { day_number: 7, date: '2026-06-09', phase: 'Core Tech', topic: 'Node.js Event Loop & Performance', description: 'Event loop phases, worker threads, and memory profiling.' },
  { day_number: 8, date: '2026-06-10', phase: 'Core Tech', topic: 'Express / Fastify REST API Design', description: 'RESTful best practices, OpenAPI spec, and validation middleware.' },
  { day_number: 9, date: '2026-06-11', phase: 'Core Tech', topic: 'GraphQL Architecture', description: 'Apollo Server, schema design, resolvers, and dataloader optimization.' },
  { day_number: 10, date: '2026-06-12', phase: 'Core Tech', topic: 'PostgreSQL Deep Dive', description: 'Indexing strategies, query execution plans, and transaction isolation.' },
  { day_number: 11, date: '2026-06-13', phase: 'Core Tech', topic: 'Prisma & Drizzle ORM', description: 'ORM migration strategies, type safety, and query benchmarks.' },
  { day_number: 12, date: '2026-06-14', phase: 'Core Tech', topic: 'Redis Caching & Pub/Sub', description: 'Cache invalidation, rate limiting, and real-time message queueing.' },
  { day_number: 13, date: '2026-06-15', phase: 'Core Tech', topic: 'Docker & Containerization', description: 'Multi-stage Dockerfiles, compose setups, and image optimization.' },
  { day_number: 14, date: '2026-06-16', phase: 'Core Tech', topic: 'CI/CD Pipelines with GitHub Actions', description: 'Automated testing, linting, building, and deployment workflows.' },
  { day_number: 15, date: '2026-06-17', phase: 'Projects', topic: 'Shipra OMS — System Architecture', description: 'Design microservices architecture for multi-warehouse order management.' },
  { day_number: 16, date: '2026-06-18', phase: 'Projects', topic: 'Shipra OMS — Database Schema', description: 'Design PostgreSQL schema for orders, inventory, warehouses, and SKU mapping.' },
  { day_number: 17, date: '2026-06-19', phase: 'Projects', topic: 'Shipra OMS — Smart Allocation Engine', description: 'Algorithm for optimal warehouse selection based on proximity & stock.' },
  { day_number: 18, date: '2026-06-20', phase: 'Projects', topic: 'Shipra OMS — Real-time Inventory Sync', description: 'WebSocket integration for live stock updates across multi-device dashboards.' },
  { day_number: 19, date: '2026-06-21', phase: 'Projects', topic: 'Shipra OMS — 3D Globe Visualization', description: 'Three.js / Canvas 3D visualization for order routes & global distribution.' },
  { day_number: 20, date: '2026-06-22', phase: 'Projects', topic: 'Shipra OMS — Purchase Order Workflow', description: 'Supplier management, PO generation, and automated inventory restock.' },
  { day_number: 21, date: '2026-06-23', phase: 'Projects', topic: 'CV Craft Pro — AI Resume Generator', description: 'Integrate OpenAI / Gemini API for bullet point enhancement.' },
  { day_number: 22, date: '2026-06-24', phase: 'Projects', topic: 'CV Craft Pro — ATS Scoring Engine', description: 'Keyword matching, formatting parser, and ATS compatibility score algorithm.' },
  { day_number: 23, date: '2026-06-25', phase: 'Projects', topic: 'CV Craft Pro — PDF Export Engine', description: 'Pixel-perfect PDF generation using React-PDF / Puppeteer.' },
  { day_number: 24, date: '2026-06-26', phase: 'Projects', topic: 'Imperial Watch — Luxury E-Commerce UI', description: 'High-end responsive catalog, interactive watch customizer, and cart.' },
  { day_number: 25, date: '2026-06-27', phase: 'Projects', topic: 'Gym Management System — Desktop UI', description: 'Java Swing / JavaFX dashboard for member registration and billing.' },
  { day_number: 26, date: '2026-06-28', phase: 'Projects', topic: 'Gym Management System — MySQL Integration', description: 'JDBC persistence layer, stored procedures, and revenue analytics.' },
  { day_number: 27, date: '2026-06-29', phase: 'CS Fundamentals', topic: 'Data Structures — Trees & Graphs', description: 'Implement Binary Search Trees, AVL Trees, BFS, DFS, and Dijkstra.' },
  { day_number: 28, date: '2026-06-30', phase: 'CS Fundamentals', topic: 'Dynamic Programming & Recursion', description: 'Memoization, tabulation, knapsack, and longest common subsequence.' },
  { day_number: 29, date: '2026-07-01', phase: 'CS Fundamentals', topic: 'System Design — Rate Limiting & Load Balancing', description: 'Leaky bucket, token bucket algorithms, Nginx load balancing setups.' },
  { day_number: 30, date: '2026-07-02', phase: 'CS Fundamentals', topic: 'System Design — Distributed Caching & Message Queues', description: 'Redis Cluster, RabbitMQ vs Kafka architectures for event streaming.' },
  { day_number: 31, date: '2026-07-03', phase: 'Job Prep', topic: 'Resume & Portfolio Refresh', description: 'Update portfolio with latest projects, metric-driven achievements, and clean UI.' },
  { day_number: 32, date: '2026-07-04', phase: 'Job Prep', topic: 'LinkedIn & GitHub Profile Optimization', description: 'Pin top repos, write technical READMEs, and craft compelling LinkedIn profile.' },
  { day_number: 33, date: '2026-07-05', phase: 'Job Prep', topic: 'LeetCode / DSA Interview Practice (Medium)', description: 'Solve 10+ LeetCode Medium problems covering Arrays, Strings, and HashTables.' },
  { day_number: 34, date: '2026-07-06', phase: 'Job Prep', topic: 'LeetCode / DSA Interview Practice (Hard)', description: 'Solve 5+ LeetCode Hard problems on Graphs, DP, and Monotonic Stacks.' },
  { day_number: 35, date: '2026-07-07', phase: 'Job Prep', topic: 'System Design Interview Practice', description: 'Mock design of URL Shortener, Chat App, and Order Management System.' },
  { day_number: 36, date: '2026-07-08', phase: 'Job Prep', topic: 'Behavioral & STAR Method Interview Prep', description: 'Prepare answers for teamwork, conflict resolution, and complex problem scenarios.' },
  { day_number: 37, date: '2026-07-09', phase: 'Job Prep', topic: 'Mock Technical Interview Session', description: 'Conduct timed mock technical interview with full code output and system design.' },
  { day_number: 38, date: '2026-07-10', phase: 'Job Prep', topic: 'Full Stack Open Source Contribution', description: 'Submit PRs to popular React / Node.js open-source repositories.' },
  { day_number: 39, date: '2026-07-11', phase: 'Job Prep', topic: 'Portfolio Goals Page (Design)', description: 'Design and build the /goals tracker page on maulikjoshi.com.' },
  { day_number: 40, date: '2026-07-12', phase: 'Job Prep', topic: 'Portfolio Goals Page (API & DB)', description: 'Set up Postgres DB and REST endpoints for goals tracking.' },
  { day_number: 41, date: '2026-07-13', phase: 'Job Prep', topic: 'Portfolio Goals Page (Email Notifications)', description: 'Integrate Resend / EmailJS for daily goals digest notifications.' },
  { day_number: 42, date: '2026-07-14', phase: 'Job Prep', topic: 'Production Deployment & Monitoring', description: 'Deploy Next.js to Vercel, set up Sentry error tracking & analytics.' },
  { day_number: 43, date: '2026-07-15', phase: 'Job Prep', topic: 'Job Application Wave 1', description: 'Apply to top 15 Software Engineer / Full-Stack Developer positions.' },
  { day_number: 44, date: '2026-07-16', phase: 'Job Prep', topic: 'Recruiter Outreach & Networking', description: 'Reach out to tech recruiters and engineering leads at target companies.' },
  { day_number: 45, date: '2026-07-17', phase: 'Job Prep', topic: 'Code Review & Refactoring Best Practices', description: 'Clean code principles, ESLint rule enforcement, and TypeScript strict mode.' },
  { day_number: 46, date: '2026-07-18', phase: 'Job Prep', topic: 'Frontend Performance Audit', description: 'Lighthouse audit, bundle size reduction, and critical CSS inline optimization.' },
  { day_number: 47, date: '2026-07-19', phase: 'Job Prep', topic: 'Backend Security Audit', description: 'OWASP top 10 review, rate limiting, SQL injection & XSS prevention.' },
  { day_number: 48, date: '2026-07-20', phase: 'Job Prep', topic: 'Job Application Wave 2', description: 'Apply to top 20 Software Engineer / Full-Stack Developer positions.' },
  { day_number: 49, date: '2026-07-21', phase: 'Job Prep', topic: 'Interview Follow-ups & Coding Take-homes', description: 'Complete company take-home coding challenges with unit test coverage.' },
  { day_number: 50, date: '2026-07-22', phase: 'Job Prep', topic: 'Salary Negotiation & Offer Evaluation', description: 'Study tech compensation structures, negotiation scripts, and equity grants.' },
  { day_number: 51, date: '2026-07-23', phase: 'Job Prep', topic: 'Final Portfolio & Documentation Polish', description: 'Polishing documentation, READMEs, and production project demos.' },
  { day_number: 52, date: '2026-07-24', phase: 'Job Prep', topic: 'Goal Completed — Launch & Celebration', description: 'All 52 goals completed. Celebrate full-stack mastery and ongoing career success!' }
];
