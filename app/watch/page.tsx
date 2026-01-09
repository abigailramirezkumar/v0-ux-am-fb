"use client"

import { LibraryView } from "@/components/library-view"
import { GridModule } from "@/components/grid-module"
import { VideoModule } from "@/components/video-module"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { WatchProvider } from "@/components/watch/watch-context"

export default function WatchPage() {
  return (
    <WatchProvider>
      <div className="h-full w-full overflow-hidden bg-sidebar">
        <ResizablePanelGroup direction="vertical">
          {/* TOP SECTION: Library + Video */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full pr-1 pb-1">
                  <LibraryView />
                </div>
              </ResizablePanel>
              <ResizableHandle className="bg-transparent" />
              <ResizablePanel defaultSize={70} minSize={20}>
                <div className="h-full pb-1">
                  <VideoModule />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle className="bg-transparent" />

          {/* BOTTOM SECTION: Grid */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="h-full">
              <GridModule />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </WatchProvider>
  )
}
