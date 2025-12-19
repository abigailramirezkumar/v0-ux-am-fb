"use client"

import { useState } from "react"
import { Icon } from "@/components/icon"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCatapultImportContext } from "@/lib/catapult-import-context"

export function DemoOptionsWidget() {
  const { activeVersion, setActiveVersion } = useCatapultImportContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-colors">
            <Icon name="settings" size={24} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold text-foreground">Catapult Import Version</div>
          <DropdownMenuItem
            onClick={() => setActiveVersion("v1")}
            className={activeVersion === "v1" ? "bg-accent" : ""}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activeVersion === "v1" ? "bg-blue-600" : "bg-muted"}`} />
              Version 1
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setActiveVersion("v2")}
            className={activeVersion === "v2" ? "bg-accent" : ""}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activeVersion === "v2" ? "bg-blue-600" : "bg-muted"}`} />
              Version 2
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setActiveVersion("v3")}
            className={activeVersion === "v3" ? "bg-accent" : ""}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activeVersion === "v3" ? "bg-blue-600" : "bg-muted"}`} />
              Version 3
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
