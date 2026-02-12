"use client"

export interface SubsectionHeaderProps {
  /** The label displayed as an uppercase divider. */
  label: string
}

/**
 * A small uppercase heading used to visually separate groups of
 * filters within an accordion section (e.g. "Play Development",
 * "Receiving", "Rush Defense").
 */
export function SubsectionHeader({ label }: SubsectionHeaderProps) {
  return (
    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pt-2 pb-1">
      {label}
    </div>
  )
}
