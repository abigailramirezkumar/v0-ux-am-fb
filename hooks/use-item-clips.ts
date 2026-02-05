import { useState, useCallback } from "react"
import { ClipData, CreatedLibraryItem, copyClipsWithNewIds, generateUniqueClipId } from "@/types/library"
import { getDatasetForItem, type PlayData } from "@/lib/mock-datasets"

/**
 * Convert a PlayData (mock-datasets) into a ClipData.
 * Preserves all fields and assigns a new unique clip id.
 */
function playToClip(play: PlayData, itemId: string): ClipData {
  return {
    ...play,
    id: `${itemId}-${play.id}`, // deterministic so cache is stable
  }
}

/**
 * Manages fetching, caching, and mutating clip data.
 *
 * - For CreatedLibraryItems (user playlists) clips live on the item itself.
 * - For standard/source items, clips are lazily generated from mock-datasets
 *   and cached in a local Map so repeated accesses are cheap.
 */
export function useItemClips(
  customItems: CreatedLibraryItem[],
  updateItemClips: (itemId: string, newClips: ClipData[]) => void,
) {
  const [cache, setCache] = useState<Map<string, ClipData[]>>(new Map())

  /**
   * Return the clips for a given item.
   *  1. If it is a custom (user-created) playlist, return its stored clips.
   *  2. If the clips are already cached, return the cached copy.
   *  3. Otherwise generate from mock-datasets, cache, and return.
   */
  const getClips = useCallback(
    (itemId: string): ClipData[] => {
      // 1. Custom item – clips stored inline
      const custom = customItems.find((i) => i.id === itemId)
      if (custom) return custom.clips

      // 2. Cache hit
      if (cache.has(itemId)) return cache.get(itemId)!

      // 3. Generate from mock data, cache, and return
      const dataset = getDatasetForItem(itemId)
      const generated: ClipData[] = dataset.plays.map((play) => playToClip(play, itemId))
      setCache((prev) => new Map(prev).set(itemId, generated))
      return generated
    },
    [customItems, cache],
  )

  /**
   * Add clips to a target item. The clips are deep-copied with new unique IDs
   * so they become independent of their source (the "Copy on Add" pattern).
   */
  const addClipsToItem = useCallback(
    (targetItemId: string, clips: ClipData[]) => {
      const copies = copyClipsWithNewIds(clips)

      // If the target is a custom playlist, update via the hook
      const custom = customItems.find((i) => i.id === targetItemId)
      if (custom) {
        updateItemClips(targetItemId, [...custom.clips, ...copies])
        return
      }

      // Otherwise update the local cache (for source items, this is unusual
      // but keeps the API consistent)
      setCache((prev) => {
        const existing = prev.get(targetItemId) ?? []
        return new Map(prev).set(targetItemId, [...existing, ...copies])
      })
    },
    [customItems, updateItemClips],
  )

  /**
   * Remove specific clips from an item by their ids.
   */
  const removeClipsFromItem = useCallback(
    (targetItemId: string, clipIdsToRemove: string[]) => {
      const removeSet = new Set(clipIdsToRemove)

      const custom = customItems.find((i) => i.id === targetItemId)
      if (custom) {
        updateItemClips(
          targetItemId,
          custom.clips.filter((c) => !removeSet.has(c.id)),
        )
        return
      }

      setCache((prev) => {
        const existing = prev.get(targetItemId)
        if (!existing) return prev
        return new Map(prev).set(
          targetItemId,
          existing.filter((c) => !removeSet.has(c.id)),
        )
      })
    },
    [customItems, updateItemClips],
  )

  /** Invalidate the cache for a standard (non-custom) item. */
  const invalidateCache = useCallback((itemId: string) => {
    setCache((prev) => {
      const next = new Map(prev)
      next.delete(itemId)
      return next
    })
  }, [])

  return { getClips, addClipsToItem, removeClipsFromItem, invalidateCache }
}
