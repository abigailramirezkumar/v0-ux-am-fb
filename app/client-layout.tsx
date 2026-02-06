"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { HudlSidebar } from "@/components/hudl-sidebar"
import { Header } from "@/components/header"
import { Analytics } from "@vercel/analytics/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { CatapultImportProvider } from "@/lib/catapult-import-context"
import { DensityProvider } from "@/lib/density-context"
import { LibraryProvider } from "@/lib/library-context"

import { WatchProvider } from "@/components/watch/watch-context"
import { CreatePlaylistModal } from "@/components/create-playlist-modal"

function ClientLayoutInner({ 
  isWatchPage, 
  searchValue, 
  setSearchValue, 
  router, 
  children 
}: { 
  isWatchPage: boolean
  searchValue: string
  setSearchValue: (value: string) => void
  router: ReturnType<typeof useRouter>
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full flex bg-sidebar">
      {!isWatchPage && <HudlSidebar />}

      <SidebarInset className="flex-1 flex flex-col bg-sidebar">
        <Header
          title={isWatchPage ? "Watch" : "Library"}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search components..."
          onShareClick={() => console.log("Share clicked")}
          onDownloadClick={() => console.log("Download clicked")}
          className="bg-sidebar border-b border-sidebar-border"
          showBack={isWatchPage}
          onBackClick={() => router.push("/library")}
        />

        <main className={`flex-1 overflow-hidden ${isWatchPage ? "pl-2" : ""}`}>
          <Suspense fallback={null}>{children}</Suspense>
        </main>
      </SidebarInset>
    </div>
  )
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const isWatchPage = pathname === "/watch"

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CatapultImportProvider>
        <DensityProvider>
          <LibraryProvider>
            <WatchProvider>
              <SidebarProvider defaultOpen={true}>
                <ClientLayoutInner isWatchPage={isWatchPage} searchValue={searchValue} setSearchValue={setSearchValue} router={router}>
                  {children}
                </ClientLayoutInner>
                <CreatePlaylistModal />
                <Analytics />
              </SidebarProvider>
            </WatchProvider>
          </LibraryProvider>
        </DensityProvider>
      </CatapultImportProvider>
    </ThemeProvider>
  )
}
