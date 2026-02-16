"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { HudlSidebar } from "@/components/hudl-sidebar"
import { Header } from "@/components/header"
import { Analytics } from "@vercel/analytics/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { CatapultImportProvider } from "@/lib/catapult-import-context"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [searchValue, setSearchValue] = useState("")

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CatapultImportProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="h-screen w-full flex bg-background">
            <HudlSidebar />

            <SidebarInset className="flex-1 flex flex-col">
              <Header
                title="Component Library"
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder="Search components..."
                onFilterClick={() => console.log("Filter clicked")}
                onShareClick={() => console.log("Share clicked")}
                onDownloadClick={() => console.log("Download clicked")}
              />

              <main className="flex-1 overflow-auto">
                <Suspense fallback={null}>{children}</Suspense>
              </main>
            </SidebarInset>
          </div>
          <Analytics />
        </SidebarProvider>
      </CatapultImportProvider>
    </ThemeProvider>
  )
}
