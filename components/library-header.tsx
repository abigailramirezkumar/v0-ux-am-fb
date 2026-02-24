"use client"

import { useState, useRef, useEffect } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { CatapultImportV1 } from "@/components/catapult-import-v1"
import { useCatapultImportContext } from "@/lib/catapult-import-context"
import { useLibraryContext } from "@/lib/library-context"
import { useDensity } from "@/lib/density-context"
import type { FolderData } from "@/components/folder"

interface LibraryHeaderProps {
  showStorageIndicator?: boolean
  onImportComplete?: (folders: FolderData[]) => void
  showImportButton?: boolean
  onReorderFolders?: () => void
}

export function LibraryHeader({
  showStorageIndicator = false,
  onImportComplete,
  showImportButton = true,
  onReorderFolders,
}: LibraryHeaderProps) {
  const { viewMode, setViewMode, columns, setColumns, layoutMode, setLayoutMode } = useLibraryContext()
  const { density, setDensity } = useDensity()
  const [useDropdown, setUseDropdown] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { activeVersion } = useCatapultImportContext()

  const orientations = [
    // { value: "date", label: "By Date" },
    { value: "schedule", label: "By Schedule" },
    { value: "folder", label: "By Folder" },
    // { value: "team", label: "By Team" },
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

  const toggleColumn = (columnId: string) => {
    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, visible: !col.visible }
        }
        return col
      }),
    )
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        setUseDropdown(w < 600)
        setIsNarrow(w < window.innerWidth * 0.25)
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
              <button className="bg-foreground text-background text-sm py-2 px-4 font-semibold flex items-center gap-2 rounded-lg shadow-sm">
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
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200",
                  orientation === item.value
                    ? "bg-foreground text-background shadow-sm" // Active: High Contrast
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted", // Inactive: Subtle pill background
                )}
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

          {!isNarrow && (
            <ToggleGroup
              type="single"
              value={layoutMode}
              onValueChange={(value) => value && setLayoutMode(value as "list" | "grid")}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Icon name="viewGrid" className="w-5 h-5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <Icon name="viewList" className="w-5 h-5" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}

          {/* {showImportButton && activeVersion === "v1" && (
            <Button
              onClick={() => setImportModalOpen(true)}
              variant="outline"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Import
            </Button>
          )} */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Library settings">
                <Icon name="settings" className="w-5 h-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isNarrow && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>View</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={layoutMode}
                      onValueChange={(value) => setLayoutMode(value as "list" | "grid")}
                    >
                      <DropdownMenuRadioItem value="grid">Tile</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Show/Hide Columns</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.visible}
                      onCheckedChange={() => toggleColumn(column.id)}
                      disabled={column.id === "name"}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Density</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={density}
                    onValueChange={(value) => setDensity(value as "default" | "dense" | "spacious")}
                  >
                    <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dense">Dense</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="spacious">Spacious</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>


            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Keep Catapult Import modal functionality */}
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
