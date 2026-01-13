"use client"

import { useState, useRef, useEffect } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Icon } from "@/components/icon"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CatapultImportV1 } from "@/components/catapult-import-v1"
import { useCatapultImportContext } from "@/lib/catapult-import-context"
import { useLibraryContext } from "@/lib/library-context"
import type { FolderData } from "@/components/folder"

interface LibraryHeaderProps {
  showStorageIndicator?: boolean
  onImportComplete?: (folders: FolderData[]) => void
  showImportButton?: boolean
}

export function LibraryHeader({
  showStorageIndicator = false,
  onImportComplete,
  showImportButton = true,
}: LibraryHeaderProps) {
  const { viewMode, setViewMode } = useLibraryContext()
  const [displayViewMode, setDisplayViewMode] = useState("grid")
  const [useDropdown, setUseDropdown] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { activeVersion } = useCatapultImportContext()

  const orientations = [
    { value: "date", label: "By Date" },
    { value: "schedule", label: "By Schedule" },
    { value: "folder", label: "By Folder" },
    { value: "team", label: "By Team" },
  ]

  const orientation = viewMode === "schedule" ? "schedule" : "folder"
  const currentOrientation = orientations.find((item) => item.value === orientation)

  const handleOrientationChange = (value: string) => {
    if (value === "schedule") {
      setViewMode("schedule")
    } else if (value === "folder") {
      setViewMode("folder")
    }
    // "date" and "team" are placeholders for now, default to folder
    if (value === "date" || value === "team") {
      setViewMode("folder")
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setUseDropdown(entry.contentRect.width < 600)
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="flex items-center justify-between w-full bg-background border-b border-border px-0 border-none py-3 pb-4"
      >
        {useDropdown ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full bg-white text-black text-sm py-2 px-4 font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                {currentOrientation?.label}
                <Icon name="chevronDown" size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {orientations.map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onClick={() => handleOrientationChange(item.value)}
                  className={orientation === item.value ? "bg-accent" : ""}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            {orientations.map((item) => (
              <button
                key={item.value}
                onClick={() => handleOrientationChange(item.value)}
                className={`rounded-full transition-colors text-sm px-4 font-semibold whitespace-nowrap py-1.5 ${
                  orientation === item.value
                    ? "bg-[#1a1a1a] dark:bg-[#343434] text-white dark:text-white"
                    : "bg-[#e5e5e5] dark:bg-[#ffffff] text-[#4a4a4a] dark:text-[#1a1a1a] hover:bg-[#d5d5d5] dark:hover:bg-[#e5e5e5]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {showStorageIndicator && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border bg-card">
              <Icon name="upload" className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">60%</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[60%] bg-foreground rounded-full" />
                </div>
              </div>
            </div>
          )}

          <ToggleGroup
            type="single"
            value={displayViewMode}
            onValueChange={(value) => value && setDisplayViewMode(value)}
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Icon name="viewGrid" className="w-5 h-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <Icon name="viewList" className="w-5 h-5" />
            </ToggleGroupItem>
          </ToggleGroup>

          {showImportButton && activeVersion === "v1" && (
            <Button
              onClick={() => setImportModalOpen(true)}
              variant="outline"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Import
            </Button>
          )}
        </div>
      </div>

      {showImportButton && activeVersion === "v1" && onImportComplete && (
        <CatapultImportV1
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
          onImportComplete={onImportComplete}
        />
      )}
    </>
  )
}
