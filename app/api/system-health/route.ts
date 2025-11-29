import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getServiceSupabase()
    const { error } = await supabase.from('users').select('count').limit(1)
    
    return Response.json({
      status: error ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        supabase: error ? 'error' : 'ok',
        github_api: 'ok',
        next_server: 'ok'
      }
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: 'System check failed'
    }, { status: 503 })
  }
}
