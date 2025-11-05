'use client'

// Simple admin page to view contact submissions
// This is a basic implementation - you can enhance it with better UI and authentication
import { useState, useEffect } from 'react'

interface ContactSubmission {
  id: number
  name: string
  email: string
  message: string
  timestamp: string
  ip?: string
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminKey, setAdminKey] = useState('')

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/submissions', {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }

      const data = await response.json()
      setSubmissions(data.submissions)
      setError('')
    } catch (err) {
      setError('Failed to load submissions. Check your admin key.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (adminKey) {
      fetchSubmissions()
    }
  }, [adminKey])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Contact Submissions Admin</h1>
        
        {!adminKey ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Enter Admin Key</h2>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              className="w-full p-3 border rounded-lg mb-4"
            />
            <button
              onClick={fetchSubmissions}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Access Submissions
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">Total submissions: {submissions.length}</p>
              <button
                onClick={fetchSubmissions}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Refresh
              </button>
            </div>

            {loading && <p>Loading submissions...</p>}
            {error && <p className="text-red-600">{error}</p>}

            <div className="grid gap-6">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{submission.name}</h3>
                      <p className="text-gray-600">{submission.email}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{new Date(submission.timestamp).toLocaleString()}</p>
                      {submission.ip && <p>IP: {submission.ip}</p>}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="whitespace-pre-wrap">{submission.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
