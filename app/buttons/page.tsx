"use client"

import { Button } from "@/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function ButtonsPage() {
  return (
    <div className="space-y-8 bg-sidebar min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Buttons</h1>
        <p className="text-muted-foreground">Button components in various sizes and variants</p>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Standard Buttons</CardTitle>
          <CardDescription>Basic button variants in different sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-muted-foreground">large</span>
            <Button variant="primary" size="large">
              Button
            </Button>
            <Button variant="secondary" size="large">
              Button
            </Button>
            <Button variant="subtle" size="large">
              Button
            </Button>
            <Button variant="destructive" size="large">
              Button
            </Button>
            <Button variant="success" size="large">
              Button
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-muted-foreground">medium</span>
            <Button variant="primary" size="medium">
              Button
            </Button>
            <Button variant="secondary" size="medium">
              Button
            </Button>
            <Button variant="subtle" size="medium">
              Button
            </Button>
            <Button variant="destructive" size="medium">
              Button
            </Button>
            <Button variant="success" size="medium">
              Button
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-muted-foreground">small</span>
            <Button variant="primary" size="small">
              Button
            </Button>
            <Button variant="secondary" size="small">
              Button
            </Button>
            <Button variant="subtle" size="small">
              Button
            </Button>
            <Button variant="destructive" size="small">
              Button
            </Button>
            <Button variant="success" size="small">
              Button
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-muted-foreground">xsmall</span>
            <Button variant="primary" size="xsmall">
              Button
            </Button>
            <Button variant="secondary" size="xsmall">
              Button
            </Button>
            <Button variant="subtle" size="xsmall">
              Button
            </Button>
            <Button variant="destructive" size="xsmall">
              Button
            </Button>
            <Button variant="success" size="xsmall">
              Button
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Icon Buttons</CardTitle>
          <CardDescription>Buttons with icons in various positions and configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-3">Icon Left</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">large</span>
                <Button variant="primary" size="large" iconVariant="left" icon="home">
                  Home
                </Button>
                <Button variant="secondary" size="large" iconVariant="left" icon="search">
                  Search
                </Button>
                <Button variant="subtle" size="large" iconVariant="left" icon="settings">
                  Settings
                </Button>
                <Button variant="destructive" size="large" iconVariant="left" icon="logout">
                  Logout
                </Button>
                <Button variant="success" size="large" iconVariant="left" icon="Upload">
                  Upload
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">medium</span>
                <Button variant="primary" size="medium" iconVariant="left" icon="home">
                  Home
                </Button>
                <Button variant="secondary" size="medium" iconVariant="left" icon="search">
                  Search
                </Button>
                <Button variant="subtle" size="medium" iconVariant="left" icon="settings">
                  Settings
                </Button>
                <Button variant="destructive" size="medium" iconVariant="left" icon="logout">
                  Logout
                </Button>
                <Button variant="success" size="medium" iconVariant="left" icon="Upload">
                  Upload
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">small</span>
                <Button variant="primary" size="small" iconVariant="left" icon="home">
                  Home
                </Button>
                <Button variant="secondary" size="small" iconVariant="left" icon="search">
                  Search
                </Button>
                <Button variant="subtle" size="small" iconVariant="left" icon="settings">
                  Settings
                </Button>
                <Button variant="destructive" size="small" iconVariant="left" icon="logout">
                  Logout
                </Button>
                <Button variant="success" size="small" iconVariant="left" icon="Upload">
                  Upload
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">xsmall</span>
                <Button variant="primary" size="xsmall" iconVariant="left" icon="home">
                  Home
                </Button>
                <Button variant="secondary" size="xsmall" iconVariant="left" icon="search">
                  Search
                </Button>
                <Button variant="subtle" size="xsmall" iconVariant="left" icon="settings">
                  Settings
                </Button>
                <Button variant="destructive" size="xsmall" iconVariant="left" icon="logout">
                  Logout
                </Button>
                <Button variant="success" size="xsmall" iconVariant="left" icon="Upload">
                  Upload
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-3">Icon Right</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">large</span>
                <Button variant="primary" size="large" iconVariant="right" icon="home">
                  Home
                </Button>
                <Button variant="secondary" size="large" iconVariant="right" icon="search">
                  Search
                </Button>
                <Button variant="subtle" size="large" iconVariant="right" icon="settings">
                  Settings
                </Button>
                <Button variant="destructive" size="large" iconVariant="right" icon="logout">
                  Logout
                </Button>
                <Button variant="success" size="large" iconVariant="right" icon="Upload">
                  Upload
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">medium</span>
                <Button variant="primary" size="medium" iconVariant="right" icon="home">
                  Home
                </Button>
                <Button variant="secondary" size="medium" iconVariant="right" icon="search">
                  Search
                </Button>
                <Button variant="subtle" size="medium" iconVariant="right" icon="settings">
                  Settings
                </Button>
                <Button variant="destructive" size="medium" iconVariant="right" icon="logout">
                  Logout
                </Button>
                <Button variant="success" size="medium" iconVariant="right" icon="Upload">
                  Upload
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">small</span>
                <Button variant="primary" size="small" iconVariant="right" icon="home">
                  Home
                </Button>
                <Button variant="secondary" size="small" iconVariant="right" icon="search">
                  Search
                </Button>
                <Button variant="subtle" size="small" iconVariant="right" icon="settings">
                  Settings
                </Button>
                <Button variant="destructive" size="small" iconVariant="right" icon="logout">
                  Logout
                </Button>
                <Button variant="success" size="small" iconVariant="right" icon="Upload">
                  Upload
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">xsmall</span>
                <Button variant="primary" size="xsmall" iconVariant="right" icon="home">
                  Home
                </Button>
                <Button variant="secondary" size="xsmall" iconVariant="right" icon="search">
                  Search
                </Button>
                <Button variant="subtle" size="xsmall" iconVariant="right" icon="settings">
                  Settings
                </Button>
                <Button variant="destructive" size="xsmall" iconVariant="right" icon="logout">
                  Logout
                </Button>
                <Button variant="success" size="xsmall" iconVariant="right" icon="Upload">
                  Upload
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-3">Icon Only</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">large</span>
                <Button variant="primary" size="large" iconVariant="iconOnly" icon="home" />
                <Button variant="secondary" size="large" iconVariant="iconOnly" icon="search" />
                <Button variant="subtle" size="large" iconVariant="iconOnly" icon="settings" />
                <Button variant="destructive" size="large" iconVariant="iconOnly" icon="logout" />
                <Button variant="success" size="large" iconVariant="iconOnly" icon="Upload" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">medium</span>
                <Button variant="primary" size="medium" iconVariant="iconOnly" icon="home" />
                <Button variant="secondary" size="medium" iconVariant="iconOnly" icon="search" />
                <Button variant="subtle" size="medium" iconVariant="iconOnly" icon="settings" />
                <Button variant="destructive" size="medium" iconVariant="iconOnly" icon="logout" />
                <Button variant="success" size="medium" iconVariant="iconOnly" icon="Upload" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">small</span>
                <Button variant="primary" size="small" iconVariant="iconOnly" icon="home" />
                <Button variant="secondary" size="small" iconVariant="iconOnly" icon="search" />
                <Button variant="subtle" size="small" iconVariant="iconOnly" icon="settings" />
                <Button variant="destructive" size="small" iconVariant="iconOnly" icon="logout" />
                <Button variant="success" size="small" iconVariant="iconOnly" icon="Upload" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">xsmall</span>
                <Button variant="primary" size="xsmall" iconVariant="iconOnly" icon="home" />
                <Button variant="secondary" size="xsmall" iconVariant="iconOnly" icon="search" />
                <Button variant="subtle" size="xsmall" iconVariant="iconOnly" icon="settings" />
                <Button variant="destructive" size="xsmall" iconVariant="iconOnly" icon="logout" />
                <Button variant="success" size="xsmall" iconVariant="iconOnly" icon="Upload" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
