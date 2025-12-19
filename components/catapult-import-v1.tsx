"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCatapultImport } from "@/hooks/use-catapult-import"
import { Folder } from "@/components/folder"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { users, userGroups, type PermissionLevel, type PermissionEntry } from "@/lib/users-and-groups-data"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import type { FolderData } from "@/components/folder"

interface CatapultImportV1Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete?: (folders: FolderData[]) => void // Removed items and importFolderName parameters
}

export function CatapultImportV1({ open, onOpenChange, onImportComplete }: CatapultImportV1Props) {
  const {
    externalData,
    selectedFolders,
    selectedItems,
    expandedFolders,
    importedFolders,
    importedItems,
    queue,
    isImporting,
    importSettings,
    updateSettings,
    toggleFolderSelection,
    toggleItemSelection,
    toggleFolderExpand,
    addToQueue,
    cancelQueueItem,
    cancelAllQueue,
    clearCompleted,
    updateImportedItem,
  } = useCatapultImport({ onImportComplete })

  const { toast } = useToast()

  const [autoSync, setAutoSync] = useState(false)
  const [syncDuration, setSyncDuration] = useState("24 hours")
  const [autoImportGamePlans, setAutoImportGamePlans] = useState(false)
  const [permissionEntries, setPermissionEntries] = useState<PermissionEntry[]>([])
  const [generalAccessPermission, setGeneralAccessPermission] = useState<PermissionLevel>("view")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const hasSelection = selectedFolders.size > 0 || selectedItems.size > 0

  const handleImport = () => {
    addToQueue()
  }

  const totalEstimatedTime = queue
    .filter((item) => item.status === "pending" || item.status === "importing")
    .reduce((sum, item) => sum + item.estimatedTime, 0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const handleAddPermission = (type: "user" | "group", entityId: string) => {
    if (permissionEntries.some((entry) => entry.type === type && entry.entityId === entityId)) {
      return
    }

    const newEntry: PermissionEntry = {
      id: `${type}-${entityId}-${Date.now()}`,
      type,
      entityId,
      permission: "view",
    }

    setPermissionEntries([...permissionEntries, newEntry])
    setSearchOpen(false)
    setSearchQuery("")
    toast({
      description: "Settings saved",
      duration: 3000,
    })
  }

  const handleRemovePermission = (entryId: string) => {
    setPermissionEntries(permissionEntries.filter((entry) => entry.id !== entryId))
    toast({
      description: "Settings saved",
      duration: 3000,
    })
  }

  const handleUpdatePermission = (entryId: string, permission: PermissionLevel) => {
    setPermissionEntries(permissionEntries.map((entry) => (entry.id === entryId ? { ...entry, permission } : entry)))
    toast({
      description: "Settings saved",
      duration: 3000,
    })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredGroups = userGroups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-96px)] sm:max-w-[calc(100vw-96px)] md:max-w-[calc(100vw-96px)] lg:max-w-[calc(100vw-96px)] max-h-[calc(100vh-96px)] h-[calc(100vh-96px)] w-[calc(100vw-96px)] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>Import Content from Catapult</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="import" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 bg-transparent border-b border-border h-auto p-0 rounded-none justify-start border-none gap-4">
            <TabsTrigger
              value="import"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-blue-500 data-[state=active]:text-foreground text-muted-foreground data-[state=active]:font-semibold px-2 pb-3"
            >
              Import Content
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-blue-500 data-[state=active]:text-foreground text-muted-foreground data-[state=active]:font-semibold px-2 pb-3"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="flex-1 flex flex-col overflow-hidden mt-0">
            <div className="flex-1 flex gap-4 p-6 overflow-hidden">
              <div className="flex-1 flex flex-col border border-border rounded-lg overflow-hidden bg-background">
                <div className="flex-1 overflow-y-auto">
                  {externalData.map((folder) => (
                    <Folder
                      key={folder.id}
                      folder={folder}
                      level={0}
                      onSelect={toggleFolderSelection}
                      onSelectItem={toggleItemSelection}
                      selectedFolders={selectedFolders}
                      selectedItems={selectedItems}
                      expandedFolders={expandedFolders}
                      onToggleExpand={toggleFolderExpand}
                      importedFolders={importedFolders}
                      importedItems={importedItems}
                      onUpdateImported={updateImportedItem}
                    />
                  ))}
                </div>

                <div className="border-t border-border p-4 bg-background">
                  <Button onClick={handleImport} disabled={!hasSelection} className="w-full">
                    Import Selected
                  </Button>
                </div>
              </div>

              <div className="w-96 flex flex-col border border-border rounded-lg overflow-hidden bg-background">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">Import Queue</h3>
                    {queue.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearCompleted}>
                        Clear Completed
                      </Button>
                    )}
                  </div>
                  {queue.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {queue.filter((item) => item.status === "pending" || item.status === "importing").length} items •{" "}
                      {formatTime(totalEstimatedTime)} remaining
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {queue.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Icon name="folder" size={48} className="mb-2 opacity-50" />
                      <p className="text-sm">No items in queue</p>
                      <p className="text-xs mt-1">Select content and click Import to begin</p>
                    </div>
                  ) : (
                    queue.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "p-3 rounded-lg border border-border bg-muted/50",
                          item.status === "importing" && "border-blue-500 bg-blue-500/10",
                          item.status === "complete" && "border-green-500 bg-green-500/10",
                          item.status === "cancelled" && "opacity-50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Icon
                                name={item.type === "folder" ? "folder" : "video"}
                                size={16}
                                className="flex-shrink-0"
                              />
                              <span className="text-sm font-medium truncate">{item.name}</span>
                            </div>
                            {item.type === "folder" && item.subItemCount !== undefined && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {item.subItemCount} {item.subItemCount === 1 ? "item" : "items"}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.status === "pending" && "Waiting..."}
                              {item.status === "importing" && `${formatTime(item.estimatedTime)} remaining`}
                              {item.status === "complete" && "Complete"}
                              {item.status === "cancelled" && "Cancelled"}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {item.status !== "complete" && item.status !== "cancelled" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => cancelQueueItem(item.id)}
                              >
                                <Icon name="close" size={14} />
                              </Button>
                            )}
                          </div>
                        </div>

                        {item.status !== "cancelled" && (
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-300",
                                item.status === "complete" ? "bg-green-500" : "bg-blue-500",
                              )}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}

                        {item.status !== "cancelled" && (
                          <div className="text-xs text-muted-foreground mt-1">{Math.round(item.progress)}%</div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {queue.length > 0 && queue.some((item) => item.status === "importing" || item.status === "pending") && (
                  <div className="border-t border-border p-4 bg-background">
                    <Button variant="destructive" onClick={cancelAllQueue} className="w-full">
                      Cancel All
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl space-y-8">
              <div className="space-y-3">
                <div className="flex gap-3 items-center">
                  <Checkbox
                    id="auto-sync"
                    checked={autoSync}
                    onCheckedChange={(checked) => {
                      setAutoSync(checked as boolean)
                      toast({
                        description: "Settings saved",
                        duration: 3000,
                      })
                    }}
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <Label htmlFor="auto-sync" className="cursor-pointer">
                      Automatically sync content every
                    </Label>
                    <Select
                      value={syncDuration}
                      onValueChange={(value) => {
                        setSyncDuration(value)
                        toast({
                          description: "Settings saved",
                          duration: 3000,
                        })
                      }}
                      disabled={!autoSync}
                    >
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 minute">1 minute</SelectItem>
                        <SelectItem value="5 minutes">5 minutes</SelectItem>
                        <SelectItem value="10 minutes">10 minutes</SelectItem>
                        <SelectItem value="15 minutes">15 minutes</SelectItem>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                        <SelectItem value="1 hour">1 hour</SelectItem>
                        <SelectItem value="2 hours">2 hours</SelectItem>
                        <SelectItem value="4 hours">4 hours</SelectItem>
                        <SelectItem value="12 hours">12 hours</SelectItem>
                        <SelectItem value="24 hours">24 hours</SelectItem>
                        <SelectItem value="36 hours">36 hours</SelectItem>
                        <SelectItem value="48 hours">48 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <Checkbox
                  id="auto-import-game-plans"
                  checked={autoImportGamePlans}
                  onCheckedChange={(checked) => {
                    setAutoImportGamePlans(checked as boolean)
                    toast({
                      description: "Settings saved",
                      duration: 3000,
                    })
                  }}
                />
                <Label htmlFor="auto-import-game-plans" className="cursor-pointer">
                  Import all new Game Plans automatically
                </Label>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Default permissions for all imported content</h3>

                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchOpen}
                      className="w-full justify-start text-muted-foreground font-normal h-12 bg-transparent"
                    >
                      <Icon name="search" size={20} className="mr-2" />
                      Search users or groups
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[600px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search users or groups..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No users or groups found.</CommandEmpty>

                        {filteredGroups.length > 0 && (
                          <CommandGroup heading="Groups">
                            {filteredGroups.map((group) => (
                              <CommandItem
                                key={group.id}
                                onSelect={() => handleAddPermission("group", group.id)}
                                className="flex items-center gap-3"
                              >
                                <Icon name="users" size={20} />
                                <span>{group.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}

                        {filteredUsers.length > 0 && (
                          <CommandGroup heading="Users">
                            {filteredUsers.map((user) => (
                              <CommandItem
                                key={user.id}
                                onSelect={() => handleAddPermission("user", user.id)}
                                className="flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{user.name}</div>
                                  <div className="text-xs text-muted-foreground">{user.role}</div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="space-y-3">
                  <h4 className="text-base font-semibold">People With Access</h4>

                  {permissionEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No users or groups added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {permissionEntries.map((entry) => {
                        const entity =
                          entry.type === "user"
                            ? users.find((u) => u.id === entry.entityId)
                            : userGroups.find((g) => g.id === entry.entityId)

                        if (!entity) return null

                        return (
                          <div key={entry.id} className="flex items-center gap-3 py-2">
                            {entry.type === "user" ? (
                              <>
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {(entity as (typeof users)[0]).name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{(entity as (typeof users)[0]).name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {(entity as (typeof users)[0]).role}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <Icon name="users" size={24} className="text-muted-foreground" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{(entity as (typeof userGroups)[0]).name}</div>
                                </div>
                              </>
                            )}

                            <Select
                              value={entry.permission}
                              onValueChange={(value) => handleUpdatePermission(entry.id, value as PermissionLevel)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="view">View</SelectItem>
                                <SelectItem value="comment">Comment</SelectItem>
                                <SelectItem value="edit">Edit</SelectItem>
                                <SelectItem value="manage">Manage</SelectItem>
                                <SelectItem value="restrict">Restrict</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePermission(entry.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Icon name="close" size={16} />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-base font-semibold">General Access</h4>

                  <div className="flex items-center gap-3 py-2">
                    <Icon name="users" size={32} className="text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">My Team</div>
                      <div className="text-xs text-muted-foreground">
                        Only people with explicit permissions can access
                      </div>
                    </div>

                    <Select
                      value={generalAccessPermission}
                      onValueChange={(value) => {
                        setGeneralAccessPermission(value as PermissionLevel)
                        toast({
                          description: "Settings saved",
                          duration: 3000,
                        })
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="comment">Comment</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                        <SelectItem value="manage">Manage</SelectItem>
                        <SelectItem value="restrict">Restrict</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
