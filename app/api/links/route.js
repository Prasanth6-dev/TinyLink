import clientPromise from '@/lib/mongodb'

// Validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}

// POST /api/links - Create a new link
export async function POST(request) {
  try {
    const body = await request.json()
    const { url, code } = body

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return Response.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Validate code exists
    if (!code || code.trim() === '') {
      return Response.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    let client
    try {
      client = await clientPromise
    } catch (connectionError) {
      console.error('MongoDB connection failed:', connectionError)
      return Response.json(
        { 
          error: 'Database connection failed', 
          details: 'Unable to connect to MongoDB. Please check your connection string and network settings.',
          connectionError: connectionError.message 
        },
        { status: 503 }
      )
    }

    const db = client.db("bitlinks")
    const collection = db.collection("url")

    // Check if code already exists (check both code and shorturl fields for backward compatibility)
    const existing = await collection.findOne({ 
      $or: [
        { code: code },
        { shorturl: code }
      ]
    })
    if (existing) {
      return Response.json(
        { error: 'Code already exists' },
        { status: 409 }
      )
    }

    // Insert new link
    await collection.insertOne({
      code: code,
      url: url,
      clicks: 0,
      lastClicked: null,
      createdAt: new Date()
    })

    return Response.json(
      { success: true, code, url },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating link:', error)
    
    // Check if it's an SSL/TLS error
    if (error.message && error.message.includes('SSL') || error.message.includes('TLS')) {
      return Response.json(
        { 
          error: 'Database SSL connection error', 
          details: 'There is an SSL/TLS issue connecting to MongoDB. Please check: 1) Your connection string uses mongodb+srv:// for Atlas, 2) Your IP is whitelisted in MongoDB Atlas, 3) Your connection string is correct.',
          technicalError: error.message 
        },
        { status: 503 }
      )
    }
    
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET /api/links - List all links
export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db("bitlinks")
    const collection = db.collection("url")

    // Fetch all documents - no filter, get everything
    const docs = await collection.find({}).toArray()
    
    console.log(`[API] Total documents in database: ${docs.length}`)

    const links = docs
      .filter(doc => doc && (doc.code || doc.shorturl) && doc.url) // Filter out invalid documents, support both old and new formats
      .map(doc => {
        // Handle both old format (shorturl) and new format (code)
        const code = doc.code || doc.shorturl || ''
        // Handle createdAt - use _id timestamp if createdAt doesn't exist (for old documents)
        let createdAt = doc.createdAt
        if (!createdAt && doc._id) {
          // Extract timestamp from ObjectId
          createdAt = doc._id.getTimestamp()
        }
        if (!createdAt) {
          createdAt = new Date()
        }
        
        return {
          code: code,
          url: doc.url || '',
          clicks: doc.clicks || 0,
          lastClicked: doc.lastClicked ? new Date(doc.lastClicked).toISOString() : null,
          createdAt: new Date(createdAt).toISOString()
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt descending

    return Response.json({ links })
  } catch (error) {
    console.error('Error fetching links:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

