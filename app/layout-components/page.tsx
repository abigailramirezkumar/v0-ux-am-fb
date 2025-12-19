"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar"
import { HudlSidebar } from "@/components/hudl-sidebar"
import { Header } from "@/components/header"
import { Logo } from "@/components/logo"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/card"
import { Button } from "@/components/button"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/resizable"
import { ResponsiveDialog, DialogTrigger } from "@/components/dialog"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function LayoutPage() {
  const [searchValue, setSearchValue] = useState("")
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <div className="space-y-8 bg-sidebar min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Layout Components</h1>
        <p className="text-muted-foreground">Layout components including headers, sidebars, avatars, and logos</p>
      </div>

      {/* Logo Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Logo</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Logomark</h3>
            <div className="flex items-center gap-4 p-6 border border-border rounded-lg bg-card">
              <Logo type="logomark" />
              <span className="text-sm text-muted-foreground">Icon only version</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Logotype</h3>
            <div className="flex items-center gap-4 p-6 border border-border rounded-lg bg-card">
              <Logo type="logotype" />
              <span className="text-sm text-muted-foreground">Icon with text version</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dialog Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Dialog</h2>
        <div className="space-y-4">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-medium text-card-foreground mb-4">Responsive Modal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              A responsive dialog that appears as a centered modal on desktop and a bottom sheet on mobile.
            </p>
            <ResponsiveDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title="Modal title"
              description="This is the text that goes into the modal."
              onConfirm={() => {
                console.log("Confirmed")
                setDialogOpen(false)
              }}
              onCancel={() => {
                console.log("Cancelled")
                setDialogOpen(false)
              }}
              confirmText="Yes, Continue"
              cancelText="Cancel"
            >
              <DialogTrigger asChild>
                <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
              </DialogTrigger>
            </ResponsiveDialog>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>• Desktop/tablet: Centered modal with rounded corners</p>
              <p>• Mobile: Bottom sheet attached to screen bottom</p>
              <p>• Responsive button layout and styling</p>
              <p>• Matches the provided design specifications exactly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Header Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Header</h2>
        <div className="border border-border rounded-lg overflow-hidden shadow-sm">
          <Header
            title="Content Title"
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onMenuClick={toggleSidebar}
            onFilterClick={() => console.log("Filter clicked")}
            onShareClick={() => console.log("Share clicked")}
            onDownloadClick={() => console.log("Download clicked")}
          />
          <div className="p-6 bg-card">
            <h3 className="text-lg font-medium text-card-foreground mb-2">Header Component</h3>
            <p className="text-muted-foreground text-sm">
              A complete header component with navigation, search, and action buttons that matches the design system.
            </p>
          </div>
        </div>
      </section>

      {/* Hudl Sidebar Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Hudl Sidebar</h2>
        <div
          className="border border-border rounded-lg shadow-sm overflow-hidden bg-card"
          style={{ height: "600px", width: "100%", maxWidth: "1200px" }}
        >
          <SidebarProvider defaultOpen={sidebarVisible}>
            <div className="flex h-full">
              <HudlSidebar />
              <SidebarInset className="flex-1 flex flex-col bg-card">
                <Header
                  title="Content Title"
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  onFilterClick={() => console.log("Filter clicked")}
                  onShareClick={() => console.log("Share clicked")}
                  onDownloadClick={() => console.log("Download clicked")}
                />
                <div className="flex-1 p-8">
                  <h3 className="text-lg font-medium text-card-foreground mb-4">Main Content Area</h3>
                  <p className="text-muted-foreground mb-4">
                    This is where the main application content would be displayed alongside the Hudl sidebar navigation.
                  </p>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>• The sidebar uses shadcn/ui components for consistency</p>
                    <p>• Includes theme toggle functionality in user menu</p>
                    <p>• Responsive design maintains usability</p>
                    <p>• Click the sidebar trigger to toggle visibility</p>
                  </div>
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </div>
      </section>

      {/* Avatars Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Avatars</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Profile Images</h3>
            <div className="flex items-center gap-4">
              <Avatar size="xl">
                <AvatarImage src="/professional-headshot.png" alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage src="/professional-headshot.png" alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar size="md">
                <AvatarImage src="/professional-headshot.png" alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar size="sm">
                <AvatarImage src="/professional-headshot.png" alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar size="xs">
                <AvatarImage src="/professional-headshot.png" alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Initials</h3>
            <div className="flex items-center gap-4">
              <Avatar size="xl">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <Avatar size="md">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <Avatar size="sm">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <Avatar size="xs">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Card */}
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Basic Card</CardTitle>
              <CardDescription>A simple card with header and content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the main content area of the card. You can put any content here.
              </p>
            </CardContent>
          </Card>

          {/* Card with Footer */}
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Card with Footer</CardTitle>
              <CardDescription>Card that includes footer actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card demonstrates how to use the footer section for actions or additional information.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="small" variant="primary">
                Action
              </Button>
              <Button size="small" variant="secondary">
                Cancel
              </Button>
            </CardFooter>
          </Card>

          {/* Content Only Card */}
          <Card className="border-0 shadow-none">
            <CardContent>
              <h3 className="font-semibold text-card-foreground mb-2">Content Only</h3>
              <p className="text-sm text-muted-foreground">
                Sometimes you just need a simple card with content, no header or footer required.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resizable Panels Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Resizable Panels</h2>
        <div className="space-y-6">
          {/* Horizontal Resizable */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Horizontal Layout</h3>
            <div className="border border-border rounded-lg overflow-hidden" style={{ height: "400px" }}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={30} minSize={20}>
                  <div className="flex h-full items-center justify-center p-6 bg-muted/30">
                    <div className="text-center">
                      <h4 className="font-medium text-foreground mb-2">Left Panel</h4>
                      <p className="text-sm text-muted-foreground">Resizable panel content</p>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={70}>
                  <div className="flex h-full items-center justify-center p-6 bg-card">
                    <div className="text-center">
                      <h4 className="font-medium text-card-foreground mb-2">Right Panel</h4>
                      <p className="text-sm text-muted-foreground">Main content area that can be resized</p>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>

          {/* Vertical Resizable */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Vertical Layout</h3>
            <div className="border border-border rounded-lg overflow-hidden" style={{ height: "400px" }}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={40} minSize={25}>
                  <div className="flex h-full items-center justify-center p-6 bg-muted/30">
                    <div className="text-center">
                      <h4 className="font-medium text-foreground mb-2">Top Panel</h4>
                      <p className="text-sm text-muted-foreground">Header or toolbar area</p>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={60}>
                  <div className="flex h-full items-center justify-center p-6 bg-card">
                    <div className="text-center">
                      <h4 className="font-medium text-card-foreground mb-2">Bottom Panel</h4>
                      <p className="text-sm text-muted-foreground">Main content or details area</p>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>

          {/* Three Panel Layout */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Three Panel Layout</h3>
            <div className="border border-border rounded-lg overflow-hidden" style={{ height: "400px" }}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={25} minSize={15}>
                  <div className="flex h-full items-center justify-center p-6 bg-muted/30">
                    <div className="text-center">
                      <h4 className="font-medium text-foreground mb-2">Sidebar</h4>
                      <p className="text-sm text-muted-foreground">Navigation</p>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center p-6 bg-card">
                    <div className="text-center">
                      <h4 className="font-medium text-card-foreground mb-2">Main Content</h4>
                      <p className="text-sm text-muted-foreground">Primary workspace</p>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={25} minSize={15}>
                  <div className="flex h-full items-center justify-center p-6 bg-muted/30">
                    <div className="text-center">
                      <h4 className="font-medium text-foreground mb-2">Details</h4>
                      <p className="text-sm text-muted-foreground">Properties</p>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>

          {/* Nested Layout (Two Left + One Right) */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Nested Layout (Two Left + One Right)</h3>
            <div className="border border-border rounded-lg overflow-hidden" style={{ height: "400px" }}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={60} minSize={40}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="flex h-full items-center justify-center p-6 bg-muted/30">
                        <div className="text-center">
                          <h4 className="font-medium text-foreground mb-2">Top Left Panel</h4>
                          <p className="text-sm text-muted-foreground">First vertical panel</p>
                        </div>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50}>
                      <div className="flex h-full items-center justify-center p-6 bg-card">
                        <div className="text-center">
                          <h4 className="font-medium text-card-foreground mb-2">Bottom Left Panel</h4>
                          <p className="text-sm text-muted-foreground">Second vertical panel</p>
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={40} minSize={25}>
                  <div className="flex h-full items-center justify-center p-6 bg-muted/30">
                    <div className="text-center">
                      <h4 className="font-medium text-foreground mb-2">Right Panel</h4>
                      <p className="text-sm text-muted-foreground">Full height panel</p>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
