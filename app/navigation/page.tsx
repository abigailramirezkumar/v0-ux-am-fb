"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/breadcrumb"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileTreeExample } from "@/components/file-tree"

export default function NavigationPage() {
  return (
    <div className="space-y-8 bg-sidebar min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Navigation</h1>
        <p className="text-muted-foreground">Navigation components including breadcrumbs, tabs, and file trees</p>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Breadcrumbs</CardTitle>
          <CardDescription>Navigation breadcrumbs for showing page hierarchy and location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Basic Breadcrumb</h3>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">With Ellipsis</h3>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Navigation Elements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Long Navigation Path</h3>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/projects/design-system">Design System</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/projects/design-system/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Navigation Elements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
          <CardDescription>Tab navigation for organizing content into sections</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1">Label</TabsTrigger>
              <TabsTrigger value="tab2">Label</TabsTrigger>
              <TabsTrigger value="tab3">Label</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <p className="text-muted-foreground">Content for tab 1</p>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <p className="text-muted-foreground">Content for tab 2</p>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <p className="text-muted-foreground">Content for tab 3</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>File Tree</CardTitle>
          <CardDescription>Hierarchical file and folder navigation with collapsible sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <FileTreeExample />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
