import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id param' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // 1. Fetch Outgoing Links (this event -> others)
    const { data: outgoing, error: outError } = await supabase
      .from('event_links')
      .select(`
        link_type,
        target:target_event_id (
          id,
          title,
          source,
          activity_type,
          link_url
        )
      `)
      .eq('source_event_id', id)

    if (outError) throw outError

    // 2. Fetch Incoming Links (others -> this event)
    const { data: incoming, error: inError } = await supabase
      .from('event_links')
      .select(`
        link_type,
        source:source_event_id (
          id,
          title,
          source,
          activity_type,
          link_url
        )
      `)
      .eq('target_event_id', id)

    if (inError) throw inError

    // 3. Format Response
    const links = [
      ...(outgoing || []).map((link: any) => ({
        id: link.target.id,
        title: link.target.title,
        source: link.target.source,
        type: link.target.activity_type,
        url: link.target.link_url,
        relationship: 'outgoing', // e.g. "relates to"
        linkType: link.link_type
      })),
      ...(incoming || []).map((link: any) => ({
        id: link.source.id,
        title: link.source.title,
        source: link.source.source,
        type: link.source.activity_type,
        url: link.source.link_url,
        relationship: 'incoming', // e.g. "referenced by"
        linkType: link.link_type
      }))
    ]

    return NextResponse.json({ links })
  } catch (error: any) {
    console.error('Links API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
