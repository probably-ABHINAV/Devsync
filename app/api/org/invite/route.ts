import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { email, roleId, orgId } = await req.json()

    // 1. Verify Authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Authorization Check (Simplistic for now, rely on RLS later or check org_members)
    // In a real app, verify `session.user.id` has 'member.manage' permission for `orgId`.

    // 3. Create Invite Token
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Leads to 7 days expiry

    // 4. Insert into DB
    const { data, error } = await supabase
      .from('org_invites')
      .insert({
        org_id: orgId,
        email,
        role_id: roleId,
        token,
        inviter_id: session.user.id,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // 5. Mock Email Sending (Log to console)
    console.log(`[Invites] Sending invite email to ${email} with token ${token}`)

    return NextResponse.json({ success: true, invite: data })
  } catch (error: any) {
    console.error('Invite Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
