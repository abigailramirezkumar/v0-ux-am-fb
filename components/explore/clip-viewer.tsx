"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import type { Clip } from "@/lib/mock-clips"

interface ClipViewerProps {
  clip: Clip | null
  onClose: () => void
}

export function ClipViewer({ clip, onClose }: ClipViewerProps) {
  if (!clip) return null

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Viewer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{clip.matchup}</span>
          <span className="text-xs text-muted-foreground">{clip.id}</span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} className="h-8 w-8">
          <Icon name="close" className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Video Player Section */}
        <div className="aspect-video w-full bg-black relative flex items-center justify-center group">
          <img
            src={clip.thumbnailUrl || "/placeholder.svg"}
            alt="Play thumbnail"
            className="w-full h-full object-cover opacity-60"
          />
          <Button className="absolute rounded-full w-14 h-14 bg-primary/90 hover:bg-primary text-white border-0 transition-transform hover:scale-105">
            <Icon name="play" className="w-6 h-6 ml-1" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <h3 className="text-white font-semibold text-base line-clamp-1">{clip.result}</h3>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0">
                Q{clip.quarter} | {clip.time}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0">
                {clip.down} & {clip.distance}
              </Badge>
            </div>
          </div>
        </div>

        {/* Metadata Tabs */}
        <Tabs defaultValue="data" className="w-full">
          <div className="px-4 pt-2 border-b border-border">
            <TabsList className="w-full justify-start bg-transparent p-0 gap-4 h-9">
              <TabsTrigger
                value="data"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 text-xs"
              >
                Play Data
              </TabsTrigger>
              <TabsTrigger
                value="grading"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 text-xs"
              >
                Grades
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 text-xs"
              >
                Notes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="data" className="p-4 space-y-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Situation</div>
                <div className="font-medium text-sm">
                  {clip.down} & {clip.distance} on {clip.yardLine}
                </div>
                <div className="text-xs text-muted-foreground">Hash: {clip.hash}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Personnel</div>
                <div className="font-medium text-sm">Off: {clip.personnel.offense}</div>
                <div className="text-xs text-muted-foreground">Def: {clip.personnel.defense}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Result</div>
                <div className="font-medium text-sm">{clip.playType}</div>
                <div className={`font-medium text-sm ${clip.gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {clip.gain > 0 ? "+" : ""}
                  {clip.gain} Yards
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="grading" className="p-4">
            <div className="flex items-center gap-4 p-3 border border-border rounded-lg bg-muted/20">
              <div className="text-3xl font-bold text-primary">{clip.pffGrade}</div>
              <div>
                <div className="font-medium text-sm">Play Grade</div>
                <div className="text-xs text-muted-foreground">Overall execution</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="p-4">
            <div className="text-center py-8 text-muted-foreground text-sm">No coaching notes added yet.</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
