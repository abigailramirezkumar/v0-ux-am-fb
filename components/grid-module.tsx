"use client"

import { useEffect } from "react"
import { useWatchContext } from "@/components/watch/watch-context"
import { MOCK_XCHANGE_DATA } from "@/lib/mock-xchange-data"
import { parseXchange } from "@/lib/xchange-parser"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function GridModule() {
  const { plays, setPlays, seekToPlay, currentPlay } = useWatchContext()

  // Parse data on mount
  useEffect(() => {
    if (plays.length === 0) {
      const parsed = parseXchange(MOCK_XCHANGE_DATA)
      setPlays(parsed)
    }
  }, [plays.length, setPlays])

  return (
    <div className="h-full w-full flex flex-col bg-background rounded-xl border border-border shadow-sm overflow-hidden pt-2 border-none">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between pt-2 pb-2">
        <h3 className="font-semibold text-sm text-foreground">Play Data</h3>
        <span className="text-xs text-muted-foreground">{plays.length} Events</span>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="w-[60px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                #
              </TableHead>
              <TableHead className="w-[60px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Qtr
              </TableHead>
              <TableHead className="w-[80px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Down
              </TableHead>
              <TableHead className="w-[80px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Dist
              </TableHead>
              <TableHead className="w-[80px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Yard
              </TableHead>
              <TableHead className="w-[80px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Gain
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Result
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plays.map((play) => {
              const isActive = currentPlay?.id === play.id
              return (
                <TableRow
                  key={play.id}
                  className={cn(
                    "cursor-pointer transition-colors border-b border-border/50",
                    isActive ? "bg-[#0273e3] hover:bg-[#0273e3] text-white" : "hover:bg-muted/50",
                  )}
                  onClick={() => seekToPlay(play)}
                >
                  <TableCell className="text-center font-medium py-2">{play.playNumber}</TableCell>
                  <TableCell className="text-center py-2">{play.quarter}</TableCell>
                  <TableCell className="text-center py-2">{play.down}</TableCell>
                  <TableCell className="text-center py-2">{play.distance}</TableCell>
                  <TableCell className="text-center py-2">{play.yardline}</TableCell>
                  <TableCell
                    className={cn(
                      "text-center font-semibold py-2",
                      !isActive && (play.gain > 0 ? "text-green-600" : play.gain < 0 ? "text-red-500" : ""),
                    )}
                  >
                    {play.gain}
                  </TableCell>
                  <TableCell className="text-xs py-2 opacity-70">{isActive ? "Viewing" : "—"}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
