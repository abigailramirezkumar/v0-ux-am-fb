"use client"

import { useRef, useEffect } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ReportsModule } from "@/components/reports-module"
import { VideoModule } from "@/components/profile/video-module"
import { ProfileToolbar } from "@/components/profile/profile-toolbar"
import { ProfileProvider, useProfileContext } from "@/lib/profile-context"
import type { ImperativePanelHandle } from "react-resizable-panels"
import type { Team } from "@/lib/sports-data"

// Import the original profile page content
import { TeamProfilePage as TeamProfilePageContent } from "@/app/teams/[teamId]/team-profile-page"

interface TeamProfileV3Props {
  team: Team
}

function TeamProfileV3Content({ team }: TeamProfileV3Props) {
  const { visibleModules } = useProfileContext()
  const reportsPanelRef = useRef<ImperativePanelHandle>(null)
  const videoPanelRef = useRef<ImperativePanelHandle>(null)

  // Control reports panel expansion/collapse
  useEffect(() => {
    if (visibleModules.reports) {
      reportsPanelRef.current?.expand()
    } else {
      reportsPanelRef.current?.collapse()
    }
  }, [visibleModules.reports])

  // Control video panel expansion/collapse
  useEffect(() => {
    if (visibleModules.video) {
      videoPanelRef.current?.expand()
    } else {
      videoPanelRef.current?.collapse()
    }
  }, [visibleModules.video])

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
            defaultSize={75}
            minSize={30}
            id="team-profile-main"
            order={1}
          >
            <TeamProfilePageContent team={team} />
          </ResizablePanel>

          <ResizableHandle className="bg-transparent" />

          {/* Video Panel - collapsible, default closed */}
          <ResizablePanel
            ref={videoPanelRef}
            defaultSize={25}
            minSize={15}
            collapsible
            collapsedSize={0}
            id="team-video-panel"
            order={2}
          >
            <div className="h-full pl-1 overflow-hidden">
              <VideoModule />
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-transparent" />

          {/* Reports Panel - collapsible, default closed */}
          <ResizablePanel
            ref={reportsPanelRef}
            defaultSize={25}
            minSize={15}
            collapsible
            collapsedSize={0}
            id="team-reports-panel"
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

export function TeamProfileV3({ team }: TeamProfileV3Props) {
  return (
    <ProfileProvider>
      <TeamProfileV3Content team={team} />
    </ProfileProvider>
  )
}
