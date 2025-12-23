import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateDailyDigest } from '@/lib/ai/intelligence'

// POST /api/jobs/intelligence/digest
// Body: { orgId }
export async function POST(req: Request) {
    try {
        const { orgId } = await req.json()
        
        // Basic auth check or verify service role?
        // For now, allow internal calls
        
        const summary = await generateDailyDigest(orgId)
        
        return NextResponse.json({ success: true, summary })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
