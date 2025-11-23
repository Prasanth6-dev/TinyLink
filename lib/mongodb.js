// lib/mongodb.js
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

let client
let clientPromise

if (!process.env.MONGODB_URI) {
  throw new Error('Add Mongo URI to .env.local')
}

// MongoDB connection options
// For mongodb+srv:// (MongoDB Atlas), TLS is automatically enabled
// For mongodb://, you may need to add ?tls=true
const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 1,
}

// If using mongodb:// (not mongodb+srv://), add TLS options
if (uri.startsWith('mongodb://') && !uri.includes('tls=')) {
  // For non-Atlas connections, you might need TLS
  // But for Atlas, mongodb+srv:// handles it automatically
}

if (process.env.NODE_ENV === 'development') { 
  if (!global._mongoClientPromise) {
    try {
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect().catch(err => {
        console.error('MongoDB connection error:', err)
        throw err
      })
    } catch (error) {
      console.error('Failed to create MongoDB client:', error)
      throw error
    }
  }
  clientPromise = global._mongoClientPromise
} else {
  try {
    client = new MongoClient(uri, options)
    clientPromise = client.connect().catch(err => {
      console.error('MongoDB connection error:', err)
      throw err
    })
  } catch (error) {
    console.error('Failed to create MongoDB client:', error)
    throw error
  }
}

export default clientPromise

