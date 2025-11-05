'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiStar, HiLightningBolt, HiFire, HiSparkles, HiAcademicCap } from 'react-icons/hi'
import { FaTrophy } from 'react-icons/fa'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  points: number
  category: 'exploration' | 'interaction' | 'skill'
}

interface SkillNode {
  id: string
  name: string
  level: number
  maxLevel: number
  icon: string
  unlocked: boolean
  xp: number
  maxXp: number
}

const achievements: Achievement[] = [
  {
    id: 'portfolio_explorer',
    title: 'Portfolio Explorer',
    description: 'Visited all sections of the portfolio',
    icon: '🗺️',
    unlocked: false,
    points: 50,
    category: 'exploration'
  },
  {
    id: 'code_runner',
    title: 'Code Runner',
    description: 'Executed code in the playground',
    icon: '💻',
    unlocked: false,
    points: 75,
    category: 'skill'
  },
  {
    id: 'easter_egg_hunter',
    title: 'Easter Egg Hunter',
    description: 'Found at least 2 easter eggs',
    icon: '🥚',
    unlocked: false,
    points: 100,
    category: 'interaction'
  },
  {
    id: 'scroll_master',
    title: 'Scroll Master',
    description: 'Scrolled through the entire portfolio',
    icon: '📜',
    unlocked: false,
    points: 25,
    category: 'exploration'
  },
  {
    id: 'project_inspector',
    title: 'Project Inspector',
    description: 'Viewed all project details',
    icon: '🔍',
    unlocked: false,
    points: 60,
    category: 'exploration'
  },
  {
    id: 'interaction_expert',
    title: 'Interaction Expert',
    description: 'Triggered 10+ animations',
    icon: '⚡',
    unlocked: false,
    points: 80,
    category: 'interaction'
  }
]

const skillNodes: SkillNode[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    level: 4,
    maxLevel: 5,
    icon: '🎨',
    unlocked: true,
    xp: 320,
    maxXp: 400
  },
  {
    id: 'backend',
    name: 'Backend Development',
    level: 4,
    maxLevel: 5,
    icon: '⚙️',
    unlocked: true,
    xp: 350,
    maxXp: 400
  },
  {
    id: 'databases',
    name: 'Database Management',
    level: 3,
    maxLevel: 5,
    icon: '🗄️',
    unlocked: true,
    xp: 240,
    maxXp: 300
  },
  {
    id: 'devops',
    name: 'DevOps & Tools',
    level: 2,
    maxLevel: 5,
    icon: '🚀',
    unlocked: true,
    xp: 120,
    maxXp: 200
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    level: 2,
    maxLevel: 5,
    icon: '☁️',
    unlocked: false,
    xp: 80,
    maxXp: 200
  },
  {
    id: 'ai',
    name: 'AI Integration',
    level: 1,
    maxLevel: 5,
    icon: '🤖',
    unlocked: false,
    xp: 40,
    maxXp: 100
  }
]

export default function GamifiedExperience() {
  const [userLevel, setUserLevel] = useState(1)
  const [totalXp, setTotalXp] = useState(0)
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(achievements)
  const [userSkills, setUserSkills] = useState<SkillNode[]>(skillNodes)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null)

  // Remove automatic progress simulation - too annoying

  const unlockAchievement = (achievementId: string) => {
    setUserAchievements(prev => 
      prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlocked) {
          setRecentAchievement(achievement)
          setTimeout(() => setRecentAchievement(null), 3000)
          setTotalXp(prevXp => prevXp + achievement.points)
          return { ...achievement, unlocked: true }
        }
        return achievement
      })
    )
  }

  // Remove automatic skill progression - too distracting

  const getTotalUnlockedAchievements = () => {
    return userAchievements.filter(a => a.unlocked).length
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'exploration': return 'from-blue-500 to-cyan-500'
      case 'interaction': return 'from-purple-500 to-pink-500'
      case 'skill': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <section id="gamified-experience" className="section-padding bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium mb-4">
            <FaTrophy className="inline mr-2" />
            Gamified Experience
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
            Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Exploration</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Turn portfolio browsing into an adventure! Unlock achievements, level up skills, and discover hidden features.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* User Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <HiStar className="text-yellow-400" />
                Your Progress
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Level</span>
                  <span className="text-2xl font-bold text-white">{userLevel}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total XP</span>
                  <span className="text-xl font-bold text-purple-400">{totalXp}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Achievements</span>
                  <span className="text-xl font-bold text-green-400">
                    {getTotalUnlockedAchievements()}/{userAchievements.length}
                  </span>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Next Level</span>
                  <span>{Math.floor(totalXp / 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalXp % 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-400" />
                Achievements
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {userAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                        : 'bg-gray-800/50 border-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                            {achievement.title}
                          </span>
                          {achievement.unlocked && (
                            <HiSparkles className="text-yellow-400" size={16} />
                          )}
                        </div>
                        <p className={`text-sm ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          achievement.unlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-500'
                        }`}>
                          +{achievement.points} XP
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skill Tree */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <HiLightningBolt className="text-blue-400" />
                Skill Tree
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {userSkills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      skill.unlocked
                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50'
                        : 'bg-gray-800/50 border-gray-700 opacity-50'
                    }`}
                    whileHover={{ scale: skill.unlocked ? 1.05 : 1 }}
                  >
                    <div className="text-center">
                      <span className="text-3xl mb-2 block">{skill.icon}</span>
                      <h4 className={`font-semibold mb-2 ${skill.unlocked ? 'text-white' : 'text-gray-500'}`}>
                        {skill.name}
                      </h4>
                      <div className="text-sm text-gray-400 mb-2">
                        Level {skill.level}/{skill.maxLevel}
                      </div>
                      
                      {skill.unlocked && (
                        <div className="space-y-1">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <div className="text-xs text-gray-400">
                            {skill.xp}/{skill.maxXp} XP
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievement Notification */}
        <AnimatePresence>
          {recentAchievement && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-2xl max-w-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{recentAchievement.icon}</span>
                <div>
                  <div className="font-bold text-lg">Achievement Unlocked!</div>
                  <div className="text-sm opacity-90">{recentAchievement.title}</div>
                  <div className="text-xs mt-1">+{recentAchievement.points} XP</div>
                </div>
                <HiSparkles className="text-white animate-pulse" size={24} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Notification */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ duration: 0.5, repeat: 5, repeatType: "reverse" }}
                className="text-center bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl shadow-2xl"
              >
                <HiFire className="text-6xl text-white mb-4 mx-auto" />
                <h2 className="text-4xl font-bold text-white mb-2">LEVEL UP!</h2>
                <p className="text-xl text-white/90">Skill progression detected!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
