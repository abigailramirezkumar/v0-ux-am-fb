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
            <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dn & Dist
            </TableHead>
            <TableHead className="w-[70px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Yard Line
            </TableHead>
            <TableHead className="w-[60px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hash
            </TableHead>
            <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Play Type
            </TableHead>
            <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Depth/Dir
            </TableHead>
            <TableHead className="w-[90px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personnel
            </TableHead>
            <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Result
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
              <TableCell className="py-2 text-xs">
                {clip.down} & {clip.distance}
              </TableCell>
              <TableCell className="py-2 text-xs">{clip.yardLine}</TableCell>
              <TableCell className="py-2 text-xs text-center">{clip.hash}</TableCell>
              <TableCell className="py-2">
                <div className="flex flex-wrap gap-1">
                  {clip.playDevelopment.playAction && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-blue-500/10 text-blue-600 border-blue-500/30">PA</Badge>
                  )}
                  {clip.playDevelopment.rpo && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-purple-500/10 text-purple-600 border-purple-500/30">RPO</Badge>
                  )}
                  {clip.playDevelopment.screen && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-orange-500/10 text-orange-600 border-orange-500/30">Screen</Badge>
                  )}
                  {clip.passing && !clip.playDevelopment.playAction && !clip.playDevelopment.rpo && !clip.playDevelopment.screen && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">Pass</Badge>
                  )}
                  {clip.rushing && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">Rush</Badge>
                  )}
                  {clip.specialTeams && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-gray-500/10">{clip.specialTeams.type}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2 text-xs text-muted-foreground">
                {clip.passing?.receiver?.depth || clip.rushing?.direction?.split(' ')[0] || '-'}
              </TableCell>
              <TableCell className="py-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {clip.personnel.offense}
                </Badge>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex flex-wrap gap-1">
                  {clip.playResult.touchdown && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded">TD</span>
                  )}
                  {clip.playResult.turnover && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded">{clip.playResult.turnover}</span>
                  )}
                  {clip.playResult.firstDown && !clip.playResult.touchdown && (
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded">1st</span>
                  )}
                  {clip.passing?.sack && (
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">Sack</span>
                  )}
                  {!clip.playResult.touchdown && !clip.playResult.turnover && !clip.playResult.firstDown && !clip.passing?.sack && (
                    <span className="text-[10px] text-muted-foreground">
                      {clip.passing?.result || (clip.rushing ? 'Rush' : clip.specialTeams?.result || '-')}
                    </span>
                  )}
                </div>
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
