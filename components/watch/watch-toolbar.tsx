"use client"

import type React from "react"

import { useWatchContext } from "@/components/watch/watch-context"
import { cn } from "@/lib/utils"

const LibraryIcon = ({ className }: { className?: string }) => (
  <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 0.25C10 0.111929 10.1119 0 10.25 0H10.75C10.8881 0 11 0.111929 11 0.25V11.75C11 11.8881 10.8881 12 10.75 12H10.25C10.1119 12 10 11.8881 10 11.75V0.25Z"
      fill="currentColor"
    />
    <path
      d="M7 0.25C7 0.111929 7.11193 0 7.25 0H7.75C7.88807 0 8 0.111929 8 0.25V11.75C8 11.8881 7.88807 12 7.75 12H7.25C7.11193 12 7 11.8881 7 11.75V0.25Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 0.336008C5 0.168542 4.83857 0.0484301 4.67816 0.096551L0.178163 1.44655C0.072417 1.47827 0 1.57561 0 1.68601V10.314C0 10.4244 0.0724168 10.5217 0.178163 10.5534L4.67816 11.9034C4.83857 11.9516 5 11.8315 5 11.664V0.336008ZM4 1.34403L1 2.24403V9.75597L4 10.656V1.34403Z"
      fill="currentColor"
    />
  </svg>
)

const VideoIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M4.62552 9.87441C4.70589 9.95479 4.8149 9.99994 4.92856 9.99994C4.9951 9.99994 5.06073 9.98446 5.12026 9.95473L10.263 7.38332C10.3342 7.34773 10.3941 7.29302 10.436 7.22531C10.4778 7.15759 10.5 7.07957 10.5 6.99996C10.5 6.92036 10.4778 6.84233 10.436 6.77462C10.3941 6.70691 10.3342 6.6522 10.263 6.61661L5.12026 4.0452C5.05492 4.01252 4.98231 3.99709 4.90932 4.00037C4.83633 4.00365 4.7654 4.02554 4.70325 4.06395C4.6411 4.10236 4.58981 4.15602 4.55423 4.21983C4.51866 4.28365 4.49999 4.3555 4.5 4.42856V9.57137C4.5 9.68503 4.54515 9.79404 4.62552 9.87441Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.11101 1.17971C4.26216 0.410543 5.61553 0 7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.38447 13.5895 9.73785 12.8203 10.889C12.0511 12.0401 10.9579 12.9373 9.67879 13.4672C8.3997 13.997 6.99224 14.1356 5.63437 13.8655C4.2765 13.5954 3.02922 12.9287 2.05026 11.9497C1.07129 10.9708 0.404603 9.7235 0.134506 8.36563C-0.13559 7.00776 0.00303292 5.6003 0.532846 4.32122C1.06266 3.04213 1.95987 1.94888 3.11101 1.17971ZM10.3334 2.01118C9.34673 1.35189 8.18669 1 7 1C5.4087 1 3.88258 1.63214 2.75736 2.75736C1.63214 3.88258 1 5.4087 1 7C1 8.18669 1.3519 9.34673 2.01119 10.3334C2.67047 11.3201 3.60755 12.0892 4.7039 12.5433C5.80026 12.9974 7.00666 13.1162 8.17054 12.8847C9.33443 12.6532 10.4035 12.0818 11.2426 11.2426C12.0818 10.4035 12.6532 9.33443 12.8847 8.17054C13.1162 7.00666 12.9974 5.80026 12.5433 4.7039C12.0892 3.60754 11.3201 2.67047 10.3334 2.01118Z"
      fill="currentColor"
    />
  </svg>
)

const GridIcon = ({ className }: { className?: string }) => (
  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.8003 0.00488281C11.9143 0.0281459 12 0.129143 12 0.25V9.75L11.9951 9.80029C11.9752 9.89804 11.898 9.97517 11.8003 9.99512L11.75 10H0.25L0.199707 9.99512C0.101959 9.97517 0.0248324 9.89804 0.00488281 9.80029L0 9.75V0.25C0 0.129143 0.0857237 0.0281459 0.199707 0.00488281L0.25 0H11.75L11.8003 0.00488281ZM1 7V9H5.5V7H1ZM6.5 7V9H11V7H6.5ZM1 6H5.5V4H1V6ZM6.5 6H11V4H6.5V6ZM1 3H5.5V1H1V3ZM6.5 3H11V1H6.5V3Z"
      fill="currentColor"
    />
  </svg>
)

export function WatchToolbar() {
  const { visibleModules, toggleModule } = useWatchContext()

  const ToggleBtn = ({
    active,
    onClick,
    icon,
    label,
  }: {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-md transition-colors px-[0] h-10 w-10 gap-1",
        active
          ? "bg-foreground/90 text-background dark:bg-white/90 dark:text-sidebar"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      {icon}
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  )

  return (
    <div className="w-16 flex flex-col bg-sidebar border-l border-border/20 z-20 shrink-0 items-center gap-3 py-3">
      <ToggleBtn
        active={visibleModules.library}
        onClick={() => toggleModule("library")}
        icon={<LibraryIcon className="w-4 h-4" />}
        label="Library"
      />
      <ToggleBtn
        active={visibleModules.video}
        onClick={() => toggleModule("video")}
        icon={<VideoIcon className="w-4 h-4" />}
        label="Video"
      />
      <ToggleBtn
        active={visibleModules.grid}
        onClick={() => toggleModule("grid")}
        icon={<GridIcon className="w-4 h-4" />}
        label="Grid"
      />
    </div>
  )
}
