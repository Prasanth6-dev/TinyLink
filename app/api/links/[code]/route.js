import clientPromise from '@/lib/mongodb'

// GET /api/links/:code - Get stats for a specific link
export async function GET(request, { params }) {
  try {
    const { code } = await params
    const client = await clientPromise
    const db = client.db("bitlinks")
    const collection = db.collection("url")

    const doc = await collection.findOne({ code: code })

    if (!doc) {
      return Response.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    return Response.json({
      code: doc.code,
      url: doc.url,
      clicks: doc.clicks || 0,
      lastClicked: doc.lastClicked ? new Date(doc.lastClicked).toISOString() : null,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching link:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/links/:code - Delete a link
export async function DELETE(request, { params }) {
  try {
    const { code } = await params
    const decodedCode = decodeURIComponent(code)
    
    if (!decodedCode) {
      return Response.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("bitlinks")
    const collection = db.collection("url")

    // Try to delete by code first, then by shorturl (for backward compatibility)
    let result = await collection.deleteOne({ code: decodedCode })
    
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ shorturl: decodedCode })
    }

    if (result.deletedCount === 0) {
      return Response.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    return Response.json(
      { success: true, message: 'Link deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting link:', error)
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

