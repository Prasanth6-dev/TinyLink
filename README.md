# TinyLink-(https://tiny-link-2svh.vercel.app/)

A full-featured URL shortener built with Next.js (App Router) and MongoDB, similar to bit.ly.

## Features

✅ **Create Short Links**
- Shorten long URLs with optional custom codes
- URL validation before saving
- Globally unique custom codes (409 error if code exists)

✅ **Redirect & Tracking**
- HTTP 302 redirects to original URLs
- Automatic click counting
- Last clicked timestamp tracking

✅ **Link Management**
- Delete existing links
- Deleted links return 404 (no longer redirect)

✅ **Dashboard**
- View all links in a table format
- See short code, target URL, total clicks, and last clicked time
- Add and delete links directly from the dashboard
- Search/filter by code or URL

✅ **Statistics**
- Detailed stats page for each link at `/code/:code`
- View click counts, timestamps, and link information

✅ **Health Check**
- System health endpoint at `/healthz`

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Database:** MongoDB
- **Language:** JavaScript / React

## Project Structure

```
app/
  ├── page.js                    # Dashboard (list, add, delete links)
  ├── [shorturl]/page.js        # Redirect handler (302 redirect)
  ├── code/[code]/page.js       # Stats page for individual links
  ├── api/
  │   ├── links/
  │   │   ├── route.js          # POST /api/links, GET /api/links
  │   │   └── [code]/route.js   # GET /api/links/:code, DELETE /api/links/:code
  │   └── healthz/route.js      # GET /healthz
  └── layout.js                 # Root layout with Navbar
lib/
  └── mongodb.js                # MongoDB connection helper
components/
  └── Navbar.js                 # Navigation component
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB database (use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for free hosting)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bitlinks
NEXT_PUBLIC_HOST=http://localhost:3000
```

For production, use your deployed URL:
```env
NEXT_PUBLIC_HOST=https://your-app.vercel.app
```

See `ENV_SETUP.md` for detailed setup instructions.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

All endpoints follow the assignment specification:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/links` | Create a new link (409 if code exists) |
| GET | `/api/links` | List all links |
| GET | `/api/links/:code` | Get stats for a specific link |
| DELETE | `/api/links/:code` | Delete a link |
| GET | `/healthz` | Health check endpoint |

### API Examples

**Create a link:**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "code": "example"}'
```

**List all links:**
```bash
curl http://localhost:3000/api/links
```

**Get link stats:**
```bash
curl http://localhost:3000/api/links/example
```

**Delete a link:**
```bash
curl -X DELETE http://localhost:3000/api/links/example
```

## Routes

| Path | Purpose | Auth |
|------|---------|------|
| `/` | Dashboard (list, add, delete) | Public |
| `/code/:code` | Stats for a single code | Public |
| `/:code` | Redirect (302 or 404) | Public |
| `/healthz` | Health check | Public |

## Database Schema

The application uses MongoDB with the following collection structure:

**Collection:** `url` (in database `bitlinks`)

**Document structure:**
```json
{
  "_id": ObjectId,
  "code": "string (unique)",
  "url": "string",
  "clicks": 0,
  "lastClicked": Date,
  "createdAt": Date
}
```

## Validation Rules

- **URL:** Must be a valid HTTP/HTTPS URL
- **Code:** Required, must be unique (409 error if duplicate)
- **Code Uniqueness:** Codes are globally unique (409 error if duplicate)

## Deployment

### Vercel + MongoDB Atlas (Recommended)

1. **Set up MongoDB Atlas:**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Whitelist your IP (or use 0.0.0.0/0 for Vercel)
   - Get your connection string

2. **Deploy to Vercel:**
   - Push your code to GitHub
   - Import project in Vercel
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `NEXT_PUBLIC_HOST`: Your Vercel deployment URL

3. **Deploy:**
   - Vercel will automatically build and deploy

### Other Platforms

- **Railway:** Supports MongoDB and Next.js
- **Render:** Free tier available for both web service and MongoDB

## Testing

The application follows the assignment specifications for automated testing:

- ✅ `/healthz` returns 200
- ✅ Creating a link works; duplicate codes return 409
- ✅ Redirect works and increments click count
- ✅ Deletion stops redirect (404)
- ✅ All API endpoints match the specification

## Features Implementation

### Click Tracking
- Each redirect increments the `clicks` counter
- `last_clicked` timestamp is updated on each redirect
- Stats are visible in the dashboard and stats page

### Error Handling
- **400:** Invalid URL or code format
- **404:** Link not found (for deleted/non-existent links)
- **409:** Code already exists
- **500:** Internal server error

### UI/UX
- Clean, responsive design with Tailwind CSS
- Loading states for async operations
- Success/error message notifications
- Form validation with inline feedback
- Copy-to-clipboard functionality
- Search/filter functionality
- Empty states for no links

## License

This project is created for a take-home assignment.
