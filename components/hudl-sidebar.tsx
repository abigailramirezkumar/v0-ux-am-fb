"use client"

import type * as React from "react"
import { ChevronRight, User, Settings, LogOut } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Icon } from "@/components/icon"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useCatapultImportContext } from "@/lib/catapult-import-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HudlSidebarProps {
  children?: React.ReactNode
}

export function HudlSidebar({ children }: HudlSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { activeVersion, setActiveVersion } = useCatapultImportContext()
  const { state } = useSidebar()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    if (!mounted) return

    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  const bottomNavItems = [
    { name: "Calendar", icon: "calendar", badge: null },
    { name: "Messages", icon: "messages", badge: null },
    { name: "Notifications", icon: "notifications", badge: "24" },
    { name: "Settings", icon: "settings", badge: null },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-0 border-sidebar">
      <SidebarHeader>
        {/* Hudl Header */}
        <div className="flex items-center justify-between mb-4">
          {state === "collapsed" ? (
            <Logo type="logomark" className="w-5 h-5" />
          ) : (
            <Logo type="logotype" className="h-8" />
          )}
        </div>

        {/* Team Section */}
        <div className="mb-4">
          <SidebarMenuButton className="w-full justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#19356f] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">SUN</span>
              </div>
              <span>Team name</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </SidebarMenuButton>
        </div>

        <SidebarSeparator />
      </SidebarHeader>

      <SidebarContent className="px-4">
        {/* Main Navigation */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/library"}>
              <Link href="/library">
                <div className="flex items-center gap-3">
                  <Icon name="folder" className="w-5 h-5 flex-shrink-0" />
                  <span>Library</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {/* Bottom Navigation */}
        <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton className="justify-between">
                <div className="flex items-center gap-3">
                  <Icon name={item.icon as any} className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <div className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded min-w-[20px] text-center">
                      {item.badge}
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleThemeToggle}
              className="justify-start opacity-60 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <Icon name={mounted && resolvedTheme === "dark" ? "sun" : "moon"} className="w-5 h-5 flex-shrink-0" />
                <span>{mounted && resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Catapult Import version selector as nav item */}
          <SidebarMenuItem>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="settings" className="w-5 h-5 flex-shrink-0" />
                    <span>Catapult Import</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Select Version</div>
                <DropdownMenuItem
                  onClick={() => setActiveVersion("v1")}
                  className={activeVersion === "v1" ? "bg-accent" : ""}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeVersion === "v1" ? "bg-blue-600" : "bg-muted"}`} />
                    Version 1
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveVersion("v2")}
                  className={activeVersion === "v2" ? "bg-accent" : ""}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeVersion === "v2" ? "bg-blue-600" : "bg-muted"}`} />
                    Version 2
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveVersion("v3")}
                  className={activeVersion === "v3" ? "bg-accent" : ""}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeVersion === "v3" ? "bg-blue-600" : "bg-muted"}`} />
                    Version 3
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#ff6300] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AD</span>
                    </div>
                    <span>User Name</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/components" className="flex items-center gap-2">
                    <Icon name="grid" className="w-4 h-4" />
                    Component Library
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
