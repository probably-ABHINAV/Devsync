"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuditLogViewer } from "@/components/org/audit-log-viewer"
import { Users, Settings, Shield } from "lucide-react"

export default function OrgSettingsPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <h1 className="text-3xl font-bold text-white mb-2">Organization Settings</h1>
            <p className="text-gray-400 mb-8">Manage your organization preferences and access controls.</p>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-white/5 border border-white/10 w-full justify-start h-auto p-1 mb-8">
                    <TabsTrigger value="general" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                        <Settings className="w-4 h-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="members" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                        <Users className="w-4 h-4" /> Members
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                        <Shield className="w-4 h-4" /> Audit Logs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                     <Card className="bg-[#0d0d1a] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">General Information</CardTitle>
                            <CardDescription>Update your organization details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Organization Name</label>
                                <Input defaultValue="Acme Corp" className="bg-white/5 border-white/10" />
                            </div>
                            <Button className="bg-cyan-500 hover:bg-cyan-600">Save Changes</Button>
                        </CardContent>
                     </Card>
                </TabsContent>

                <TabsContent value="members">
                    <Card className="bg-[#0d0d1a] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Team Members</CardTitle>
                            <CardDescription>Manage access and roles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-lg">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Member management coming soon.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit">
                    <AuditLogViewer />
                </TabsContent>
            </Tabs>
        </div>
    )
}
