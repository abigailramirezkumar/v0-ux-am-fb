"use client"

import { LibraryView } from "@/components/library-view"
import { GridModule } from "@/components/grid-module"
import { VideoModule } from "@/components/video-module"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { WatchProvider } from "@/components/watch/watch-context"

export default function WatchPage() {
  return (
    <WatchProvider>
      <div className="h-full w-full overflow-hidden bg-background">
        <ResizablePanelGroup direction="vertical">
          {/* TOP SECTION: Library + Video */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={30} minSize={20} className="border-r border-border">
                <LibraryView />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={70} minSize={20}>
                <VideoModule />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* BOTTOM SECTION: Grid */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <GridModule />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </WatchProvider>
  )
}
