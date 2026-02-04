"use client"

import { WatchProvider } from "@/components/watch/watch-context"
import { WatchGrid } from "@/components/watch/watch-grid"
import { getAllUniqueClips } from "@/lib/mock-datasets"

export default function ExplorePage() {
  // Get all unique clips combined into one dataset
  const allClipsDataset = getAllUniqueClips()

  return (
    <WatchProvider initialTabs={[allClipsDataset]}>
      <div className="flex flex-col h-full w-full bg-sidebar">
        <div className="flex-1 overflow-hidden">
          <WatchGrid />
        </div>
      </div>
    </WatchProvider>
  )
}
