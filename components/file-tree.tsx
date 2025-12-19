"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

export interface FileTreeItem {
  id: string
  name: string
  type: "file" | "folder"
  date?: string
  children?: FileTreeItem[]
  disabled?: boolean
}

interface FileTreeNodeProps {
  item: FileTreeItem
  level?: number
  onItemClick?: (item: FileTreeItem) => void
}

interface FileTreeProps {
  data: FileTreeItem[]
  onItemClick?: (item: FileTreeItem) => void
  className?: string
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ item, level = 0, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(item.type === "folder" ? false : undefined)
  const hasChildren = item.children && item.children.length > 0

  const handleToggle = () => {
    if (item.type === "folder" && hasChildren) {
      setIsOpen(!isOpen)
    }
  }

  const handleItemClick = () => {
    if (item.type === "file") {
      onItemClick?.(item)
    }
  }

  const indentStyle = {
    paddingLeft: `${level * 16 + 12}px`,
  }

  if (item.type === "folder" && hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              "flex items-center justify-between py-1 px-3 hover:bg-muted/50 cursor-pointer text-sm",
              "text-foreground",
            )}
            style={indentStyle}
            onClick={handleToggle}
          >
            <div className="flex items-center gap-2">
              <Icon name={isOpen ? "chevronDown" : "chevronRight"} size={12} className="text-muted-foreground" />
              <span className="font-medium">{item.name}</span>
            </div>
            {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {item.children?.map((child) => (
            <FileTreeNode key={child.id} item={child} level={level + 1} onItemClick={onItemClick} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  // Render file or folder without children
  return (
    <div
      className={cn(
        "flex items-center justify-between py-1 px-3 text-sm cursor-pointer",
        "hover:bg-muted/50",
        item.disabled ? "text-muted-foreground" : "text-foreground",
        item.type === "folder" && "font-medium",
      )}
      style={indentStyle}
      onClick={handleItemClick}
    >
      <div className="flex items-center gap-2">
        {item.type === "folder" && <Icon name="chevronRight" size={12} className="text-muted-foreground" />}
        <span>{item.name}</span>
      </div>
      {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
    </div>
  )
}

export const FileTree: React.FC<FileTreeProps> = ({ data, onItemClick, className }) => {
  return (
    <div className={cn("w-full", className)}>
      {data.map((item) => (
        <FileTreeNode key={item.id} item={item} level={0} onItemClick={onItemClick} />
      ))}
    </div>
  )
}

// Example usage component
export const FileTreeExample: React.FC = () => {
  const sampleData: FileTreeItem[] = [
    {
      id: "event",
      name: "EVENT",
      type: "folder",
      children: [
        {
          id: "2025-2026",
          name: "2025-2026",
          type: "folder",
          children: [
            {
              id: "lex-test",
              name: "Lex test",
              type: "file",
              date: "Jun 6",
            },
            {
              id: "kansas-city-ravens",
              name: "Kansas City Ravens",
              type: "file",
              date: "Jun 7",
              disabled: true,
            },
            {
              id: "zoinks-squad-1",
              name: "Zoinks Squad",
              type: "file",
              date: "Jul 31",
            },
            {
              id: "zoinks-squad-2",
              name: "Zoinks Squad",
              type: "file",
              date: "Aug 4",
            },
            {
              id: "hudl",
              name: "Hudl",
              type: "file",
              date: "Aug 4",
            },
          ],
        },
        {
          id: "2024-2025",
          name: "2024-2025",
          type: "folder",
          children: [],
        },
        {
          id: "2023-2024",
          name: "2023-2024",
          type: "folder",
          children: [],
        },
        {
          id: "2022-2023",
          name: "2022-2023",
          type: "folder",
          children: [],
        },
      ],
    },
  ]

  const handleItemClick = (item: FileTreeItem) => {
    console.log("Clicked item:", item)
  }

  return (
    <div className="w-full max-w-md bg-background border border-border rounded-lg p-2">
      <div className="flex items-center justify-between mb-2 px-3 py-1">
        <span className="text-sm font-medium text-foreground">Files</span>
        <Icon name="sort" size={16} className="text-muted-foreground" />
      </div>
      <FileTree data={sampleData} onItemClick={handleItemClick} />
    </div>
  )
}
