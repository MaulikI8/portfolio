'use client'

/**
 * ============================================================================
 * MAULIK JOSHI PORTFOLIO - CYBER-GLASS EDITION (v2.4 - FLOATING DOCK)
 * ============================================================================
 * * UPDATES:
 * - Navigation is now a floating dock (bottom-10).
 * - Navigation is 100% transparent by default, becoming glass on hover.
 * - LiveClock moved to floating bottom-left position.
 * - Maintained all "Sentient" and "Cyber-Glass" features.
 */

import { useState, useEffect, useRef, ReactNode } from 'react'
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionTemplate, 
  useMotionValue, 
  AnimatePresence,
  useInView
} from 'framer-motion'
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Code2, 
  Database, 
  Cpu, 
  Layers, 
  Globe, 
  GraduationCap, 
  ChevronRight, 
  Download,
  Terminal, 
  Server, 
  Layout, 
  Box, 
  Award, 
  Command, 
  Hash, 
  User,
  Zap,
  Shield,
  Search,
  Menu,
  X,
  ArrowRight,
  GitBranch,
  Coffee,
  Briefcase,
  Monitor,
  Smartphone,
  Cloud,
  Lock,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  MapPin
} from 'lucide-react'

// ============================================================================
// 2. TYPES & INTERFACES
// ============================================================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SkillItem {
  name: string;
  level: number; // 0-100
  icon: React.ElementType;
  category: 'frontend' | 'backend' | 'devops' | 'tools';
}

interface ProjectItem {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  tech: string[];
  features: string[];
  link: string;
  github: string;
  image?: string;
  status: 'completed' | 'in-progress' | 'maintenance';
}

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
  type: 'education' | 'work';
}

interface ServiceItem {
  title: string;
  description: string;
  icon: React.ElementType;
  price?: string;
  features: string[];
}

interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
  icon: React.ElementType;
}

interface FaqItem {
  question: string;
  answer: string;
}

// ============================================================================
// 3. PORTFOLIO DATA (CONTENT LAYER)
// ============================================================================

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '#hero', icon: Command },
  { label: 'About', href: '#about', icon: User },
  { label: 'Services', href: '#services', icon: Zap },
  { label: 'Experience', href: '#experience', icon: Briefcase },
  { label: 'Projects', href: '#projects', icon: Layers },
  { label: 'Contact', href: '#contact', icon: Mail },
];

const SKILLS_DATA: SkillItem[] = [
  // Frontend
  { name: 'React.js', level: 90, icon: Globe, category: 'frontend' },
  { name: 'Next.js', level: 85, icon: Layout, category: 'frontend' },
  { name: 'TypeScript', level: 80, icon: Code2, category: 'frontend' },
  { name: 'Tailwind CSS', level: 95, icon: Layers, category: 'frontend' },
  // Backend
  { name: 'Python', level: 92, icon: Terminal, category: 'backend' },
  { name: 'Django', level: 88, icon: Box, category: 'backend' },
  { name: 'Java', level: 85, icon: Coffee, category: 'backend' },
  { name: 'Node.js', level: 80, icon: Server, category: 'backend' },
  // Database
  { name: 'PostgreSQL', level: 85, icon: Database, category: 'backend' },
  { name: 'MongoDB', level: 75, icon: Database, category: 'backend' },
  // DevOps & Tools
  { name: 'Git/GitHub', level: 90, icon: GitBranch, category: 'tools' },
  { name: 'Docker', level: 70, icon: ContainerIcon, category: 'devops' },
  { name: 'AWS Basics', level: 60, icon: Cloud, category: 'devops' },
  { name: 'Linux', level: 75, icon: Terminal, category: 'tools' },
];

// Helper for Icon in data
function ContainerIcon(props: any) { return <Box {...props} /> }

const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    id: 'exp-01',
    role: 'BSc (Hons) Computing Student',
    company: 'London Metropolitan University',
    period: '2024 - Present',
    description: 'Currently pursuing an honors degree with a focus on Software Engineering, Data Structures, and System Architecture. Consistently maintaining high academic standing while leading student developer groups.',
    skills: ['Algorithms', 'System Design', 'Agile', 'Team Leadership'],
    type: 'education'
  },
  {
    id: 'exp-02',
    role: 'Freelance Full-Stack Developer',
    company: 'Self-Employed',
    period: '2023 - Present',
    description: 'Developing custom web solutions for diverse clients. specializing in high-performance e-commerce platforms and business automation tools. Managed full project lifecycles from requirement gathering to deployment.',
    skills: ['Client Communication', 'Full Stack Dev', 'Project Management'],
    type: 'work'
  },
  {
    id: 'exp-03',
    role: 'Self-Directed Learning Intensive',
    company: 'Various Platforms',
    period: '2023 - 2024',
    description: 'Completed rigourous coursework in Python, Java, and Web Development technologies. Built over 15 practice projects to solidify understanding of core computer science concepts.',
    skills: ['Python', 'Java', 'Web Standards', 'Self-Discipline'],
    type: 'education'
  }
];

const SERVICES_DATA: ServiceItem[] = [
  {
    title: 'Full-Stack Development',
    description: 'End-to-end web application development using modern stacks like MERN or Django/React.',
    icon: Layers,
    features: ['Responsive UI/UX', 'Secure API Integration', 'Database Optimization', 'Scalable Architecture']
  },
  {
    title: 'Backend Engineering',
    description: 'Robust server-side logic, API development, and database management for high-load systems.',
    icon: Server,
    features: ['REST & GraphQL APIs', 'Microservices', 'Auth & Security', 'Data Migration']
  },
  {
    title: 'Custom Software Solutions',
    description: 'Tailored desktop and web applications to automate business processes and workflows.',
    icon: Monitor,
    features: ['Java Swing Apps', 'Automation Scripts', 'Internal Tools', 'Legacy Modernization']
  }
];

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: '01',
    title: 'Imperial Watch Store',
    shortDesc: 'Luxury e-commerce platform with advanced cart logic.',
    longDesc: 'A premium e-commerce experience designed for luxury timepieces. Features a custom-built shopping cart engine, real-time inventory management simulation, and a responsive design that emphasizes visual storytelling. Optimized for performance and SEO.',
    tech: ['JavaScript', 'CSS3', 'HTML5', 'LocalStorage'],
    features: ['Dynamic Cart System', 'Product Filtering', 'Responsive Layout', 'Checkout Simulation'],
    link: 'https://github.com/MaulikI8/imperialwatch',
    github: 'https://github.com/MaulikI8/imperialwatch',
    status: 'completed'
  },
  {
    id: '02',
    title: 'Gym Management System',
    shortDesc: 'Java Swing desktop app for membership tracking.',
    longDesc: 'A comprehensive desktop solution for fitness centers. Allows administrators to manage member profiles, track subscription status, process payments, and generate monthly revenue reports. Built with a focus on data integrity and user-friendly interface design.',
    tech: ['Java', 'Swing', 'JDBC', 'MySQL'],
    features: ['Member Database', 'Payment Tracking', 'Report Generation', 'Role-based Access'],
    link: 'https://github.com/MaulikI8/GYM',
    github: 'https://github.com/MaulikI8/GYM',
    status: 'completed'
  },
  {
    id: '03',
    title: 'CV Craft Pro',
    shortDesc: 'AI-powered resume builder for professionals.',
    longDesc: 'An intelligent web application that helps job seekers create ATS-friendly resumes. Leverages AI to suggest content improvements, formatting adjustments, and skill keywords based on target job descriptions. Features PDF export and user account management.',
    tech: ['React', 'Django', 'PostgreSQL', 'OpenAI API'],
    features: ['AI Suggestions', 'PDF Generation', 'Template System', 'User Authentication'],
    link: 'https://cvcraftproapp.vercel.app',
    github: 'https://github.com/MaulikI8',
    status: 'completed'
  },
  {
    id: '04',
    title: 'TaskFlow Manager',
    shortDesc: 'Real-time collaborative task management SaaS.',
    longDesc: 'A productivity tool designed for distributed teams. Supports real-time updates using WebSockets, kanban-style boards, and team permission management. Implements modern patterns for state management and optimistic UI updates.',
    tech: ['Next.js', 'Prisma', 'TypeScript', 'WebSockets'],
    features: ['Real-time Sync', 'Kanban Boards', 'Team Collaboration', 'Drag & Drop'],
    link: 'https://taskflow-manager.vercel.app',
    github: 'https://github.com/MaulikI8',
    status: 'in-progress'
  }
];

const CERTIFICATES_DATA: CertificateItem[] = [
  {
    id: 'cert-01',
    name: 'Meta Backend Developer',
    issuer: 'Meta (Coursera)',
    date: '2025',
    url: 'https://coursera.org/share/1725d006a6476fc3f1129f0899b7f4d9',
    icon: Database
  },
  {
    id: 'cert-02',
    name: 'Python for Everybody',
    issuer: 'University of Michigan',
    date: '2025',
    url: 'https://coursera.org/share/ff3930e0f4ef016276d73598d5654c61',
    icon: Terminal
  }
];

const FAQ_DATA: FaqItem[] = [
  {
    question: "Are you available for freelance work?",
    answer: "Yes, I am currently accepting new projects. I specialize in building MVPs, landing pages, and backend integrations for startups and small businesses."
  },
  {
    question: "What is your preferred tech stack?",
    answer: "For web apps, I prefer the T3 stack (Next.js, TypeScript, Tailwind, Prisma) or a Django/React combination depending on the complexity. For desktop, I use Java."
  },
  {
    question: "Do you offer ongoing maintenance?",
    answer: "Absolutely. I believe software is a living entity. I offer maintenance packages to ensure your application stays secure, updated, and performant."
  }
];

// ============================================================================
// 4. UI PRIMITIVES & UTILITIES
// ============================================================================

// --- Decrypted Text Effect (The "Hacker" Nod) ---
// Scrambles text on view and then resolves to the final string
function DecryptedText({ text, className = "" }: { text: string, className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const isInView = useInView(useRef(null), { once: true });
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

  useEffect(() => {
    if (!isInView) return;
    
    let iterations = 0;
    setIsScrambling(true);
    
    const interval = setInterval(() => {
      setDisplayText(text.split("")
        .map((letter, index) => {
          if (index < iterations) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("")
      );
      
      if (iterations >= text.length) {
        clearInterval(interval);
        setIsScrambling(false);
      }
      
      iterations += 1/3; // Speed control
    }, 30);
    
    return () => clearInterval(interval);
  }, [text, isInView]);

  // Motion ref wrapper
  const ref = useRef(null);

  return (
    <motion.span ref={ref} className={`${className} ${isScrambling ? 'text-cyan-400' : ''}`}>
      {displayText}
    </motion.span>
  );
}

// --- Live Clock Widget (Generic Location) ---
function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      // Local time of the developer (UTC+5:45)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const devTime = new Date(utc + (3600000 * 5.75));
      
      setTime(devTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-mono text-slate-400 shadow-lg">
      <Clock className="w-3 h-3 text-cyan-400" />
      <span>LOC: {time}</span>
    </div>
  );
}

// --- Glass Card with Neon Spotlight ---
function CyberCard({ 
  children, 
  className = "", 
  titleBar = false,
  glowColor = "cyan" 
}: { 
  children: ReactNode, 
  className?: string, 
  titleBar?: boolean,
  glowColor?: "cyan" | "green" | "purple" | "blue"
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const glowColors = {
    cyan: "rgba(6, 182, 212, 0.15)",
    green: "rgba(34, 197, 94, 0.15)",
    purple: "rgba(168, 85, 247, 0.15)",
    blue: "rgba(59, 130, 246, 0.15)"
  };

  const borderColors = {
    cyan: "group-hover:border-cyan-500/30",
    green: "group-hover:border-green-500/30",
    purple: "group-hover:border-purple-500/30",
    blue: "group-hover:border-blue-500/30"
  };

  return (
    <div
      className={`
        group relative overflow-hidden
        bg-black/40 backdrop-blur-xl
        border border-white/10
        rounded-2xl
        transition-all duration-500
        ${borderColors[glowColor]}
        hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]
        ${className}
      `}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${glowColors[glowColor]},
              transparent 80%
            )
          `,
        }}
      />
      
      {titleBar && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            User: Visitor
          </div>
        </div>
      )}

      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  )
}

// --- Tech Badge (Monospace) ---
const TechBadge = ({ children }: { children: ReactNode }) => (
  <span className="
    inline-flex items-center px-2.5 py-1 
    rounded-md 
    bg-cyan-500/5 border border-cyan-500/10 
    text-[10px] font-mono font-medium text-cyan-400 
    uppercase tracking-wider
    hover:bg-cyan-500/10 hover:border-cyan-500/30
    transition-colors cursor-default
  ">
    {children}
  </span>
)

// --- Section Header ---
const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string, subtitle?: string, icon?: React.ElementType }) => (
  <div className="mb-16 md:mb-24">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 mb-4"
    >
      {Icon && <Icon className="w-6 h-6 text-cyan-400" />}
      <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
        <DecryptedText text={title} />
      </h2>
    </motion.div>
    {subtitle && (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full mb-6"
      />
    )}
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-lg text-slate-400 max-w-2xl leading-relaxed font-light"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
)

// --- Cyber Button ---
const CyberButton = ({ children, href, primary = false, icon: Icon }: { children: ReactNode, href: string, primary?: boolean, icon?: React.ElementType }) => (
  <a 
    href={href}
    className={`
      relative group overflow-hidden px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all duration-300
      ${primary 
        ? 'bg-white text-black hover:bg-cyan-50' 
        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-md'
      }
    `}
  >
    {primary && (
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-white to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" />
    )}
    <span className="relative z-10">{children}</span>
    {Icon && <Icon className={`w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1 ${primary ? 'text-black' : 'text-cyan-400'}`} />}
  </a>
)

// ============================================================================
// 5. LAYOUT COMPONENTS
// ============================================================================

// --- Navigation ---
function Navigation() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map(item => item.href.substring(1));
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjusted detection zone for bottom nav
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating Clock (Bottom Left) */}
      <div className="fixed bottom-10 left-10 z-40 hidden lg:block">
        <LiveClock />
      </div>

      {/* Floating Nav Dock (Bottom Center) */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className={`
          flex items-center gap-1 py-2.5 px-2.5 rounded-full 
          transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          bg-transparent/0 border border-transparent
          hover:bg-black/20 hover:backdrop-blur-md hover:border-white/10 
          hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
          hover:scale-[1.02]
          group
        `}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.href.substring(1);
            return (
              <a
                key={item.label}
                href={item.href}
                className={`
                  relative px-3 md:px-4 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium transition-all duration-300 ease-in-out
                  ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
                onClick={() => setActiveSection(item.href.substring(1))}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {/* Icons always visible, text only for active */}
                <item.icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`} />
                <span className={`
                  hidden md:block relative z-10 transition-all duration-300 ease-in-out
                  ${isActive ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}
                `}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  )
}

// --- Footer ---
function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/10 pt-20 pb-32 overflow-hidden">
      {/* Footer Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">MAULIK JOSHI</h3>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              Full-Stack Developer building the digital future. Focused on robust backend architecture, intuitive frontend experiences, and scalable systems.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/MaulikI8" target="_blank" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all text-slate-400">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 hover:text-blue-400 transition-all text-slate-400">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:jmaulik21@gmail.com" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/30 hover:text-green-400 transition-all text-slate-400">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">SITEMAP</h4>
            <ul className="space-y-3 text-slate-400">
              {NAV_ITEMS.map(item => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm">
                    <ChevronRight className="w-3 h-3" /> {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">LEGAL & INFO</h4>
            <ul className="space-y-3 text-slate-400">
              <li><span className="text-sm">Status: Available for Work</span></li>
              <li><span className="text-sm">Location: Worldwide</span></li>
              <li><span className="text-sm">Timezone: UTC+5:45</span></li>
              <li><span className="text-sm">Version: 2.4.0 (Cyber-Glass)</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-mono">© 2025 Maulik Joshi. All Rights Reserved.</p>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            SYSTEM_OPERATIONAL
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============================================================================
// 6. FEATURE SECTIONS
// ============================================================================

// --- HERO ---
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none opacity-50" />

      {/* Radar Scan Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500/30 blur-sm animate-scanline" />
      </div>

      <motion.div 
        style={{ y }}
        className="max-w-5xl w-full text-center z-10"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-xl mb-8 font-mono text-xs text-green-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>AVAILABLE FOR NEW PROJECTS</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]"
        >
          <DecryptedText text="MAULIK" className="block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400">JOSHI</span>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
        >
          <span className="font-mono text-cyan-400">&lt;Developer /&gt;</span> crafting robust digital systems.
          <br />
          <span className="text-slate-500 text-base mt-4 block">
            Specializing in scalable backend architecture, secure APIs, and responsive frontend interfaces. 
            Transforming complex problems into elegant code.
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6"
        >
          <CyberButton href="#projects" primary icon={ArrowRight}>
            Explore Projects
          </CyberButton>
          <CyberButton href="#contact" icon={Mail}>
            Get In Touch
          </CyberButton>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs font-mono"
        >
          <span>SCROLL_TO_EXPLORE</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// --- ABOUT ---
function About() {
  return (
    <section id="about" className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Bio Column */}
        <div className="relative z-10">
          <SectionHeader 
            title="About The Developer" 
            subtitle="Bridging the gap between creative vision and technical execution."
            icon={User}
          />
          
          <div className="prose prose-invert prose-lg text-slate-400 mb-10">
            <p>
              I am a <strong className="text-white">Full-Stack Developer</strong> and computing student driven by a single question: 
              <em> "How can we make this faster, safer, and more scalable?"</em>
            </p>
            <p>
              My journey began in 2023 with Python scripting, quickly evolving into complex application development. 
              Unlike many, I didn't just stop at "Hello World" — I dove deep into <strong className="text-cyan-400">Java Swing</strong> for desktop apps, 
              <strong className="text-cyan-400">Django</strong> for secure backends, and <strong className="text-cyan-400">React</strong> for dynamic frontends.
            </p>
            <p>
              Currently, I am expanding my horizons into <strong>Cloud Computing (AWS)</strong> and <strong>DevOps pipelines</strong>, 
              aiming to become a complete Solution Architect.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-xl font-bold text-white mb-2">Enthusiast</div>
              <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Passionate Builder</div>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-xl font-bold text-white mb-2">Learner</div>
              <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Hungry for Knowledge</div>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
          <CyberCard className="p-8 relative z-10 h-full" glowColor="purple">
            <h3 className="text-xl font-bold text-white mb-8 font-mono border-b border-white/10 pb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-purple-400" /> SYSTEM_LOG
            </h3>
            <div className="space-y-10">
              <div className="relative pl-8 border-l border-purple-500/30">
                <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]"></div>
                <div className="text-xs font-mono text-purple-400 mb-1">2024 - PRESENT</div>
                <div className="text-white font-bold text-lg">BSc (Hons) Computing</div>
                <div className="text-sm text-slate-400">London Metropolitan University</div>
                <p className="text-xs text-slate-500 mt-2 italic">Specializing in Software Engineering & Data Structures</p>
              </div>
              <div className="relative pl-8 border-l border-white/10">
                <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="text-xs font-mono text-slate-500 mb-1">2023 - 2024</div>
                <div className="text-white font-bold text-lg">Full Stack Development</div>
                <div className="text-sm text-slate-400">Self-Directed Intensive Learning</div>
                <p className="text-xs text-slate-500 mt-2 italic">Mastered MERN stack, Python, and SQL</p>
              </div>
               <div className="relative pl-8 border-l border-white/10">
                <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="text-xs font-mono text-slate-500 mb-1">2023</div>
                <div className="text-white font-bold text-lg">Initialization</div>
                <div className="text-sm text-slate-400">Started coding journey</div>
              </div>
            </div>
          </CyberCard>
        </div>
      </div>
    </section>
  )
}

// --- SERVICES ---
function Services() {
  return (
    <section id="services" className="py-32 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader 
          title="Technical Services" 
          subtitle="Comprehensive solutions for modern digital challenges."
          icon={Zap}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service, i) => (
            <CyberCard key={i} className="p-8 h-full hover:-translate-y-2 transition-transform duration-300" glowColor="blue">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                <service.icon className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{service.title}</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-3 mt-auto">
                {service.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CyberCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- EXPERIENCE (Detailed) ---
function Experience() {
  return (
    <section id="experience" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeader 
          title="Professional Journey" 
          subtitle="A timeline of my academic and professional milestones."
          icon={Briefcase}
        />
        
        <div className="space-y-12">
          {EXPERIENCE_DATA.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-8 md:pl-0"
            >
              {/* Connector Line (Mobile) */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10 md:hidden" />
              
              <div className="md:grid md:grid-cols-5 md:gap-10">
                {/* Date Column */}
                <div className="md:col-span-1 py-1 md:text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-2 md:mb-0">
                    {item.period}
                  </span>
                </div>
                
                {/* Content Column */}
                <div className="md:col-span-4 relative">
                  {/* Dot */}
                  <div className="absolute left-[-37px] top-2 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-600 md:hidden" />
                  
                  <CyberCard className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                      <h3 className="text-xl font-bold text-white">{item.role}</h3>
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {item.company}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 mb-6 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {item.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CyberCard>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- PROJECTS ---
function Projects() {
  return (
    <section id="projects" className="py-32 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader 
          title="Featured Projects" 
          subtitle="A selection of robust systems built with modern technologies."
          icon={Layers}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROJECTS_DATA.map((p, i) => (
            <CyberCard key={p.id} titleBar={true} className="h-full flex flex-col" glowColor={i % 2 === 0 ? "cyan" : "purple"}>
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <span className="font-mono text-xs text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                    PRJ_0{i + 1}
                  </span>
                  <div className="flex gap-3">
                    <a href={p.github} target="_blank" className="text-slate-400 hover:text-white transition-colors" title="View Code">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href={p.link} target="_blank" className="text-slate-400 hover:text-white transition-colors" title="Live Demo">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm font-mono text-cyan-500/80 mb-4">{p.shortDesc}</p>
                
                <p className="text-slate-400 mb-8 leading-relaxed flex-grow text-sm">
                  {p.longDesc}
                </p>
                
                <div className="mb-6 space-y-2">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Key Features:</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {p.features.slice(0, 4).map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-1 h-1 bg-cyan-500 rounded-full" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5 mt-auto">
                  {p.tech.map((t) => (
                    <TechBadge key={t}>{t}</TechBadge>
                  ))}
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <CyberButton href="https://github.com/MaulikI8" icon={Github}>
            View Full Project Archive
          </CyberButton>
        </div>
      </div>
    </section>
  )
}

// --- SKILLS ---
function Skills() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader 
          title="Technical Arsenal" 
          subtitle="Tools and technologies I use to build digital products."
          icon={Cpu}
        />
        
        <CyberCard className="p-8 md:p-12 relative overflow-hidden border-cyan-500/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Cpu className="w-32 h-32 text-cyan-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {['frontend', 'backend', 'devops', 'tools'].map((category) => (
              <div key={category} className="space-y-4">
                <h4 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2 mb-4">
                  {category}
                </h4>
                <div className="space-y-3">
                  {SKILLS_DATA.filter(s => s.category === category).map((skill) => (
                    <div key={skill.name} className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <skill.icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-sm text-slate-300">{skill.name}</span>
                      </div>
                      <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-cyan-500/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CyberCard>
      </div>
    </section>
  )
}

// --- CERTIFICATES ---
function Certificates() {
  return (
    <section className="py-20 px-6 bg-white/[0.02]">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Credentials" icon={Award} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CERTIFICATES_DATA.map((c, i) => (
            <CyberCard key={i} className="p-6 flex items-center gap-6 group hover:border-cyan-500/40">
              <div className="w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                <c.icon className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{c.name}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-3 font-mono">{c.issuer} • {c.date}</p>
                <a href={c.url} target="_blank" className="text-xs font-bold text-cyan-500 hover:text-cyan-300 inline-flex items-center gap-1 uppercase tracking-wider">
                  Verify Credential <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CyberCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- FAQ ---
function FAQ() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeader title="Frequently Asked Questions" icon={HelpCircle} />
        
        <div className="space-y-4">
          {FAQ_DATA.map((item, i) => (
            <CyberCard key={i} className="p-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-cyan-500">Q.</span> {item.question}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed pl-6 border-l-2 border-white/5">
                {item.answer}
              </p>
            </CyberCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- CONTACT ---
function Contact() {
  return (
    <section id="contact" className="py-32 px-6 bg-gradient-to-b from-transparent to-cyan-900/10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          STATUS: ONLINE & READY
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
          Ready to deploy your next big idea?
        </h2>
        
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light">
          Whether you have a specific project in mind or just want to explore possibilities, 
          I'm here to help translate your vision into robust code.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <a href="mailto:jmaulik21@gmail.com" className="flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-50 transition-all hover:scale-105 shadow-xl shadow-cyan-500/10">
            <Mail className="w-5 h-5" />
            jmaulik21@gmail.com
          </a>
          
          <div className="flex gap-4">
            <a href="https://github.com/MaulikI8" target="_blank" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white hover:scale-110">
              <Github className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com" target="_blank" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white hover:scale-110">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// 7. MAIN PAGE ASSEMBLY
// ============================================================================

export default function Portfolio() {
  return (
    <main className="bg-[#050505] min-h-screen text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap');
        
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}</style>
      
      {/* GLOBAL BACKGROUNDS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Glow Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen" />
        {/* Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="relative z-10">
        <Navigation />
        
        <Hero />
        <About />
        <Services />
        <Experience />
        <Skills />
        <Projects />
        <Certificates />
        <FAQ />
        <Contact />
        <Footer />
      </div>
    </main>
  )
}