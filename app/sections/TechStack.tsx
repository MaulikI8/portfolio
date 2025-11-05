'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  FaReact, 
  FaNodeJs, 
  FaPython, 
  FaJava, 
  FaJs, 
  FaHtml5, 
  FaCss3Alt, 
  FaGitAlt, 
  FaDocker, 
  FaAws,
  FaGithub
} from 'react-icons/fa'
import { 
  SiNextdotjs,
  SiTypescript,
  SiMongodb,
  SiPostgresql,
  SiTailwindcss,
  SiVercel,
  SiVisualstudiocode
} from 'react-icons/si'

export default function TechStack() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const techStack = [
    { name: 'React', icon: FaReact, color: 'from-blue-400 to-blue-600', category: 'Frontend' },
    { name: 'Next.js', icon: SiNextdotjs, color: 'from-gray-600 to-gray-800', category: 'Frontend' },
    { name: 'TypeScript', icon: SiTypescript, color: 'from-blue-600 to-blue-800', category: 'Frontend' },
    { name: 'JavaScript', icon: FaJs, color: 'from-yellow-400 to-yellow-600', category: 'Frontend' },
    { name: 'HTML', icon: FaHtml5, color: 'from-orange-400 to-orange-600', category: 'Frontend' },
    { name: 'CSS', icon: FaCss3Alt, color: 'from-blue-600 to-blue-800', category: 'Frontend' },
    { name: 'Tailwind CSS', icon: SiTailwindcss, color: 'from-cyan-400 to-cyan-600', category: 'Frontend' },
    { name: 'Node.js', icon: FaNodeJs, color: 'from-green-600 to-green-800', category: 'Backend' },
    { name: 'Python', icon: FaPython, color: 'from-yellow-600 to-blue-700', category: 'Backend' },
    { name: 'Java', icon: FaJava, color: 'from-red-600 to-red-800', category: 'Backend' },
    { name: 'MongoDB', icon: SiMongodb, color: 'from-green-600 to-green-800', category: 'Database' },
    { name: 'PostgreSQL', icon: SiPostgresql, color: 'from-blue-600 to-blue-800', category: 'Database' },
    { name: 'Git', icon: FaGitAlt, color: 'from-orange-600 to-red-600', category: 'Tools' },
    { name: 'GitHub', icon: FaGithub, color: 'from-gray-600 to-gray-800', category: 'Tools' },
    { name: 'Docker', icon: FaDocker, color: 'from-blue-600 to-blue-800', category: 'DevOps' },
    { name: 'AWS', icon: FaAws, color: 'from-orange-600 to-orange-800', category: 'Cloud' },
    { name: 'Vercel', icon: SiVercel, color: 'from-gray-600 to-gray-800', category: 'Deployment' },
    { name: 'VS Code', icon: SiVisualstudiocode, color: 'from-blue-600 to-blue-800', category: 'Tools' },
  ]

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'Tools', 'DevOps', 'Cloud', 'Deployment']

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section className="section-padding">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
            Tech Stack & Tools
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-secondary-800 dark:text-white">
            Technologies I <span className="gradient-text">Work With</span>
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            A comprehensive collection of tools and technologies that power my development workflow
          </p>
        </motion.div>

        {/* Tech Stack Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12"
        >
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.1, 
                y: -10,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer"
            >
              <div className="card p-6 text-center hover:shadow-xl transition-all duration-300 h-full">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${tech.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <tech.icon className="text-white" size={32} />
                </div>
                <h3 className="font-semibold text-secondary-800 dark:text-white mb-1">
                  {tech.name}
                </h3>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  {tech.category}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Animated Carousel Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-primary-50 to-accent-50 dark:from-secondary-800 dark:to-secondary-700 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-secondary-800 dark:text-white">
              Continuous Learning & Growth
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Always exploring new technologies and expanding my skill set
            </p>
          </div>

          {/* Scrolling Carousel */}
          <div className="relative">
            <div className="flex space-x-8 animate-scroll">
              {/* First set */}
              {techStack.map((tech, index) => (
                <motion.div
                  key={`first-${index}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ delay: 0.7 + (index * 0.1), duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex-shrink-0"
                >
                  <div className={`w-20 h-20 bg-gradient-to-r ${tech.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <tech.icon className="text-white" size={40} />
                  </div>
                </motion.div>
              ))}
              {/* Duplicate set for seamless loop */}
              {techStack.map((tech, index) => (
                <motion.div
                  key={`second-${index}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ delay: 0.7 + (index * 0.1), duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex-shrink-0"
                >
                  <div className={`w-20 h-20 bg-gradient-to-r ${tech.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <tech.icon className="text-white" size={40} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Learning Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 grid md:grid-cols-3 gap-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaReact className="text-white" size={32} />
              </div>
              <h4 className="font-semibold text-secondary-800 dark:text-white mb-2">Frontend Focus</h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                React, Next.js, and modern CSS frameworks
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaNodeJs className="text-white" size={32} />
              </div>
              <h4 className="font-semibold text-secondary-800 dark:text-white mb-2">Backend Expertise</h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Node.js, Python, Java, and database design
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaAws className="text-white" size={32} />
              </div>
              <h4 className="font-semibold text-secondary-800 dark:text-white mb-2">DevOps & Cloud</h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                CI/CD, Docker, AWS, and deployment strategies
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Custom CSS for scrolling animation */}
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>
  )
}
