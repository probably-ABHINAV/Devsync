"use client"

import { ReactNode } from "react"
import { usePermissions, Permission } from "@/lib/permissions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PermissionGateProps {
    children: ReactNode
    permission: Permission
    fallback?: ReactNode | "hide" | "disable"
}

export function PermissionGate({ children, permission, fallback = "hide" }: PermissionGateProps) {
    const { can } = usePermissions()
    const allowed = can(permission)

    if (allowed) return <>{children}</>

    // 1. Hide completely
    if (fallback === "hide") return null

    // 2. Custom fallback UI
    if (isValidElement(fallback)) return <>{fallback}</>

    // 3. Disable behavior (wrap children in a disabled state)
    // This assumes children is a single button/element that accepts disabled prop,
    // or we wrap it in a div with pointer-events-none and grayscale.
    if (fallback === "disable") {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="opacity-50 pointer-events-none grayscale cursor-not-allowed">
                            {children}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>You do not have permission to perform this action.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }
    
    return null
}

function isValidElement(element: any): element is ReactNode {
    return element !== null && typeof element === 'object' && 'props' in element
}
