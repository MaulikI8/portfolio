'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlay, HiRefresh, HiCode, HiSparkles } from 'react-icons/hi'

interface CodeSnippet {
  id: string
  title: string
  description: string
  language: string
  code: string
  expectedOutput: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

const codeSnippets: CodeSnippet[] = [
  {
    id: '1',
    title: 'JavaScript Array Methods',
    description: 'Learn modern JavaScript array manipulation',
    language: 'javascript',
    code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const filtered = doubled.filter(n => n > 5);
console.log(filtered);`,
    expectedOutput: '[6, 8, 10]',
    difficulty: 'Easy'
  },
  {
    id: '2',
    title: 'React Component',
    description: 'A simple React component with hooks',
    language: 'jsx',
    code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
    expectedOutput: 'Interactive counter component',
    difficulty: 'Medium'
  },
  {
    id: '3',
    title: 'Python Algorithm',
    description: 'Binary search implementation',
    language: 'python',
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

result = binary_search([1, 2, 3, 4, 5], 3)
print(f"Found at index: {result}")`,
    expectedOutput: 'Found at index: 2',
    difficulty: 'Hard'
  }
]

export default function LiveCodePlayground() {
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet>(codeSnippets[0])
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const executeCode = async () => {
    setIsRunning(true)
    setShowResult(false)

    // Simulate code execution with typing effect
    const typeWriter = (text: string, speed: number = 50) => {
      let i = 0
      const timer = setInterval(() => {
        if (i < text.length) {
          setOutput(prev => prev + text.charAt(i))
          i++
        } else {
          clearInterval(timer)
          setIsRunning(false)
          setShowResult(true)
        }
      }, speed)
    }

    // Clear previous output
    setOutput('')
    
    // Simulate execution time based on difficulty
    const executionTime = selectedSnippet.difficulty === 'Easy' ? 1000 : 
                         selectedSnippet.difficulty === 'Medium' ? 1500 : 2000

    setTimeout(() => {
      typeWriter(selectedSnippet.expectedOutput)
    }, executionTime)
  }

  const resetCode = () => {
    setOutput('')
    setShowResult(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 bg-green-100'
      case 'Medium': return 'text-yellow-500 bg-yellow-100'
      case 'Hard': return 'text-red-500 bg-red-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  return (
    <section id="code-playground" className="section-padding bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium mb-4">
            <HiCode className="inline mr-2" />
            Live Code Playground
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
            Try My <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Code</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Interactive code snippets showcasing my programming skills. Click run to see the magic happen!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Code Selection */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Choose a Challenge</h3>
            {codeSnippets.map((snippet) => (
              <motion.div
                key={snippet.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  selectedSnippet.id === snippet.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
                onClick={() => setSelectedSnippet(snippet)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-white">{snippet.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(snippet.difficulty)}`}>
                    {snippet.difficulty}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{snippet.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Language: <span className="text-purple-400">{snippet.language}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Code Editor</h3>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={executeCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <HiPlay size={16} />
                  {isRunning ? 'Running...' : 'Run Code'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetCode}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <HiRefresh size={16} />
                  Reset
                </motion.button>
              </div>
            </div>

            {/* Code Display */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-2 text-gray-400 text-sm font-mono">{selectedSnippet.language}</span>
              </div>
              <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                <code>{selectedSnippet.code}</code>
              </pre>
            </div>

            {/* Output */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <HiSparkles className="text-yellow-400" size={16} />
                <span className="text-gray-400 text-sm">Output</span>
              </div>
              <div className="min-h-[60px]">
                <AnimatePresence mode="wait">
                  {output ? (
                    <motion.div
                      key="output"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-white font-mono"
                    >
                      {output}
                      {isRunning && <span className="animate-pulse">|</span>}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-gray-500 font-mono"
                    >
                      Click "Run Code" to see the output...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-4 bg-green-600/20 border border-green-500/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-green-400">
                    <HiSparkles size={20} />
                    <span className="font-semibold">Code executed successfully!</span>
                  </div>
                  <p className="text-green-300 text-sm mt-1">
                    This demonstrates my {selectedSnippet.language} skills and problem-solving approach.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
