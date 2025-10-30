'use client'

// This is the Projects section component - one of my favorite parts to work on!
// I spent a lot of time getting the 3D hover effects just right
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { HiExternalLink, HiCode, HiEye } from 'react-icons/hi'
import { FaGithub } from 'react-icons/fa'
import { WatchStoreSVG, GymSystemSVG, CVCraftSVG, TaskFlowSVG } from '../components/ProjectIllustrations'

export default function Projects() {
  const ref = useRef(null)
  // Using intersection observer to trigger animations when section comes into view
  // The -100px margin gives a nice early trigger effect
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  // Hover tracking for per-card emphasis
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // Removed global mousemove tracking to avoid re-renders every frame

  // My project data - I created custom SVGs for each project because stock photos are boring
  // Each project represents a different phase of my learning journey
  const projects = [
    {
      title: 'Imperial Watch Store',
      description: 'One of my first college group projects where I served as project lead. A luxury e-commerce website for high-end watches built with HTML, CSS, and JavaScript. Features responsive design, shopping cart functionality, advanced filtering, and smooth animations. Showcased modern web development practices and e-commerce functionality.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
      github: 'https://github.com/MaulikI8/imperialwatch',
      live: null,
      category: 'E-commerce',
      featured: true
    },
    {
      title: 'Gym Management System',
      description: 'My Java project from early 2025 that I enhanced even more. A comprehensive desktop application built with Java Swing for managing gym memberships, attendance tracking, payment processing, and plan upgrades. Features modern UI with dark theme, dashboard analytics, and data persistence.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      technologies: ['Java', 'Swing'],
      github: 'https://github.com/MaulikI8/GYM',
      live: null,
      category: 'Desktop App',
      featured: true
    },
    {
      title: 'CV Craft Pro',
      description: 'An AI-powered resume builder that helps users create professional resumes with intelligent suggestions and modern templates. Built with React frontend, Django backend, and PostgreSQL database hosted on Render.',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop',
      technologies: ['React', 'Django', 'PostgreSQL', 'AI Integration'],
      github: 'https://github.com/MaulikI8',
      live: 'https://cvcraftproapp.vercel.app',
      category: 'Web App',
      featured: true
    },
    {
      title: 'TaskFlow Manager',
      description: 'A collaborative task management tool with real-time updates, team collaboration features, and project tracking capabilities.',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
      github: 'https://github.com/MaulikI8',
      live: 'https://taskflow-manager.vercel.app',
      category: 'SaaS',
      featured: false
    }
  ]

  // Animation variants for the container - staggered children animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Each child animates 0.2s after the previous one
      },
    },
  }

  // Animation variants for individual project cards
  const projectVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6, // Smooth 0.6s animation
      },
    },
  }

  return (
    <section id="projects" className="section-padding bg-secondary-50 dark:bg-secondary-800/50">
      <div className="container-custom">
        {/* Section header with animated entrance */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
            Featured Projects
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-secondary-800 dark:text-white">
            My <span className="gradient-text">Creative Work</span>
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            A showcase of projects that demonstrate my skills in full-stack development, from e-commerce solutions to desktop applications
          </p>
        </motion.div>

        {/* Projects grid with staggered animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-8"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              variants={projectVariants}
              className={`group relative transition-all duration-300 ${
                hoveredCard === index ? 'z-10' : ''
              }`}
              style={{
                // Opacity is cheaper than filter blur for de-emphasis
                opacity: hoveredCard !== null && hoveredCard !== index ? 0.85 : 1,
                perspective: 1000,
                transformStyle: 'preserve-3d',
                willChange: 'transform'
              }}
              // 3D hover effect - took me a while to get the rotation values just right
              whileHover={{ 
                scale: 1.02,
                rotateY: 5,
                rotateX: 5,
                z: 50
              }}
              transition={{ type: 'tween', duration: 0.15 }}
              onHoverStart={() => {
                setIsHovered(true)
                setHoveredCard(index)
              }}
              onHoverEnd={() => {
                setIsHovered(false)
                setHoveredCard(null)
              }}
            >
              <motion.div 
                className="card overflow-hidden h-full shadow-lg group-hover:shadow-xl transition-shadow duration-200"
                style={{
                  transformStyle: 'preserve-3d',
                  willChange: 'transform'
                }}
              >
                {/* Project illustration area - using custom SVGs instead of stock photos */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                  {/* Conditional rendering for each project's custom illustration */}
                  {project.title === 'Imperial Watch Store' && <WatchStoreSVG />}
                  {project.title === 'Gym Management System' && <GymSystemSVG />}
                  {project.title === 'CV Craft Pro' && <CVCraftSVG />}
                  {project.title === 'TaskFlow Manager' && <TaskFlowSVG />}
                  
                  {/* Overlay buttons that appear on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="flex gap-4">
                      {/* Live demo button - only show if project has a live URL */}
                      {project.live && (
                        <motion.a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-secondary-800 hover:bg-white transition-colors duration-200"
                        >
                          <HiExternalLink size={20} />
                        </motion.a>
                      )}
                      {/* GitHub link button */}
                      <motion.a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-secondary-800 hover:bg-white transition-colors duration-200"
                      >
                        <FaGithub size={20} />
                      </motion.a>
                    </div>
                  </div>

                  {/* Project category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                      {project.category}
                    </span>
                  </div>

                  {/* Featured badge for special projects */}
                  {project.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-accent-600 text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Project content area */}
                <div className="p-6">
                  <h3 className="text-2xl font-heading font-bold mb-3 text-secondary-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {project.title}
                  </h3>
                  
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Technology tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {/* Live demo button */}
                    {project.live && (
                      <motion.a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        <HiEye size={16} />
                        Live Demo
                      </motion.a>
                    )}
                    {/* GitHub code button */}
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-800 dark:text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <HiCode size={16} />
                      View Code
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call-to-action to view more projects on GitHub */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12"
        >
          <motion.a
            href="https://github.com/MaulikI8"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-200 dark:bg-secondary-700 hover:bg-primary-600 hover:text-white text-secondary-800 dark:text-white rounded-lg font-medium transition-all duration-300"
          >
            <FaGithub size={20} />
            View All Projects on GitHub
            <HiExternalLink size={16} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
