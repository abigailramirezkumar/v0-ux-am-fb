"use client"

import { useRef, useEffect } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ReportsModule } from "@/components/reports-module"
import { VideoModule } from "@/components/profile/video-module"
import { ProfileToolbar } from "@/components/profile/profile-toolbar"
import { ProfileProvider, useProfileContext } from "@/lib/profile-context"
import type { ImperativePanelHandle } from "react-resizable-panels"
import type { Athlete } from "@/types/athlete"

// Import the original profile page content
import { AthleteProfilePage as AthleteProfilePageContent } from "@/app/athletes/[athleteId]/athlete-profile-page"

interface AthleteProfileV3Props {
  athlete: Athlete & { id: string }
}

function AthleteProfileV3Content({ athlete }: AthleteProfileV3Props) {
  const { visibleModules } = useProfileContext()
  const videoPanelRef = useRef<ImperativePanelHandle>(null)
  const reportsPanelRef = useRef<ImperativePanelHandle>(null)
  const initializedRef = useRef(false)

  // Collapse panels on mount, then respond to toggle changes
  useEffect(() => {
    if (!initializedRef.current) {
      // Initial collapse on mount
      videoPanelRef.current?.collapse()
      reportsPanelRef.current?.collapse()
      initializedRef.current = true
      return
    }
  }, [])

  // Control video panel expansion/collapse
  useEffect(() => {
    if (!initializedRef.current) return
    const panel = videoPanelRef.current
    if (!panel) return
    
    if (visibleModules.video) {
      panel.expand()
    } else {
      panel.collapse()
    }
  }, [visibleModules.video])

  // Control reports panel expansion/collapse
  useEffect(() => {
    if (!initializedRef.current) return
    const panel = reportsPanelRef.current
    if (!panel) return
    
    if (visibleModules.reports) {
      panel.expand()
    } else {
      panel.collapse()
    }
  }, [visibleModules.reports])

  return (
    <div className="flex h-full w-full">
      {/* Main Resizable Area */}
      <div className="flex-1 min-w-0 bg-sidebar">
        <ResizablePanelGroup
          direction="horizontal"
          className="[&>div]:transition-all [&>div]:duration-300 [&>div]:ease-in-out"
        >
          {/* Main Content Panel */}
          <ResizablePanel
            defaultSize={50}
            minSize={30}
            id="athlete-profile-main"
            order={1}
          >
            <AthleteProfilePageContent athlete={athlete} />
          </ResizablePanel>

          <ResizableHandle className="bg-transparent" />

          {/* Video Panel - collapsible */}
          <ResizablePanel
            ref={videoPanelRef}
            defaultSize={25}
            minSize={15}
            collapsible
            collapsedSize={0}
            id="athlete-video-panel"
            order={2}
          >
            <div className="h-full pl-1 overflow-hidden">
              <VideoModule />
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-transparent" />

          {/* Reports Panel - collapsible */}
          <ResizablePanel
            ref={reportsPanelRef}
            defaultSize={25}
            minSize={15}
            collapsible
            collapsedSize={0}
            id="athlete-reports-panel"
            order={3}
          >
            <div className="h-full pl-1 overflow-hidden">
              <ReportsModule />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* RHS Toolbar */}
      <ProfileToolbar />
    </div>
  )
}

export function AthleteProfileV3({ athlete }: AthleteProfileV3Props) {
  return (
    <ProfileProvider>
      <AthleteProfileV3Content athlete={athlete} />
    </ProfileProvider>
  )
}
