import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const componentCategories = [
  {
    title: "Buttons",
    description: "Button components in various sizes and variants",
    href: "/buttons",
    icon: "🔘",
  },
  {
    title: "Forms",
    description: "Form input components including text inputs, selects, radio buttons, and more",
    href: "/forms",
    icon: "📝",
  },
  {
    title: "Icons",
    description: "Comprehensive icon library with various categories",
    href: "/icons",
    icon: "⭐",
  },
  {
    title: "Layout Components",
    description: "Headers, sidebars, avatars, cards, dialogs, and resizable panels",
    href: "/layout-components",
    icon: "📐",
  },
  {
    title: "Navigation",
    description: "Navigation components including breadcrumbs and tabs",
    href: "/navigation",
    icon: "🧭",
  },
  {
    title: "Typography",
    description: "Typography system with display, lead, title, and text variants",
    href: "/typography",
    icon: "📄",
  },
]

export default function ComponentLibraryPage() {
  return (
    <div className="p-8 bg-sidebar min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Component Library</h1>
          <p className="text-lg text-muted-foreground">
            Explore our comprehensive collection of UI components and design system elements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {componentCategories.map((category) => (
            <Link key={category.href} href={category.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            Each component category contains examples, usage guidelines, and implementation details. Click on any
            category above to explore the available components.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/buttons">Start with Buttons</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/forms">Explore Forms</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
