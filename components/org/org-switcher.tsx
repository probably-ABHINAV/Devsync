"use client"

import { useOrg } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, Plus, ChevronsUpDown, Check } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function OrgSwitcher() {
    const { org, switchOrg, loading } = useOrg()
    const [open, setOpen] = useState(false)

    // Mock orgs for now until backend is fully hooked up
    const orgs = [
      { id: '1', name: 'Acme Corp', slug: 'acme' },
      { id: '2', name: 'Personal', slug: 'personal' }
    ]

    const handleSwitch = (id: string) => {
        switchOrg(id)
        setOpen(false)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
            <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 px-3 border border-white/10 bg-white/5 hover:bg-white/10 mb-4 rounded-xl"
            >
            <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                     <Building2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                     <span className="font-semibold text-sm leading-none text-white">{org?.name || 'Select Org'}</span>
                     <span className="text-xs text-gray-500">{org?.role.name || 'Loading...'}</span>
                </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px] bg-[#0d0d1a] border-white/10 text-gray-300">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {orgs.map((o) => (
                <DropdownMenuItem
                    key={o.id}
                    onSelect={() => handleSwitch(o.id)}
                    className="flex items-center justify-between cursor-pointer focus:bg-white/10 focus:text-white"
                >
                    <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                              {o.name[0]}
                         </div>
                         {o.name}
                    </div>
                    {org?.id === o.id && <Check className="w-4 h-4 text-emerald-400" />}
                </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="cursor-pointer text-cyan-400 focus:text-cyan-300 focus:bg-cyan-500/10 gap-2">
                <Plus className="w-4 h-4" />
                Create Organization
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    )
}
