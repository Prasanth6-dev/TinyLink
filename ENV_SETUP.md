# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Connection (MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bitlinks

# Application Base URL
NEXT_PUBLIC_HOST=http://localhost:3000
```

## For Production (Vercel/Railway/Render)

Set these environment variables in your hosting platform's dashboard:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `NEXT_PUBLIC_HOST`: Your deployed application URL (e.g., `https://your-app.vercel.app`)

## Example MongoDB Atlas Connection String

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bitlinks?retryWrites=true&w=majority
```

## Setting up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user
5. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)
6. Get your connection string from "Connect" → "Connect your application"
7. Replace `<password>` with your database user password
8. Replace `<dbname>` with `bitlinks` (or your preferred database name)
