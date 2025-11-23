import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Route handler for redirects - /r/:code
export async function GET(request, { params }) {
    try {
        const { code } = await params
        const client = await clientPromise
        const db = client.db("bitlinks")
        const collection = db.collection("url")

        // Try to find by code first, then by shorturl (for backward compatibility)
        let doc = await collection.findOne({ code: code })
        if (!doc) {
            doc = await collection.findOne({ shorturl: code })
        }
        
        if (!doc || !doc.url) {
            return new NextResponse("Link not found", { status: 404 })
        }

        // Ensure URL is absolute
        let targetUrl = doc.url.trim()
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl
        }

        // Use the appropriate field name for the update query
        const queryField = doc.code ? { code: code } : { shorturl: code }
        
        // Increment click count and update last_clicked
        await collection.updateOne(
            queryField,
            { 
                $inc: { clicks: 1 },
                $set: { lastClicked: new Date() }
            }
        )

        // Perform 302 redirect to external URL
        return NextResponse.redirect(targetUrl, { status: 302 })
    } catch (error) {
        console.error('Error in redirect route:', error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}

