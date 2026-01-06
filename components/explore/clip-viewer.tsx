"use client"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import type { Clip } from "@/lib/mock-clips"

interface ClipViewerProps {
  clip: Clip | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClipViewer({ clip, open, onOpenChange }: ClipViewerProps) {
  if (!clip) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[90vw] sm:max-w-[600px] p-0 flex flex-col bg-background border-l border-border"
        side="right"
      >
        {/* Video Player Section */}
        <div className="aspect-video w-full bg-black relative flex items-center justify-center group">
          <img
            src={clip.thumbnailUrl || "/placeholder.svg"}
            alt="Play thumbnail"
            className="w-full h-full object-cover opacity-60"
          />
          <Button className="absolute rounded-full w-16 h-16 bg-primary/90 hover:bg-primary text-white border-0">
            <Icon name="play" className="w-8 h-8 ml-1" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-white font-semibold text-lg">{clip.result}</h3>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                Q{clip.quarter} | {clip.time}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                {clip.down} & {clip.distance}
              </Badge>
            </div>
          </div>
        </div>

        {/* Metadata Tabs */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="data" className="w-full">
            <div className="px-6 pt-4 border-b border-border">
              <TabsList className="bg-transparent p-0 gap-6">
                <TabsTrigger
                  value="data"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
                >
                  Play Data
                </TabsTrigger>
                <TabsTrigger
                  value="grading"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
                >
                  PFF Grades
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
                >
                  Coaching Notes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="data" className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Situation</div>
                  <div className="font-medium text-sm">
                    {clip.down} & {clip.distance} on {clip.yardLine}
                  </div>
                  <div className="font-medium text-sm text-muted-foreground">Hash: {clip.hash}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Personnel</div>
                  <div className="font-medium text-sm">Off: {clip.personnel.offense}</div>
                  <div className="font-medium text-sm">Def: {clip.personnel.defense}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Result</div>
                  <div className="font-medium text-sm">{clip.playType}</div>
                  <div className={`font-medium text-sm ${clip.gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {clip.gain > 0 ? "+" : ""}
                    {clip.gain} Yards
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Game Info</div>
                  <div className="font-medium text-sm">{clip.matchup}</div>
                  <div className="font-medium text-sm text-muted-foreground">{clip.date}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="grading" className="p-6">
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card">
                <div className="text-4xl font-bold text-primary">{clip.pffGrade}</div>
                <div>
                  <div className="font-medium">Overall Play Grade</div>
                  <div className="text-sm text-muted-foreground">Based on execution and outcome</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Pass Block</div>
                  <div className="text-lg font-semibold">{(50 + Math.random() * 40).toFixed(1)}</div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Run Block</div>
                  <div className="text-lg font-semibold">{(50 + Math.random() * 40).toFixed(1)}</div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Coverage</div>
                  <div className="text-lg font-semibold">{(50 + Math.random() * 40).toFixed(1)}</div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Pass Rush</div>
                  <div className="text-lg font-semibold">{(50 + Math.random() * 40).toFixed(1)}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="p-6">
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">JM</span>
                    </div>
                    <span className="text-sm font-medium">Coach Miller</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Good route concept. WR1 needs to sell the dig route better before breaking outside.
                  </p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Icon name="add" className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
