import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import clientPromise from "@/lib/mongodb"

export default async function Page({ params }) {
    const shorturl = (await params).shorturl

    const client = await clientPromise
    const db = client.db("bitlinks")
    const collection = db.collection("url")

    // Try to find by code first, then by shorturl (for backward compatibility)
    let doc = await collection.findOne({ code: shorturl })
    
    if (!doc) {
        doc = await collection.findOne({ shorturl: shorturl })
    }
    
    if (!doc) {
        // Debug: Check what codes exist in the database
        const allCodes = await collection.find({}, { projection: { code: 1, shorturl: 1, _id: 0 } }).toArray()
        console.log(`[Redirect] Link not found for code: "${shorturl}"`)
        console.log(`[Redirect] Available codes in database:`, allCodes.map(d => d.code || d.shorturl))
        notFound()
    }
    
    if (!doc.url) {
        console.log(`[Redirect] Link found but URL is missing for code: "${shorturl}"`)
        notFound()
    }

    // Ensure URL is absolute and properly formatted
    let targetUrl = doc.url.trim()
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl
    }

    // Use the appropriate field name for the update query
    const queryField = doc.code ? { code: shorturl } : { shorturl: shorturl }
    
    // Increment click count and update last_clicked
    // $inc will create the field if it doesn't exist
    await collection.updateOne(
        queryField,
        { 
            $inc: { clicks: 1 },
            $set: { lastClicked: new Date() }
        }
    )

    // Perform 302 redirect to external URL
    // redirect() throws a NEXT_REDIRECT error which is expected and should propagate
    redirect(targetUrl)
}