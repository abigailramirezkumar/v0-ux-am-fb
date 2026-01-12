"use client"

import { useWatchContext } from "@/components/watch/watch-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function GridModule() {
  const { plays, seekToPlay, currentPlay } = useWatchContext()

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
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                #
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                ODK
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Qtr
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Dn
              </TableHead>
              <TableHead className="w-[60px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Dist
              </TableHead>
              <TableHead className="w-[70px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Yard Ln
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Hash
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Yds
              </TableHead>
              <TableHead className="w-[80px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Result
              </TableHead>
              <TableHead className="w-[60px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Gn/Ls
              </TableHead>
              <TableHead className="w-[80px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Def Front
              </TableHead>
              <TableHead className="w-[70px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Def Str
              </TableHead>
              <TableHead className="w-[80px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Coverage
              </TableHead>
              <TableHead className="w-[50px] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Blitz
              </TableHead>
              <TableHead className="min-w-[120px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Game
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
                  <TableCell className="text-center font-medium py-1.5">{play.playNumber}</TableCell>
                  <TableCell className="text-center py-1.5">{play.odk}</TableCell>
                  <TableCell className="text-center py-1.5">{play.quarter}</TableCell>
                  <TableCell className="text-center py-1.5">{play.down}</TableCell>
                  <TableCell className="text-center py-1.5">{play.distance}</TableCell>
                  <TableCell className="text-center py-1.5">{play.yardLine}</TableCell>
                  <TableCell className="text-center py-1.5">{play.hash}</TableCell>
                  <TableCell className="text-center py-1.5">{play.yards}</TableCell>
                  <TableCell className="py-1.5">{play.result}</TableCell>
                  <TableCell
                    className={cn(
                      "text-center py-1.5",
                      play.gainLoss === "Gn" ? "text-green-600" : "text-red-500",
                      isActive && "text-white",
                    )}
                  >
                    {play.gainLoss}
                  </TableCell>
                  <TableCell className="py-1.5">{play.defFront}</TableCell>
                  <TableCell className="py-1.5">{play.defStr}</TableCell>
                  <TableCell className="py-1.5">{play.coverage}</TableCell>
                  <TableCell className="text-center py-1.5">{play.blitz}</TableCell>
                  <TableCell className="py-1.5 text-xs opacity-70">{play.game}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
