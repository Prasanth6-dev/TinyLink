import Link from 'next/link'
import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import localFont from "next/font/local";

const poppins = localFont({
  src: "../../fonts/Poppins-ExtraBold.ttf",
  variable: "--font-poppins",
  weight: "100 900",
});

export default async function StatsPage({ params }) {
  const { code } = await params

  const client = await clientPromise
  const db = client.db("bitlinks")
  const collection = db.collection("url")

  const doc = await collection.findOne({ code: code })

  if (!doc) {
    notFound()
  }

  const link = {
    code: doc.code,
    url: doc.url,
    clicks: doc.clicks || 0,
    last_clicked: doc.lastClicked,
    created_at: doc.createdAt || new Date()
  }
    const shortUrl = `${process.env.NEXT_PUBLIC_HOST || 'https://tiny-link-2svh.vercel.app/'}/${link.code}`

    return (
      <main className="min-h-screen bg-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className={`text-3xl font-bold ${poppins.className} text-gray-800 mb-8`}>
              Link Statistics
            </h1>

            <div className="space-y-6">
              <div className="border-b pb-4">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Short Code
                </label>
                <div className="mt-2">
                  <code className="text-2xl font-mono bg-gray-100 px-4 py-2 rounded">
                    {link.code}
                  </code>
                </div>
              </div>

              <div className="border-b pb-4">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Short URL
                </label>
                <div className="mt-2">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-lg break-all"
                  >
                    {shortUrl}
                  </a>
                </div>
              </div>

              <div className="border-b pb-4">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Target URL
                </label>
                <div className="mt-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {link.url}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Total Clicks
                  </label>
                  <div className="mt-2 text-4xl font-bold text-purple-600">
                    {link.clicks || 0}
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Last Clicked
                  </label>
                  <div className="mt-2 text-xl font-semibold text-gray-800">
                    {link.last_clicked 
                      ? new Date(link.last_clicked).toLocaleString()
                      : 'Never'}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Created At
                </label>
                <div className="mt-2 text-gray-700">
                  {link.created_at ? new Date(link.created_at).toLocaleString() : 'Unknown'}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Visit Short Link
                </a>
                <Link
                  href="/"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
}
