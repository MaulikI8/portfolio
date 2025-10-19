'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { HiLightBulb, HiCode, HiDatabase, HiCloud, HiCog, HiAcademicCap } from 'react-icons/hi'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" }) // trigger animation when in view

  // My learning timeline - from beginner to full-stack developer
  const learningJourney = [
    { year: '2023', skill: 'HTML', description: 'Learned web fundamentals', icon: HiCode, color: 'from-orange-400 to-orange-600' },
    { year: '2023', skill: 'CSS', description: 'Basic styling and layouts', icon: HiCode, color: 'from-blue-400 to-blue-600' },
    { year: '2023', skill: 'Python (First Half)', description: 'Started with programming fundamentals', icon: HiCode, color: 'from-yellow-400 to-yellow-600' },
    { year: '2024', skill: 'JavaScript', description: 'Dynamic web development', icon: HiCode, color: 'from-green-400 to-green-600' },
    { year: '2024', skill: 'Python (Second Half)', description: 'Completed Python mastery', icon: HiCode, color: 'from-yellow-400 to-yellow-600' },
    { year: '2024', skill: 'Databases', description: 'SQL and data management', icon: HiDatabase, color: 'from-teal-400 to-teal-600' },
    { year: '2025', skill: 'Java', description: 'Object-oriented programming', icon: HiCode, color: 'from-red-400 to-red-600' },
    { year: '2025', skill: 'Django', description: 'Python web framework', icon: HiCode, color: 'from-emerald-400 to-emerald-600' },
    { year: '2025', skill: 'React', description: 'Modern frontend library', icon: HiCode, color: 'from-cyan-400 to-cyan-600' },
    { year: '2025', skill: 'CI/CD', description: 'Automation pipelines', icon: HiCog, color: 'from-pink-400 to-pink-600' },
    { year: '2025', skill: 'Cloud Computing', description: 'Scalable infrastructure', icon: HiCloud, color: 'from-indigo-400 to-indigo-600' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <section id="about" className="relative min-h-screen flex items-center py-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
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
              About Me
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
            The Story Behind
            <br />
            <span className="text-white">The Code</span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Interactive Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="relative"
            >
              <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500">
                <h3 className="text-2xl font-bold mb-4 text-white">The Student</h3>
                <p className="text-white/80 leading-relaxed">
                  I'm a dedicated <span className="text-yellow-400 font-semibold">2nd-year BSc Hons Computing student</span> at London Metropolitan University, studying at Islington College Kathmandu. I balance academic learning with hands-on project development.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="relative"
            >
              <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500">
                <h3 className="text-2xl font-bold mb-4 text-white">The Journey</h3>
                <p className="text-white/80 leading-relaxed">
                  Started coding in 2023 with <span className="text-orange-400 font-semibold">HTML, CSS, and the first half of Python</span>, then in 2024 completed <span className="text-green-400 font-semibold">the other half of Python, JavaScript, and Databases</span>. Now in 2025, I'm expanding into <span className="text-blue-400 font-semibold">Java, Cloud Computing, CI/CD, Django, and React</span> - building a comprehensive full-stack toolkit.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="relative"
            >
              <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500">
                <h3 className="text-2xl font-bold mb-4 text-white">The Passion</h3>
                <p className="text-white/80 leading-relaxed">
                  What drives me is learning to build <span className="text-purple-400 font-semibold">reliable systems</span> that can handle real-world demands while writing clean, maintainable code. Each project teaches me something new.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-3xl font-heading font-bold mb-4 text-white">
                My Learning Adventure
              </h3>
              <p className="text-white/60">
                Two years of focused learning and growing
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-6"
            >
              {learningJourney.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <item.icon className="text-white" size={20} />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white text-lg">{item.skill}</h4>
                          <span className="text-sm font-medium text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full">
                            {item.year}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{item.description}</p>
                      </div>
                    </div>

                    {/* Progress bar animation */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "100%" } : { width: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className="mt-3 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
