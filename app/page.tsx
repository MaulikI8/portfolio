'use client'

/**
 * ============================================================================
 * MAULIK JOSHI PORTFOLIO - NEON BRUTALISM EDITION
 * ============================================================================
 * Bold, unapologetic, and unforgettable
 */

import { useState, useEffect, useRef, ReactNode } from 'react'
import { 
  motion, 
  useScroll, 
  useTransform,
  useMotionValue,
  AnimatePresence,
  useInView
} from 'framer-motion'
import { 
  Github, 
  Linkedin, 
  Mail,
  Phone, 
  ExternalLink, 
  Code2, 
  Database, 
  Terminal, 
  Server, 
  Layout, 
  Box, 
  GitBranch,
  Coffee,
  Briefcase,
  Cloud,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Zap,
  Target,
  Rocket,
  Star
} from 'lucide-react'

// ============================================================================
// DATA
// ============================================================================

const PROJECTS_DATA = [
  {
    id: '01',
    title: 'Shipra - OMS Platform',
    desc: 'Enterprise-grade Order Management System for multi-warehouse operations. Features real-time stock tracking, smart allocation engine, interactive 3D globe visualization, and advanced reporting.',
    tech: ['React', 'TypeScript', 'Django', 'REST Framework', 'Tailwind CSS', 'Framer Motion'],
    features: ['Multi-Warehouse Management', 'Smart Stock Allocation', 'Real-time Inventory Tracking', 'Interactive 3D Globe', 'Advanced Analytics', 'Purchase Order System'],
    link: 'https://shipraa.vercel.app',
    github: 'https://github.com/MaulikI8/Shipra',
    status: 'completed',
    color: 'emerald',
    year: '2025'
  },
  {
    id: '02',
    title: 'CV Craft Pro',
    desc: 'AI-powered resume builder that helps professionals create ATS-friendly resumes with intelligent suggestions and PDF export.',
    tech: ['React', 'Django', 'PostgreSQL', 'OpenAI API'],
    features: ['AI Suggestions', 'PDF Export', 'Templates', 'Authentication'],
    link: 'https://cvcraftproapp.vercel.app',
    github: 'https://github.com/MaulikI8',
    color: 'amber',
    year: '2025'
  },
  {
    id: '03',
    title: 'Imperial Watch Store',
    desc: 'Premium e-commerce platform for luxury timepieces with custom cart engine and real-time inventory management.',
    tech: ['JavaScript', 'CSS3', 'HTML5', 'LocalStorage'],
    features: ['Cart System', 'Filtering', 'Responsive', 'Checkout'],
    link: 'https://github.com/MaulikI8/imperialwatch',
    github: 'https://github.com/MaulikI8/imperialwatch',
    color: 'orange',
    year: '2024'
  },
  {
    id: '04',
    title: 'Gym Management System',
    desc: 'Desktop application for fitness centers with member management, payment tracking, and revenue reporting.',
    tech: ['Java', 'Swing', 'JDBC', 'MySQL'],
    features: ['Member DB', 'Payments', 'Reports', 'Access Control'],
    link: 'https://github.com/MaulikI8/GYM',
    github: 'https://github.com/MaulikI8/GYM',
    color: 'rose',
    year: '2024'
  }
];

const EXPERIENCE_DATA = [
  {
    role: 'BSc (Hons) Computing Student',
    company: 'London Metropolitan University',
    period: '2024 - Present',
    desc: 'Pursuing honors degree focused on Software Engineering, Data Structures, and System Architecture.',
    skills: ['Algorithms', 'System Design', 'Agile']
  },
  {
    role: 'Freelance Full-Stack Developer',
    company: 'Self-Employed',
    period: '2023 - Present',
    desc: 'Building custom web solutions for clients. E-commerce platforms and business automation tools.',
    skills: ['Full Stack', 'Client Relations', 'Project Management']
  },
  {
    role: 'Self-Directed Learning',
    company: 'Various Platforms',
    period: '2023 - 2024',
    desc: 'Completed intensive coursework in Python, Java, and Web Development. Built 15+ practice projects.',
    skills: ['Python', 'Java', 'Web Standards']
  }
];

const SKILLS = [
  { name: 'React', level: 90 },
  { name: 'TypeScript', level: 80 },
  { name: 'Python', level: 92 },
  { name: 'Django', level: 88 },
  { name: 'Java', level: 85 },
  { name: 'PostgreSQL', level: 85 },
  { name: 'Git', level: 90 },
  { name: 'Docker', level: 70 }
];

// ============================================================================
// COMPONENTS
// ============================================================================

function Reveal({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// NAVIGATION - REFINED STYLE
// ============================================================================

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-emerald-500/30' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {['Work', 'About', 'Experience', 'Contact'].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {item}
            </motion.a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-emerald-400 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <motion.a
          href="#contact"
          className="px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Let's Talk
        </motion.a>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-emerald-500/30"
          >
            <div className="px-4 py-4 space-y-3">
              {['Work', 'About', 'Experience', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ============================================================================
// HERO
// ============================================================================

function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden bg-slate-950">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(16,185,129,0.05)_2px,transparent_2px)] bg-[size:50px_50px]" />
      
      {/* Animated Shapes - Hidden on mobile */}
      <motion.div
        className="hidden md:block absolute top-20 right-20 w-32 h-32 border-8 border-amber-400/60"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="hidden md:block absolute bottom-20 left-20 w-24 h-24 bg-rose-400/60"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="hidden md:block absolute top-1/2 left-10 w-16 h-16 border-8 border-orange-400/60 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm mb-6 sm:mb-8 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)]"
        >
          ● AVAILABLE FOR WORK
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl sm:text-7xl md:text-9xl font-black mb-4 sm:mb-6 leading-none"
        >
          <span className="block text-slate-100 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">MAULIK</span>
          <span className="block text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">JOSHI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl sm:text-2xl md:text-4xl font-black text-slate-100 mb-3 sm:mb-4 tracking-tight"
        >
          FULL-STACK DEVELOPER
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-base sm:text-xl text-slate-400 mb-8 sm:mb-12 max-w-3xl mx-auto font-bold px-4"
        >
          Building powerful web applications with React, Django & TypeScript.
          <br />
          Turning complex problems into simple solutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6"
        >
          <a href="#work">
            <motion.div
              className="px-8 sm:px-10 py-4 sm:py-5 bg-emerald-500 text-slate-950 font-black text-lg sm:text-xl border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(2,6,23,1)] flex items-center justify-center gap-3 w-full sm:w-auto"
              whileHover={{ x: -6, y: -6, boxShadow: "12px 12px 0px 0px rgba(2,6,23,1)" }}
              whileTap={{ x: 0, y: 0, boxShadow: "6px 6px 0px 0px rgba(2,6,23,1)" }}
            >
              SEE MY WORK
              <ArrowUpRight className="w-6 h-6" />
            </motion.div>
          </a>

          <a href="#contact">
            <motion.div
              className="px-8 sm:px-10 py-4 sm:py-5 bg-slate-950 text-emerald-400 font-black text-lg sm:text-xl border-4 border-emerald-500 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] w-full sm:w-auto text-center"
              whileHover={{ x: -6, y: -6, boxShadow: "12px 12px 0px 0px rgba(16,185,129,1)" }}
              whileTap={{ x: 0, y: 0, boxShadow: "6px 6px 0px 0px rgba(16,185,129,1)" }}
            >
              GET IN TOUCH
            </motion.div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PROJECTS
// ============================================================================

function Projects() {
  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500 hover:bg-emerald-500/5',
    amber: 'border-amber-400 hover:bg-amber-400/5',
    orange: 'border-orange-400 hover:bg-orange-400/5',
    rose: 'border-rose-400 hover:bg-rose-400/5'
  };

  return (
    <section id="work" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="mb-20">
            <div className="inline-block px-6 py-3 bg-slate-950 text-emerald-400 font-black text-sm mb-6 border-4 border-emerald-500">
              ★ FEATURED WORK
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-4 sm:mb-6 text-slate-900">
              SELECTED
              <br />
              <span className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">PROJECTS</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-600 max-w-2xl">
              Real solutions for real problems. Each project built with purpose.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PROJECTS_DATA.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.1}>
              <motion.div
                className={`group relative p-6 sm:p-8 bg-white border-4 sm:border-8 ${colorMap[project.color]} transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(2,6,23,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(2,6,23,0.8)]`}
                whileHover={{ x: -4, y: -4, boxShadow: "8px 8px 0px 0px rgba(2,6,23,0.8)" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-sm font-black text-slate-500">/{project.year}</span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mt-2 mb-3 leading-tight">
                      {project.title}
                    </h3>
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <a
                      href={project.github}
                      target="_blank"
                      className="p-3 bg-black text-white hover:bg-gray-800 transition-colors border-4 border-black"
                    >
                      <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                    <a
                      href={project.link}
                      target="_blank"
                      className="p-3 bg-black text-white hover:bg-gray-800 transition-colors border-4 border-black"
                    >
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 font-bold mb-6 leading-relaxed">
                  {project.desc}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {project.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 pt-4 border-t-2 sm:border-t-4 border-slate-900">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 sm:px-3 py-1 bg-slate-950 text-white font-black text-xs border-1 sm:border-2 border-slate-950"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <div className="text-center mt-12 sm:mt-16">
            <a href="https://github.com/MaulikI8" target="_blank">
              <motion.div
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-slate-950 text-white font-black text-base sm:text-lg border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(2,6,23,0.8)]"
                whileHover={{ x: -6, y: -6, boxShadow: "12px 12px 0px 0px rgba(2,6,23,0.8)" }}
                whileTap={{ x: 0, y: 0, boxShadow: "6px 6px 0px 0px rgba(2,6,23,0.8)" }}
              >
                <Github className="w-6 h-6" />
                VIEW ALL ON GITHUB
                <ArrowUpRight className="w-5 h-5" />
              </motion.div>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// ABOUT
// ============================================================================

function About() {
  return (
    <section id="about" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
          {/* Left */}
          <Reveal>
            <div>
              <div className="inline-block px-6 py-3 bg-amber-400 text-slate-950 font-black text-sm mb-6 border-4 border-slate-950">
                ★ ABOUT ME
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 text-slate-100 leading-tight">
                BUILDING
                <br />
                <span className="text-amber-400">THE FUTURE</span>
              </h2>

              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-slate-300 font-bold leading-relaxed mb-6 sm:mb-8">
                <p>
                  I'm a <span className="text-slate-100">Full-Stack Developer</span> who loves building web applications that actually solve problems.
                </p>
                <p>
                  Started coding in 2023 with Python. Now I build everything from e-commerce platforms to enterprise management systems using <span className="text-slate-100">React</span>, <span className="text-slate-100">Django</span>, and <span className="text-slate-100">TypeScript</span>.
                </p>
                <p>
                  Currently studying BSc (Hons) Computing at London Metropolitan University while taking on freelance projects.
                </p>
              </div>

              <div className="flex gap-4">
                <a href="#contact">
                  <motion.div
                    className="px-6 py-3 bg-amber-400 text-slate-950 font-black border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,6,23,0.8)]"
                    whileHover={{ x: -4, y: -4, boxShadow: "8px 8px 0px 0px rgba(2,6,23,0.8)" }}
                    whileTap={{ x: 0, y: 0, boxShadow: "4px 4px 0px 0px rgba(2,6,23,0.8)" }}
                  >
                    LET'S WORK
                  </motion.div>
                </a>
              </div>
            </div>
          </Reveal>

          {/* Right - Skills */}
          <Reveal delay={0.2}>
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mb-6 sm:mb-8">SKILLS</h3>
              {SKILLS.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-100 text-lg">{skill.name}</span>
                    <span className="font-black text-emerald-400">{skill.level}%</span>
                  </div>
                  <div className="h-4 bg-slate-700 border-4 border-slate-100">
                    <motion.div
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EXPERIENCE
// ============================================================================

function Experience() {
  return (
    <section id="experience" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="mb-20">
            <div className="inline-block px-6 py-3 bg-slate-950 text-orange-400 font-black text-sm mb-6 border-4 border-orange-400">
              ★ EXPERIENCE
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900">
              MY JOURNEY
            </h2>
          </div>
        </Reveal>

        <div className="space-y-8">
          {EXPERIENCE_DATA.map((exp, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div
                className="p-6 sm:p-8 bg-white border-4 sm:border-8 border-slate-900 shadow-[4px_4px_0px_0px_rgba(2,6,23,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(2,6,23,0.8)]"
                whileHover={{ x: -8, y: -8, boxShadow: "16px 16px 0px 0px rgba(2,6,23,0.8)" }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mb-1">{exp.role}</h3>
                    <p className="text-base sm:text-lg font-bold text-slate-600">{exp.company}</p>
                  </div>
                  <span className="text-sm font-black bg-slate-950 text-white px-4 py-2 border-2 border-slate-950">
                    {exp.period}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-700 font-bold mb-6 leading-relaxed">{exp.desc}</p>

                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-slate-950 text-white font-black text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONTACT
// ============================================================================

function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-slate-900">
      <div className="max-w-4xl mx-auto text-center">
        <Reveal>
          <div className="inline-block px-6 py-3 bg-rose-400 text-slate-950 font-black text-sm mb-6 border-4 border-slate-950">
            ★ GET IN TOUCH
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-4 sm:mb-6 text-slate-100 leading-tight">
            LET'S BUILD
            <br />
            <span className="text-rose-400">TOGETHER</span>
          </h2>

          <p className="text-base sm:text-xl font-bold text-slate-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Got a project in mind? Let's make it happen.
            <br />
            I'm always open to new opportunities.
          </p>

          <div className="flex flex-col items-center gap-6 mb-12">
            <a href="mailto:jmaulik21@gmail.com">
              <motion.div
                className="px-8 sm:px-12 py-4 sm:py-6 bg-rose-400 text-slate-950 font-black text-lg sm:text-2xl border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(2,6,23,0.8)] flex items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
                whileHover={{ x: -8, y: -8, boxShadow: "16px 16px 0px 0px rgba(2,6,23,0.8)" }}
                whileTap={{ x: 0, y: 0, boxShadow: "8px 8px 0px 0px rgba(2,6,23,0.8)" }}
              >
                <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="break-all">jmaulik21@gmail.com</span>
              </motion.div>
            </a>
            
            <a href="tel:+9779824616674">
              <motion.div
                className="px-8 sm:px-12 py-4 sm:py-6 bg-amber-400 text-slate-950 font-black text-lg sm:text-2xl border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(2,6,23,0.8)] flex items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
                whileHover={{ x: -8, y: -8, boxShadow: "16px 16px 0px 0px rgba(2,6,23,0.8)" }}
                whileTap={{ x: 0, y: 0, boxShadow: "8px 8px 0px 0px rgba(2,6,23,0.8)" }}
              >
                <Phone className="w-6 h-6 sm:w-8 sm:h-8" />
                <span>+977 9824616674</span>
              </motion.div>
            </a>
          </div>

          <div className="flex justify-center gap-4 sm:gap-6">
            <a href="https://github.com/MaulikI8" target="_blank">
              <motion.div
                className="p-5 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                whileHover={{ x: -4, y: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                whileTap={{ x: 0, y: 0, boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
              >
                <Github className="w-6 h-6 sm:w-7 sm:h-7" />
              </motion.div>
            </a>
            <a href="https://linkedin.com" target="_blank">
              <motion.div
                className="p-5 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                whileHover={{ x: -4, y: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                whileTap={{ x: 0, y: 0, boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
              >
                <Linkedin className="w-6 h-6 sm:w-7 sm:h-7" />
              </motion.div>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  return (
    <footer className="py-8 sm:py-12 px-4 sm:px-6 bg-emerald-500 border-t-4 sm:border-t-8 border-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-950 font-black text-base sm:text-lg text-center sm:text-left">
            © 2026 MAULIK JOSHI
          </p>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-950 rounded-full animate-pulse" />
            <span className="text-slate-950 font-black text-sm sm:text-base">AVAILABLE FOR WORK</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN
// ============================================================================

export default function Portfolio() {
  return (
    <main className="bg-slate-950 text-white antialiased selection:bg-emerald-500/30 selection:text-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 900;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        ::-webkit-scrollbar {
          width: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: #020617;
          border-left: 4px solid #10b981;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #10b981;
          border: 2px solid #020617;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #34d399;
        }
      `}</style>

      <Navigation />
      <Hero />
      <Projects />
      <About />
      <Experience />
      <Contact />
      <Footer />
    </main>
  );
}