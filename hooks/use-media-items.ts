import { useState, useCallback } from "react"
import type { MediaItemData, ClipData } from "@/types/library"
import { copyClipsWithNewIds } from "@/types/library"

/**
 * Manages playlists/videos as a flat list.
 *
 * Items reference their parent folder via `parentId` (null = root).
 * This enables easy "move" operations and "empty" creation without
 * mutating the folder tree.
 */
export function useMediaItems() {
  const [mediaItems, setMediaItems] = useState<MediaItemData[]>([])

  /** Create a new media item (playlist or video). Returns the created item. */
  const createMediaItem = useCallback(
    (name: string, parentId: string | null, initialClips: ClipData[] = []): MediaItemData => {
      const now = new Date().toISOString()
      const newItem: MediaItemData = {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        type: "playlist",
        parentId,
        clips: copyClipsWithNewIds(initialClips),
        createdAt: now,
        modifiedAt: now,
      }
      setMediaItems((prev) => [...prev, newItem])
      return newItem
    },
    [],
  )

  /** Replace the full clip array on a specific item. */
  const updateMediaItemClips = useCallback((id: string, newClips: ClipData[]) => {
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, clips: newClips, modifiedAt: new Date().toISOString() } : item,
      ),
    )
  }, [])

  /** Append clips (with copy-on-add: new unique IDs) to an existing item. */
  const addClipsToMediaItem = useCallback(
    (id: string, clips: ClipData[]) => {
      const copied = copyClipsWithNewIds(clips)
      setMediaItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, clips: [...item.clips, ...copied], modifiedAt: new Date().toISOString() }
            : item,
        ),
      )
    },
    [],
  )

  /** Remove clips by id from an item. */
  const removeClipsFromMediaItem = useCallback((itemId: string, clipIds: string[]) => {
    const idSet = new Set(clipIds)
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, clips: item.clips.filter((c) => !idSet.has(c.id)), modifiedAt: new Date().toISOString() }
          : item,
      ),
    )
  }, [])

  /** Move a media item to a different folder. */
  const moveMediaItem = useCallback((itemId: string, newParentId: string | null) => {
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, parentId: newParentId, modifiedAt: new Date().toISOString() } : item,
      ),
    )
  }, [])

  /** Delete a media item entirely. */
  const deleteMediaItem = useCallback((itemId: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  /** Get all media items belonging to a specific folder (or root when null). */
  const getMediaItemsByFolderId = useCallback(
    (folderId: string | null): MediaItemData[] => {
      return mediaItems.filter((item) => item.parentId === folderId)
    },
    [mediaItems],
  )

  /** Find a single media item by id. */
  const getMediaItem = useCallback(
    (id: string): MediaItemData | undefined => {
      return mediaItems.find((item) => item.id === id)
    },
    [mediaItems],
  )

  return {
    mediaItems,
    createMediaItem,
    updateMediaItemClips,
    addClipsToMediaItem,
    removeClipsFromMediaItem,
    moveMediaItem,
    deleteMediaItem,
    getMediaItemsByFolderId,
    getMediaItem,
  }
}
