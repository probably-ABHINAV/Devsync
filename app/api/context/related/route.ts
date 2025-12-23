import { NextResponse } from 'next/server'
import { findRelatedContext } from '@/lib/context'

export async function POST(req: Request) {
  try {
    const { text, threshold } = await req.json()
    
    if (!text) {
      return NextResponse.json({ error: 'Text prompt (query) is required' }, { status: 400 })
    }

    const results = await findRelatedContext(text, threshold || 0.6, 5)
    
    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Context Search Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
