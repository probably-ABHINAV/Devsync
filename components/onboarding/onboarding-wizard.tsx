"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Check, ChevronRight, Building2, Users, LayoutGrid, Zap } from "lucide-react"

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(1)
    const [orgName, setOrgName] = useState("")

    const steps = [
        { id: 1, title: "Create Organization", icon: Building2 },
        { id: 2, title: "Connect Tools", icon: LayoutGrid },
        { id: 3, title: "Invite Team", icon: Users },
        { id: 4, title: "Choose Focus", icon: Zap },
    ]

    const handleNext = () => {
        if (step < 4) setStep(step + 1)
        else onComplete()
    }

    return (
        <div className="fixed inset-0 bg-[#030308] z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10" />
                    {steps.map((s) => (
                        <div key={s.id} className="flex flex-col items-center gap-2 bg-[#030308] px-2 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                step >= s.id ? 'bg-cyan-500 text-white' : 'bg-white/10 text-gray-400'
                            }`}>
                                {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                            </div>
                            <span className={`text-xs ${step >= s.id ? 'text-white' : 'text-gray-500'}`}>{s.title}</span>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-white mb-2">Name Your Organization</h2>
                                        <p className="text-gray-400">This will be your workspace for all OpsCord activity.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Organization Name</Label>
                                        <Input 
                                            value={orgName} 
                                            onChange={(e) => setOrgName(e.target.value)}
                                            placeholder="e.g. Acme Engineering" 
                                            className="bg-white/5 border-white/10 text-lg py-6"
                                        />
                                    </div>
                                    <Button 
                                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500" 
                                        size="lg"
                                        onClick={handleNext}
                                        disabled={!orgName}
                                    >
                                        Create Organization <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Tools</h2>
                                        <p className="text-gray-400">Ingest events from your stack.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['GitHub', 'Jira', 'Slack', 'GitLab'].map((tool) => (
                                            <div key={tool} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/10" />
                                                <span className="font-medium text-white">{tool}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={handleNext} className="w-full" variant="secondary">
                                        Skip & Continue <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-white mb-2">Invite Your Team</h2>
                                        <p className="text-gray-400">OpsCord is better together.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="colleague@example.com" 
                                                className="bg-white/5 border-white/10" 
                                                id="invite-email"
                                            />
                                            <Button 
                                                variant="outline"
                                                onClick={async () => {
                                                    const email = (document.getElementById('invite-email') as HTMLInputElement).value
                                                    if (!email) return
                                                    
                                                    // In a real flow, we'd have the orgId from step 1
                                                    // For now, we'll mock the orgId or assume the user has context
                                                    // This needs robust context state management in a full impl
                                                    console.log("Inviting", email)
                                                    
                                                    try {
                                                        const res = await fetch('/api/org/invite', {
                                                            method: 'POST',
                                                            body: JSON.stringify({ 
                                                                email, 
                                                                roleId: 'c0a80121-7ac0-4f1c-a1d2-000000000003', // Developer ID (need to fetch roles really)
                                                                orgId: '00000000-0000-0000-0000-000000000000' // Placeholder/Current Org
                                                            })
                                                        })
                                                        if (res.ok) alert('Invite sent!')
                                                        else alert('Failed to send invite')
                                                    } catch (e) {
                                                        console.error(e)
                                                        alert('Error sending invite')
                                                    }
                                                }}
                                            >
                                                Invite
                                            </Button>
                                        </div>
                                        <div className="text-xs text-gray-500 text-center">
                                            Role: <span className="text-white">Developer</span> (Default)
                                        </div>
                                    </div>
                                    <Button onClick={handleNext} className="w-full" variant="secondary">
                                        Skip <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6 text-center">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">All Set!</h2>
                                    <p className="text-gray-400 px-8">Your organization <strong>{orgName}</strong> is ready. Let's start prioritizing your DevOps intelligence.</p>
                                    <Button 
                                        className="w-full bg-gradient-to-r from-emerald-500 to-green-500" 
                                        size="lg"
                                        onClick={onComplete}
                                    >
                                        Enter Dashboard <Zap className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
