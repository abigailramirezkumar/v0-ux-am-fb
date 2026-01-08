"use client"

export function LibraryTableHeader() {
  return (
    <div className="sticky top-0 z-10 flex items-center py-2 bg-background border-b border-border pt-1 min-w-fit">
      {/* Name column - matches folder.tsx: flex-1 min-w-0 pl-4 + ml-4 for checkbox+icon area */}
      <div className="flex-1 min-w-[200px] pl-4 ml-4">
        <span className="text-sm font-bold text-muted-foreground">Name</span>
      </div>

      <div className="flex flex-shrink-0 text-left items-center ml-[-8px] pl-0">
        {/* Modified column - matches folder.tsx: w-24 flex-shrink-0 ml-3 */}
        <div className="w-24 flex-shrink-0 ml-3">
          <span className="text-sm font-bold text-muted-foreground">Modified</span>
        </div>

        {/* Type column - matches folder.tsx: w-16 flex-shrink-0 ml-3 */}
        <div className="w-16 flex-shrink-0 ml-3">
          <span className="text-sm font-bold text-muted-foreground">Type</span>
        </div>

        {/* Data column - matches folder.tsx: w-12 flex-shrink-0 ml-3 */}
        <div className="w-12 flex-shrink-0 ml-3 text-center">
          <span className="text-sm font-bold text-muted-foreground">Data</span>
        </div>

        {/* Items column - matches folder.tsx: w-14 flex-shrink-0 ml-3 */}
        <div className="w-14 flex-shrink-0 ml-3 text-left">
          <span className="text-sm font-bold text-muted-foreground">Items</span>
        </div>

        {/* Angles column - matches folder.tsx: w-14 flex-shrink-0 ml-3 */}
        <div className="w-14 flex-shrink-0 ml-3 text-left">
          <span className="text-sm font-bold text-muted-foreground">Angles</span>
        </div>

        {/* Duration column - matches folder.tsx: w-16 flex-shrink-0 ml-3 */}
        <div className="w-16 flex-shrink-0 ml-3">
          <span className="text-sm font-bold text-muted-foreground">Duration</span>
        </div>

        {/* Size column - matches folder.tsx: w-16 flex-shrink-0 ml-3 */}
        <div className="w-16 flex-shrink-0 ml-3">
          <span className="text-sm font-bold text-muted-foreground">Size</span>
        </div>

        <div className="w-20 flex-shrink-0 ml-3 text-left">
          <span className="text-sm font-bold text-muted-foreground">Comments</span>
        </div>

        {/* Created column - matches folder.tsx: w-24 flex-shrink-0 ml-3 */}
        <div className="w-24 flex-shrink-0 ml-3">
          <span className="text-sm font-bold text-muted-foreground">Created</span>
        </div>

        {/* Actions area spacer - matches folder.tsx: w-8 flex-shrink-0 ml-3 mr-4 */}
        <div className="w-8 flex-shrink-0 ml-3 mr-4" />
      </div>
    </div>
  )
}
