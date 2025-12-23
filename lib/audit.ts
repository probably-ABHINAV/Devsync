import { createClient } from "@/lib/supabase/client"

export type AuditAction = 
    | 'org.create'
    | 'org.update'
    | 'member.invite'
    | 'member.remove'
    | 'member.role_update'
    | 'integration.connect'
    | 'integration.disconnect'
    | 'decision.create'
    | 'ai.verify'

interface AuditLogParams {
    orgId: string
    action: AuditAction
    targetResource: string
    details?: Record<string, any>
}

export async function logAudit({ orgId, action, targetResource, details = {} }: AuditLogParams) {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
        await supabase.from('audit_logs').insert({
            organization_id: orgId,
            actor_id: user.id,
            action,
            target_resource: targetResource,
            details
        })
    } catch (error) {
        console.error("Failed to log audit event:", error)
        // Fail silently in frontend for now, but in production use a reliable queue
    }
}
