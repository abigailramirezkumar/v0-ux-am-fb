"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/input"
import { Icon } from "@/components/icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useLibraryContext } from "@/lib/library-context"
import {
  MOCK_USERS,
  MOCK_GROUPS,
  CURRENT_ORG,
  type User,
  type Group,
  type PermissionLevel,
} from "@/lib/users-and-groups-data"
import { cn } from "@/lib/utils"
import type { FolderData } from "@/components/folder"

const CURRENT_USER = MOCK_USERS.find((u) => u.name === "Dan Campbell") || MOCK_USERS[0]

interface Permission {
  entityId: string
  type: "user" | "group" | "org"
  role: PermissionLevel
  inherited?: boolean
}

export function PermissionsModal() {
  const { isPermissionsModalOpen, closePermissionsModal, itemForPermissions, folders, selectedIds } =
    useLibraryContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [defaultRole, setDefaultRole] = useState<PermissionLevel>("viewer")
  const [localPermissions, setLocalPermissions] = useState<Permission[]>([
    { entityId: CURRENT_USER.id, type: "user", role: "owner" },
  ])
  const [isInheriting, setIsInheriting] = useState(true)

  // Find the item name for the title
  const findItemName = (nodes: FolderData[], targetId: string): string | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node.name
      if (node.items) {
        const item = node.items.find((i) => i.id === targetId)
        if (item) return item.name
      }
      if (node.children) {
        const found = findItemName(node.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  const selectedCount = selectedIds?.length ?? 0
  const itemName = itemForPermissions ? findItemName(folders, itemForPermissions) : null

  const getTitle = () => {
    if (selectedCount > 1) {
      // Check if all selected items are folders
      const areAllFolders = (selectedIds || []).every((id) => {
        const findFolder = (nodes: FolderData[]): boolean => {
          for (const node of nodes) {
            if (node.id === id) return true
            if (node.children && findFolder(node.children)) return true
          }
          return false
        }
        return findFolder(folders)
      })
      return `${selectedCount} ${areAllFolders ? "Folders" : "Items"}`
    }
    return itemName || "Item"
  }

  const filteredResults = useMemo(() => {
    if (!searchQuery) return []
    const lower = searchQuery.toLowerCase()
    const users = MOCK_USERS.filter(
      (u) => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower),
    ).filter((u) => !localPermissions.some((p) => p.entityId === u.id))
    const groups = MOCK_GROUPS.filter((g) => g.name.toLowerCase().includes(lower)).filter(
      (g) => !localPermissions.some((p) => p.entityId === g.id),
    )
    return [...groups, ...users]
  }, [searchQuery, localPermissions])

  const handleAddPermission = (entity: User | Group) => {
    setLocalPermissions((prev) => [
      ...prev,
      {
        entityId: entity.id,
        type: entity.type === "user" ? "user" : "group",
        role: defaultRole,
      },
    ])
    setSearchQuery("")
    setIsInheriting(false)
  }

  const handleUpdateRole = (entityId: string, newRole: PermissionLevel) => {
    if (newRole === null) {
      // Don't allow removing the owner
      if (entityId === CURRENT_USER.id) return
      setLocalPermissions((prev) => prev.filter((p) => p.entityId !== entityId))
    } else {
      setLocalPermissions((prev) => prev.map((p) => (p.entityId === entityId ? { ...p, role: newRole } : p)))
    }
    setIsInheriting(false)
  }

  const handleReset = () => {
    setLocalPermissions([{ entityId: CURRENT_USER.id, type: "user", role: "owner" }])
    setIsInheriting(true)
  }

  const handleClose = () => {
    closePermissionsModal()
    // Reset state for next open
    setSearchQuery("")
    setLocalPermissions([{ entityId: CURRENT_USER.id, type: "user", role: "owner" }])
    setIsInheriting(true)
    setDefaultRole("viewer")
  }

  const getEntityDetails = (id: string, type: "user" | "group" | "org") => {
    if (type === "org") return CURRENT_ORG
    if (type === "user") return MOCK_USERS.find((u) => u.id === id)
    return MOCK_GROUPS.find((g) => g.id === id)
  }

  const roleLabels: Record<string, string> = {
    viewer: "View",
    editor: "Edit",
    manager: "Manage",
    owner: "Owner",
  }

  const roleDropdownLabels: Record<string, string> = {
    viewer: "Can view",
    editor: "Can edit",
    manager: "Can manage",
  }

  return (
    <Dialog open={isPermissionsModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-normal text-foreground">
            Access to <span className="font-semibold">{getTitle()}</span>
          </DialogTitle>
        </div>

        {/* People With Access Section */}
        <div className="px-6 pt-5">
          <h3 className="text-base font-semibold text-foreground mb-3">People With Access</h3>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users  or groups"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {/* Search Dropdown Results */}
              {searchQuery && filteredResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto p-1 z-50">
                  {filteredResults.map((res) => (
                    <button
                      key={res.id}
                      className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-sm text-left"
                      onClick={() => handleAddPermission(res)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(res as User).avatar || "/placeholder.svg"} />
                        <AvatarFallback className={res.type === "group" ? "bg-muted" : ""}>
                          {res.type === "group" ? <Icon name="users" className="w-4 h-4" /> : res.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{res.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(res as User).email || (res as Group).description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && filteredResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md p-4 z-50">
                  <span className="text-sm text-muted-foreground">No results found</span>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 min-w-[100px] justify-between bg-transparent">
                  {roleLabels[defaultRole || "viewer"]}
                  <Icon name="chevron-down" className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDefaultRole("viewer")}>View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDefaultRole("editor")}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDefaultRole("manager")}>Manage</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-3">
            {localPermissions.map((perm) => {
              const entity = getEntityDetails(perm.entityId, perm.type)
              if (!entity) return null
              const isCurrentUser = perm.entityId === CURRENT_USER.id
              const isOwner = perm.role === "owner"

              return (
                <div key={perm.entityId} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={(entity as User).avatar || "/placeholder.svg"} />
                      <AvatarFallback className={cn(perm.type === "group" && "bg-muted")}>
                        {perm.type === "group" ? <Icon name="users" className="w-4 h-4" /> : entity.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {entity.name}
                        {isCurrentUser && <span className="font-normal text-muted-foreground"> (You)</span>}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {(entity as User).role || (entity as Group).description}
                      </span>
                    </div>
                  </div>

                  {isOwner ? (
                    <span className="text-sm text-muted-foreground pr-2">Owner</span>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9 gap-2 min-w-[90px] justify-between bg-transparent">
                          {perm.role === "mixed" ? "Mixed" : roleLabels[perm.role || "viewer"]}
                          <Icon name="chevron-down" className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateRole(perm.entityId, "viewer")}>
                          {roleDropdownLabels.viewer}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(perm.entityId, "editor")}>
                          {roleDropdownLabels.editor}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(perm.entityId, "manager")}>
                          {roleDropdownLabels.manager}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(perm.entityId, null)}
                          className="text-destructive focus:text-destructive"
                        >
                          Remove access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 pt-6 pb-4">
          <h3 className="text-base font-semibold text-foreground mb-3">General Access</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center">
                <Icon name="users" className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Hudl Hooligans </span>
                <span className="text-sm cursor-pointer text-muted-foreground">
                  Only people with explicit permissions can access
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 gap-2 min-w-[90px] justify-between bg-transparent">
                  View
                  <Icon name="chevron-down" className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Manage</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-primary hover:text-primary hover:bg-transparent px-0 gap-2"
          >
            <Icon name="refresh-cw" className="w-4 h-4" />
            Reset Permissions
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleClose}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
