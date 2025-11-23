"use client"
import { useState, useEffect } from 'react'
import localFont from "next/font/local";

const poppins = localFont({
  src: "./fonts/Poppins-ExtraBold.ttf",
  variable: "--font-poppins",
  weight: "100 900",
});

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newCode, setNewCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch all links
  const fetchLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data.links || [])
      }
    } catch (err) {
      console.error('Error fetching links:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  // Add new link
  const handleAddLink = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl, code: newCode })
      })

      const data = await response.json()

      if (response.status === 409) {
        setError('This code already exists. Please choose a different one.')
      } else if (response.status === 400) {
        setError(data.error || 'Invalid input')
      } else if (response.ok) {
        setSuccess('Link created successfully!')
        setNewUrl('')
        setNewCode('')
        setShowAddForm(false)
        fetchLinks()
      } else {
        setError(data.error || 'Failed to create link')
        if (data.details) {
          console.error('Error details:', data.details)
        }
      }
    } catch (err) {
      console.error('Network error:', err)
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete link
  const handleDeleteLink = async (code) => {
    if (!code) {
      setError('Invalid code')
      return
    }

    if (!confirm(`Are you sure you want to delete the link with code "${code}"?`)) {
      return
    }

    try {
      setError('')
      setSuccess('')
      
      const response = await fetch(`/api/links/${encodeURIComponent(code)}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Link deleted successfully!')
        setTimeout(() => setSuccess(''), 3000)
        fetchLinks()
      } else {
        setError(data.error || 'Failed to delete link')
        setTimeout(() => setError(''), 5000)
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Network error. Please try again.')
      setTimeout(() => setError(''), 5000)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(''), 2000)
  }

  // Filter links
  const filteredLinks = links.filter(link => {
    if (!link) return false
    const search = searchTerm.toLowerCase()
    const code = (link.code || '').toLowerCase()
    const url = (link.url || '').toLowerCase()
    return code.includes(search) || url.includes(search)
  })

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Truncate URL
  const truncateUrl = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
  }

  return (
    <main className="min-h-screen bg-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-bold ${poppins.className} text-gray-800`}>
            TinyLink Dashboard
          </h1>
          <div className="flex gap-3">
            <button
              onClick={fetchLinks}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
              title="Refresh links"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
            >
              {showAddForm ? 'Cancel' : '+ Add Link'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Add Link Form */}
        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Create New Link</h2>
            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target URL *
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Code *
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="example"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                {submitting ? 'Creating...' : 'Create Link'}
              </button>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code or URL..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Links Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No links match your search.' : 'No links yet. Create your first link!'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Short Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Target URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Clicked</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLinks.map((link) => {
                    if (!link || !link.code) return null
                    const shortUrl = `${process.env.NEXT_PUBLIC_HOST || window.location.origin}/${link.code}`
                    return (
                      <tr key={link.code} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-mono bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-blue-600 hover:text-blue-800"
                              title="Click to open target URL in new tab"
                            >
                              {link.code || ''}
                            </a>
                            <button
                              onClick={() => copyToClipboard(shortUrl)}
                              className="text-purple-600 hover:text-purple-800 text-sm"
                              title="Copy short URL"
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={link.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            title={link.url || ''}
                          >
                            {truncateUrl(link.url || '')}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-lg font-semibold">{link.clicks}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(link.lastClicked)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <a
                              href={`/code/${link.code}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Stats
                            </a>
                            <button
                              onClick={() => handleDeleteLink(link.code)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
