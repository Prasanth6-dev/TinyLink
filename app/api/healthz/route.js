// GET /healthz - Health check endpoint
export async function GET() {
  return Response.json({
    ok: true,
    version: '1.0',
    timestamp: new Date().toISOString()
  })
}

