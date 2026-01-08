"use client"

import { useLibraryContext } from "@/lib/library-context"

export function GridModule() {
  const { activeWatchItemId } = useLibraryContext()

  return (
    <div className="h-full w-full bg-background/50 border-t border-border flex flex-col items-center justify-center text-muted-foreground p-4">
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-semibold text-lg text-foreground">Grid Module</h3>
        <p className="text-sm">
          {activeWatchItemId ? `Viewing Data for ID: ${activeWatchItemId}` : "No item selected"}
        </p>
      </div>
    </div>
  )
}
