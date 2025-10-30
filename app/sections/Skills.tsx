'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { HiCode, HiServer, HiDatabase, HiCog } from 'react-icons/hi'
import { 
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaPython,
  FaJava,
  FaNodeJs,
  FaDocker,
  FaGitAlt,
  FaAws,
  FaReact
} from 'react-icons/fa'
import { SiMongodb, SiPostgresql, SiDjango } from 'react-icons/si'

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" }) // animate when visible

  // Skill levels - being honest here, always learning
  const skillCategories = [
    {
      title: 'Frontend',
      icon: HiCode,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      skills: [
        { name: 'HTML', level: 95, icon: FaHtml5 },
        { name: 'CSS', level: 90, icon: FaCss3Alt },
        { name: 'JavaScript', level: 85, icon: FaJs },
        { name: 'React', level: 80, icon: FaReact },
      ]
    },
    {
      title: 'Backend',
      icon: HiServer,
      color: 'from-green-600 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      skills: [
        { name: 'Python', level: 90, icon: FaPython },
        { name: 'Java', level: 85, icon: FaJava },
        { name: 'Django', level: 75, icon: SiDjango },
      ]
    },
    {
      title: 'Databases',
      icon: HiDatabase,
      color: 'from-purple-600 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      skills: [
        { name: 'SQL', level: 75, icon: SiPostgresql },
        { name: 'MongoDB', level: 70, icon: SiMongodb },
      ]
    },
    {
      title: 'DevOps & Tools',
      icon: HiCog,
      color: 'from-orange-600 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      skills: [
        { name: 'Git', level: 85, icon: FaGitAlt },
        { name: 'Deployment', level: 75, icon: FaDocker },
        { name: 'CI/CD', level: 70, icon: HiCog },
        { name: 'Cloud Computing', level: 65, icon: FaAws },
      ]
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const categoryVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  const skillVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
  }

  return (
    <section id="skills" className="relative min-h-screen flex items-center py-20 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/3 text-5xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -30],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 5 }}
          >
            {i % 3 === 0 ? '{}' : i % 3 === 1 ? '[]' : '()'}
          </motion.div>
        ))}
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium">
              My Arsenal
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-heading font-bold mb-8"
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
              backgroundSize: '400% 400%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 4s ease infinite'
            }}
          >
            Skills That
            <br />
            <span className="text-white">Make Magic</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-white/70 max-w-3xl mx-auto"
          >
            From frontend development to backend systems - here's what I work with
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-8"
        >
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              variants={categoryVariants}
              className="group relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500"
            >
              {/* Category Header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: categoryIndex * 0.2, duration: 0.6 }}
                className="flex items-center gap-4 mb-8"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <category.icon className="text-white" size={28} />
                </motion.div>
                <div>
                  <h3 className="text-3xl font-heading font-bold text-white mb-2">
                    {category.title}
                  </h3>
                  <div className="h-1 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
                </div>
              </motion.div>

              {/* Skills List */}
              <motion.div
                variants={containerVariants}
                className="space-y-6"
              >
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    variants={skillVariants}
                    className="group/skill"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="relative p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.3 }}
                            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"
                          >
                            <skill.icon className="text-white" size={16} />
                          </motion.div>
                          <span className="font-semibold text-white text-lg">
                            {skill.name}
                          </span>
                        </div>
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                          transition={{ delay: 0.8 + (categoryIndex * 0.2) + (skillIndex * 0.1) }}
                          className="text-sm font-bold text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full"
                        >
                          {skill.level}%
                        </motion.span>
                      </div>
                      
                      {/* Animated Progress Bar */}
                      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                          transition={{ 
                            delay: 0.5 + (categoryIndex * 0.2) + (skillIndex * 0.1),
                            duration: 1.5,
                            ease: "easeOut"
                          }}
                        />
                        <motion.div
                          className="absolute inset-y-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                          transition={{ 
                            delay: 0.5 + (categoryIndex * 0.2) + (skillIndex * 0.1),
                            duration: 1.5,
                            ease: "easeOut"
                          }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-heading font-bold mb-8 text-secondary-800 dark:text-white">
            Additional Skills & Learning
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              'Problem Solving',
              'Team Collaboration',
              'Agile Methodology',
              'Code Review',
              'Documentation',
              'Testing',
              'Performance Optimization',
              'Security Best Practices'
            ].map((skill, index) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 1 + (index * 0.1), duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="p-3 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200"
              >
                {skill}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-8 text-secondary-600 dark:text-secondary-400"
          >
            Always expanding my knowledge and staying up-to-date with the latest technologies and best practices
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
