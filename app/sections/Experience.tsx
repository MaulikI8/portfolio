'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { HiAcademicCap, HiBriefcase, HiCalendar, HiLocationMarker } from 'react-icons/hi'

export default function Experience() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const experience = [
    {
      title: 'Student Developer & Freelancer',
      company: 'Self-Employed & Academic Projects',
      period: '2024 - Present',
      type: 'work',
      description: 'Working on various web development projects including e-commerce sites, desktop applications, and web tools. Building expertise in full-stack development through hands-on experience and academic projects.',
      achievements: [
        'Developed multiple client websites with responsive design',
        'Built Django web applications and React frontends',
        'Created Java desktop applications with GUI interfaces',
        'Implemented database solutions and API integrations'
      ]
    },
    {
      title: 'Tech Enthusiast & Self-Learner',
      company: 'Personal Projects & Coursework',
      period: '2024 - Present',
      type: 'work',
      description: 'Developed multiple projects including Django web applications, React frontends, Java desktop applications, and database management systems. Continuously expanding skills through self-directed learning and university coursework.',
      achievements: [
        'Mastered Python, HTML, CSS, JavaScript in 2024',
        'Advanced into Java, Django, React, CI/CD, Cloud in 2025',
        'Built comprehensive full-stack applications',
        'Participated in university coursework and projects'
      ]
    }
  ]

  const education = [
    {
      title: 'BSc Hons in Computing',
      institution: 'London Metropolitan University (via Islington College, Kathmandu)',
      period: '2024 - Present',
      type: 'education',
      status: '2nd Year',
      description: 'Currently in my 2nd year of BSc Hons Computing program, focusing on software development, computer science fundamentals, and practical application of modern technologies.',
      achievements: [
        'Maintaining strong academic performance',
        'Participating in coding competitions and hackathons',
        'Building practical projects alongside coursework',
        'Exploring advanced programming concepts and frameworks'
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

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <section id="experience" className="section-padding bg-secondary-50 dark:bg-secondary-800/50">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
            Experience & Education
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-secondary-800 dark:text-white">
            My <span className="gradient-text">Journey</span>
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            A combination of hands-on experience, academic learning, and continuous self-improvement
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Experience Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <HiBriefcase className="text-white" size={24} />
                </div>
                <h3 className="text-3xl font-heading font-bold text-secondary-800 dark:text-white">
                  Experience
                </h3>
              </div>
            </motion.div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500"></div>

              {experience.map((exp, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative flex items-start gap-6 mb-8"
                >
                  {/* Timeline Dot */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="relative z-10 w-12 h-12 bg-white dark:bg-secondary-800 rounded-full border-4 border-primary-500 flex items-center justify-center shadow-lg"
                  >
                    <HiBriefcase className="text-primary-500" size={20} />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex-1 bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-secondary-200 dark:border-secondary-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <h4 className="text-xl font-semibold text-secondary-800 dark:text-white mb-1">
                        {exp.title}
                      </h4>
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                        {exp.period}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <HiLocationMarker className="text-secondary-500" size={16} />
                      <span className="text-secondary-600 dark:text-secondary-400 font-medium">
                        {exp.company}
                      </span>
                    </div>

                    <p className="text-secondary-600 dark:text-secondary-400 mb-4 leading-relaxed">
                      {exp.description}
                    </p>

                    <div>
                      <h5 className="font-semibold text-secondary-800 dark:text-white mb-2">Key Achievements:</h5>
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Education Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
                  <HiAcademicCap className="text-white" size={24} />
                </div>
                <h3 className="text-3xl font-heading font-bold text-secondary-800 dark:text-white">
                  Education
                </h3>
              </div>
            </motion.div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-500 to-primary-500"></div>

              {education.map((edu, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative flex items-start gap-6 mb-8"
                >
                  {/* Timeline Dot */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="relative z-10 w-12 h-12 bg-white dark:bg-secondary-800 rounded-full border-4 border-accent-500 flex items-center justify-center shadow-lg"
                  >
                    <HiAcademicCap className="text-accent-500" size={20} />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex-1 bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-secondary-200 dark:border-secondary-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <h4 className="text-xl font-semibold text-secondary-800 dark:text-white mb-1">
                        {edu.title}
                      </h4>
                      <div className="flex flex-col sm:items-end gap-1">
                        <span className="text-sm font-medium text-accent-600 dark:text-accent-400 bg-accent-100 dark:bg-accent-900/30 px-3 py-1 rounded-full">
                          {edu.period}
                        </span>
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {edu.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <HiLocationMarker className="text-secondary-500" size={16} />
                      <span className="text-secondary-600 dark:text-secondary-400 font-medium">
                        {edu.institution}
                      </span>
                    </div>

                    <p className="text-secondary-600 dark:text-secondary-400 mb-4 leading-relaxed">
                      {edu.description}
                    </p>

                    <div>
                      <h5 className="font-semibold text-secondary-800 dark:text-white mb-2">Current Focus:</h5>
                      <ul className="space-y-1">
                        {edu.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full mt-2 flex-shrink-0"></span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-white dark:bg-secondary-800 p-8 rounded-2xl shadow-lg border border-secondary-200 dark:border-secondary-700">
            <h3 className="text-2xl font-heading font-bold mb-4 text-secondary-800 dark:text-white">
              Continuous Learning & Growth
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-2xl mx-auto">
              I believe in lifelong learning and staying updated with the latest technologies. 
              Currently focusing on expanding my knowledge in cloud computing, CI/CD practices, 
              and advanced backend architectures.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">100%</span>
                </div>
                <h4 className="font-semibold text-secondary-800 dark:text-white">Dedication</h4>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">24/7</span>
                </div>
                <h4 className="font-semibold text-secondary-800 dark:text-white">Learning</h4>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">∞</span>
                </div>
                <h4 className="font-semibold text-secondary-800 dark:text-white">Growth</h4>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
