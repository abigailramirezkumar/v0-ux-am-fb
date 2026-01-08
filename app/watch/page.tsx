"use client"

import { LibraryView } from "@/components/library-view"
import { GridModule } from "@/components/grid-module"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export default function WatchPage() {
  return (
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup direction="vertical">
        {/* Top: Library (Retains state via Context) */}
        <ResizablePanel defaultSize={50} minSize={20}>
          <LibraryView />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Bottom: Grid */}
        <ResizablePanel defaultSize={50} minSize={20}>
          <GridModule />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
