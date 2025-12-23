import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ decisions: data })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, status, tags, activity_id } = body

    const { data, error } = await supabase
      .from('decisions')
      .insert([
        { title, description, status, tags, activity_id }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ decision: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
