import type { FolderData } from "@/components/folder"
import type { LibraryItemData } from "@/components/library-item"

export interface SearchResult {
  id: string
  type: "folder" | "item"
  name: string
  path: string
  itemData?: LibraryItemData
  folderData?: FolderData
}

export function searchLibrary(folders: FolderData[], query: string): SearchResult[] {
  const results: SearchResult[] = []
  const lowerQuery = query.toLowerCase()

  function traverse(nodes: FolderData[], currentPath: string[]) {
    for (const node of nodes) {
      // Check Folder
      if (node.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: node.id,
          type: "folder",
          name: node.name,
          path: currentPath.join(" > "),
          folderData: node
        })
      }

      // Check Items
      if (node.items) {
        for (const item of node.items) {
          if (item.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              id: item.id,
              type: "item",
              name: item.name,
              path: [...currentPath, node.name].join(" > "),
              itemData: item
            })
          }
        }
      }

      // Recurse
      if (node.children) {
        traverse(node.children, [...currentPath, node.name])
      }
    }
  }

  traverse(folders, [])
  return results
}
