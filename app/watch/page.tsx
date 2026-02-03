"use client"

import { useEffect, useRef } from "react"
import { LibraryView } from "@/components/library-view"
import { GridModule } from "@/components/grid-module"
import { VideoModule } from "@/components/video-module"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useWatchContext } from "@/components/watch/watch-context"
import { WatchToolbar } from "@/components/watch/watch-toolbar"
import type { ImperativePanelHandle } from "react-resizable-panels"

function WatchContent() {
  const { visibleModules } = useWatchContext()

  const libraryPanelRef = useRef<ImperativePanelHandle>(null)
  const videoPanelRef = useRef<ImperativePanelHandle>(null)
  const gridPanelRef = useRef<ImperativePanelHandle>(null)

  useEffect(() => {
    if (visibleModules.library) {
      libraryPanelRef.current?.expand()
    } else {
      libraryPanelRef.current?.collapse()
    }
  }, [visibleModules.library])

  useEffect(() => {
    if (visibleModules.video) {
      videoPanelRef.current?.expand()
    } else {
      videoPanelRef.current?.collapse()
    }
  }, [visibleModules.video])

  useEffect(() => {
    if (visibleModules.grid) {
      gridPanelRef.current?.expand()
    } else {
      gridPanelRef.current?.collapse()
    }
  }, [visibleModules.grid])

  return (
    <div className="flex h-full w-full">
      {/* Main Resizable Area */}
      <div className="flex-1 min-w-0 bg-sidebar">
        <ResizablePanelGroup
          direction="vertical"
          className="[&>div]:transition-all [&>div]:duration-300 [&>div]:ease-in-out"
        >
          {/* TOP SECTION: Library + Video */}
          <ResizablePanel defaultSize={60} minSize={20} id="top-panel" order={1}>
            <ResizablePanelGroup
              direction="horizontal"
              className="[&>div]:transition-all [&>div]:duration-300 [&>div]:ease-in-out"
            >
              {/* Library Panel - always rendered, collapsible */}
              <ResizablePanel
                ref={libraryPanelRef}
                defaultSize={30}
                minSize={15}
                collapsible
                collapsedSize={0}
                id="library-panel"
                order={1}
              >
                <div className="h-full pr-1 pb-1 overflow-hidden">
                  <LibraryView />
                </div>
              </ResizablePanel>

              <ResizableHandle className="bg-transparent" />

              {/* Video Panel - always rendered, collapsible */}
              <ResizablePanel
                ref={videoPanelRef}
                defaultSize={70}
                minSize={15}
                collapsible
                collapsedSize={0}
                id="video-panel"
                order={2}
              >
                <div className="h-full pb-1 overflow-hidden">
                  <VideoModule />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle className="bg-transparent" />

          {/* BOTTOM SECTION: Grid - always rendered, collapsible */}
          <ResizablePanel
            ref={gridPanelRef}
            defaultSize={40}
            minSize={15}
            collapsible
            collapsedSize={0}
            id="grid-panel"
            order={2}
          >
            <div className="h-full overflow-hidden">
              <GridModule />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* RHS Toolbar */}
      <WatchToolbar />
    </div>
  )
}

export default function WatchPage() {
  return (
    <div className="h-full w-full overflow-hidden bg-sidebar">
      <WatchContent />
    </div>
  )
}
