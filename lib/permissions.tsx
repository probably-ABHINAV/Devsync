import { createClient } from "@/lib/supabase/client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

// Types
export type Permission = 
    | 'org.manage' 
    | 'org.delete' 
    | 'member.manage' 
    | 'billing.manage' 
    | 'timeline.read' 
    | 'decision.create' 
    | 'decision.read' 
    | 'ai.verify' 
    | 'integration.manage'

export interface Role {
    id: string
    name: string
    permissions: Permission[]
}

export interface Organization {
    id: string
    name: string
    slug: string
    role: Role
}

interface OrgContextType {
    org: Organization | null
    loading: boolean
    switchOrg: (orgId: string) => Promise<void>
    permissions: Permission[]
    can: (permission: Permission) => boolean
}

// Context
const OrgContext = createContext<OrgContextType>({
    org: null,
    loading: true,
    switchOrg: async () => {},
    permissions: [],
    can: () => false
})

export const useOrg = () => useContext(OrgContext)

// Provider
export function OrgProvider({ children }: { children: ReactNode }) {
    const [org, setOrg] = useState<Organization | null>(null)
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // 1. Load active org from local storage or fetch first one
    useEffect(() => {
        const loadOrg = async () => {
            // Mocking the fetch for now until we have real data logic. 
            // In reality, this would query org_members + organizations + roles + role_permissions
            // For Phase 4 MVP, we will simulate if the table is empty.
            
            // Checking if user has any org
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // TODO: Replace with real RPC or join query once migration runs
            // fetchOrgData(user.id)
            setLoading(false)
        }
        loadOrg()
    }, [supabase])

    const switchOrg = async (orgId: string) => {
        setLoading(true)
        // Fetch new org details and permissions
        // setOrg(newOrg)
        setLoading(false)
    }

    const can = (permission: Permission) => {
        if (!org) return false
        // Owner override
        if (org.role.name === 'Owner') return true
        return permissions.includes(permission)
    }

    return (
        <OrgContext.Provider value={{ org, loading, switchOrg, permissions, can }}>
            {children}
        </OrgContext.Provider>
    )
}

// Hook for components
export function usePermissions() {
    const { can, permissions, org } = useOrg()
    return { can, permissions, role: org?.role.name }
}
