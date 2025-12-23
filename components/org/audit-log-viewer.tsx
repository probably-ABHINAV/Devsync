"use client"

import { useState, useEffect } from "react"
import { PermissionGate } from "@/components/auth/permission-gate"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Shield, Clock, User, Activity } from "lucide-react"

interface AuditLog {
    id: string
    action: string
    actor_id: string
    target_resource: string
    created_at: string
    details: any
}

export function AuditLogViewer() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Mock fetch for now, assuming backend endpoint /api/audit would exist
        const fetchLogs = async () => {
            setLoading(true)
            await new Promise(r => setTimeout(r, 1000))
            setLogs([
                { 
                    id: '1', 
                    action: 'org.update', 
                    actor_id: 'user_1', 
                    target_resource: 'org:acme', 
                    created_at: new Date().toISOString(), 
                    details: { field: 'name', old: 'Acme', new: 'Acme Corp' } 
                },
                { 
                    id: '2', 
                    action: 'ai.verify', 
                    actor_id: 'user_2', 
                    target_resource: 'insight:123', 
                    created_at: new Date(Date.now() - 3600000).toISOString(), 
                    details: { confidence: 0.95 } 
                }
            ])
            setLoading(false)
        }
        fetchLogs()
    }, [])

    return (
        <PermissionGate permission="org.manage" fallback={
            <div className="p-8 text-center text-gray-500 bg-white/5 rounded-xl border border-white/10">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-300">Access Restricted</h3>
                <p>Only Organization Admins can view audit logs.</p>
            </div>
        }>
            <Card className="bg-[#0d0d1a] border-white/10">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <CardTitle className="text-white">Audit Log</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Spinner /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-gray-400">Action</TableHead>
                                    <TableHead className="text-gray-400">Actor</TableHead>
                                    <TableHead className="text-gray-400">Resource</TableHead>
                                    <TableHead className="text-gray-400 text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-cyan-400" />
                                                <span className="font-mono text-sm text-cyan-300">{log.action}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-300">User {log.actor_id.slice(0,4)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-white/10 text-gray-400 font-mono text-xs">
                                                {log.target_resource}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-500 text-xs">
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </PermissionGate>
    )
}
