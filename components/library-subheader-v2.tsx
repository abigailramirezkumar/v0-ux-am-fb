"use client"

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
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/icon"
import { useDensity } from "@/lib/density-context"

interface BreadcrumbItem {
  id: string
  name: string
}

interface LibrarySubheaderV2Props {
  breadcrumbs: BreadcrumbItem[]
  onNavigate: (folderId: string | null) => void
  onCreateFolder: () => void
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 0.249998C10 0.111927 10.1119 -1.76803e-06 10.25 -1.79217e-06L10.75 -1.87959e-06C10.8881 -1.90373e-06 11 0.111927 11 0.249998L11 11.75C11 11.8881 10.8881 12 10.75 12L10.25 12C10.1119 12 10 11.8881 10 11.75L10 0.249998Z"
        fill="currentColor"
      />
      <path
        d="M7 0.249999C7 0.111927 7.11193 -1.24349e-06 7.25 -1.26763e-06L7.75 -1.35505e-06C7.88807 -1.37919e-06 8 0.111927 8 0.249999L8 11.75C8 11.8881 7.88807 12 7.75 12L7.25 12C7.11193 12 7 11.8881 7 11.75L7 0.249999Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 0.336007C5 0.168541 4.83857 0.0484293 4.67816 0.0965502L0.178163 1.44655C0.0724173 1.47827 2.75488e-07 1.57561 2.94791e-07 1.68601L1.80336e-06 10.314C1.82266e-06 10.4244 0.0724186 10.5217 0.178165 10.5534L4.67817 11.9034C4.83857 11.9516 5 11.8315 5 11.664L5 0.336007ZM4 1.34403L1 2.24403L1 9.75597L4 10.656L4 1.34403Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function LibrarySubheaderV2({ breadcrumbs, onNavigate, onCreateFolder }: LibrarySubheaderV2Props) {
  const { density, setDensity } = useDensity()

  return (
    <>
      {/* Breadcrumbs */}
      <div className="sticky top-0 z-10 flex items-center justify-between w-full py-4 bg-background border-b border-border px-0 pt-0 pb-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => onNavigate(null)}
            className="hover:text-foreground transition-colors flex items-center"
            aria-label="Go to library root"
          >
            <LibraryIcon className="w-3 h-3" />
          </button>

          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-2">
              <span>/</span>
              <button
                onClick={() => onNavigate(crumb.id)}
                className={`hover:text-foreground transition-colors text-foreground ${
                  index === breadcrumbs.length - 1 ? "font-semibold" : ""
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}

          <span>/</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Add content">
                <Icon name="add" className="w-5 h-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCreateFolder}>
                <Icon name="folder" className="w-4 h-4 mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Library settings">
                <Icon name="settings" className="w-5 h-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
              <DropdownMenuItem disabled>Settings coming soon</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Fixed Column Headers */}
      <div className="sticky top-[53px] z-10 flex items-center py-2 bg-background border-b border-border">
        {/* Left padding to match rows */}
        <div className="flex-shrink-0 pl-4" />

        {/* Checkbox area - fixed width */}
        <div className="flex-shrink-0 w-6" />

        {/* Icon area - fixed width to match library item thumbnails */}
        <div className="flex-shrink-0 w-9 ml-3" />

        {/* Name column - flexible */}
        <div className="flex-1 min-w-0 ml-[-4px] mr-[0x]">
          <span className="text-sm font-bold text-muted-foreground">Name</span>
        </div>

        {/* Modified column - fixed width */}
        <div className="w-32 flex-shrink-0 ml-3">
          <span className="text-sm font-bold text-muted-foreground">Modified</span>
        </div>

        {/* Type column - fixed width */}
        <div className="w-24 flex-shrink-0 ml-3 mr-[-16px]">
          <span className="text-sm font-bold text-muted-foreground">Type</span>
        </div>

        {/* Actions area - fixed width */}
        <div className="w-8 flex-shrink-0 ml-3 mr-4" />
      </div>
    </>
  )
}
