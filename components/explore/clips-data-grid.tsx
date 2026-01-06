"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Clip } from "@/lib/mock-clips"

interface ClipsDataGridProps {
  clips: Clip[]
  onClipDoubleClick: (clip: Clip) => void
  selectedClipId: string | null
}

export function ClipsDataGrid({ clips, onClipDoubleClick, selectedClipId }: ClipsDataGridProps) {
  return (
    <div className="h-full overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ID
            </TableHead>
            <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Matchup
            </TableHead>
            <TableHead className="w-[60px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              QTR
            </TableHead>
            <TableHead className="w-[70px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Time
            </TableHead>
            <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dn & Dist
            </TableHead>
            <TableHead className="w-[90px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Yard Line
            </TableHead>
            <TableHead className="w-[50px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hash
            </TableHead>
            <TableHead className="w-[90px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personnel
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </TableHead>
            <TableHead className="w-[60px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Gain
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clips.map((clip) => (
            <TableRow
              key={clip.id}
              className={`cursor-pointer border-b border-border/50 transition-colors ${
                selectedClipId === clip.id ? "bg-primary/10" : "hover:bg-muted/50"
              }`}
              onDoubleClick={() => onClipDoubleClick(clip)}
            >
              <TableCell className="py-2 text-xs font-mono text-muted-foreground">{clip.id}</TableCell>
              <TableCell className="py-2 text-xs font-medium">{clip.matchup}</TableCell>
              <TableCell className="py-2 text-xs">Q{clip.quarter}</TableCell>
              <TableCell className="py-2 text-xs font-mono">{clip.time}</TableCell>
              <TableCell className="py-2 text-xs">
                {clip.down} & {clip.distance}
              </TableCell>
              <TableCell className="py-2 text-xs">{clip.yardLine}</TableCell>
              <TableCell className="py-2 text-xs text-center">{clip.hash}</TableCell>
              <TableCell className="py-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {clip.personnel.offense}
                </Badge>
              </TableCell>
              <TableCell className="py-2 text-xs max-w-[300px] truncate" title={clip.result}>
                {clip.result}
              </TableCell>
              <TableCell className={`py-2 text-xs font-medium ${clip.gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                {clip.gain > 0 ? "+" : ""}
                {clip.gain}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {clips.length === 0 && (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          No clips match the current filters
        </div>
      )}
    </div>
  )
}
