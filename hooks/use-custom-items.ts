import { useState, useCallback } from "react"
import { CreatedLibraryItem, ClipData } from "@/types/library"

export function useCustomItems() {
  const [items, setItems] = useState<CreatedLibraryItem[]>([])

  const createItem = useCallback((name: string, parentId: string | null, initialClips: ClipData[] = []) => {
    const newItem: CreatedLibraryItem = {
      id: `custom-${Date.now()}`,
      name,
      type: "playlist",
      parentId,
      clips: initialClips,
      metadata: {
        clipCount: initialClips.length,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      }
    }
    setItems(prev => [...prev, newItem])
    return newItem
  }, [])

  const updateItemClips = useCallback((itemId: string, newClips: ClipData[]) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      return {
        ...item,
        clips: newClips,
        metadata: {
          ...item.metadata,
          clipCount: newClips.length,
          modifiedDate: new Date().toISOString()
        }
      }
    }))
  }, [])

  const deleteItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }, [])

  return { customItems: items, createItem, updateItemClips, deleteItem }
}
