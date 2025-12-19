import { Icon } from "@/components/icon"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ResizablePanelGroup, ResizablePanel } from "@/components/resizable"

export default function IconsPage() {
  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={1000} className="p-6 ">
          <div className="h-full overflow-y-auto">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Icons</h1>
              <p className="text-muted-foreground">Comprehensive icon library organized into functional groups</p>
            </div>

            {/* Features and navigation */}
            <Card className="border-0 shadow-none my-2">
              <CardHeader>
                <CardTitle>Features and navigation</CardTitle>
                <CardDescription>Core application features, settings, and navigation elements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    "settings",
                    "star",
                    "starFilled",
                    "notificationsOff",
                    "notifications",
                    "notificationsFilled",
                    "drawing",
                    "exchangesLeague",
                    "exchangesDirect",
                    "upload",
                    "playbook",
                    "layout",
                    "video",
                    "record",
                    "menu",
                    "help",
                    "reports",
                    "messages",
                    "highlights",
                    "search",
                    "home",
                    "calendar",
                    "provideFeedback",
                    "clipboard",
                    "folder",
                    "folderFilled",
                    "flag",
                    "flagFilled",
                    "idea",
                    "org",
                    "locker",
                    "mediaLibrary",
                    "mediaGrid",
                    "mediaClips",
                    "mediaTimeline",
                    "explore",
                    "pass",
                    "clock",
                    "sun",
                    "moon",
                  ].map((iconName) => (
                    <div key={iconName} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Icon name={iconName} className="text-foreground" />
                      <span className="text-sm text-muted-foreground">{iconName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* UI Controls */}
            <Card className="border-0 shadow-none my-2">
              <CardHeader>
                <CardTitle>UI Controls</CardTitle>
                <CardDescription>Navigation arrows, buttons, and interactive control elements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    "chevronLeft",
                    "chevronRight",
                    "chevronUp",
                    "chevronDown",
                    "close",
                    "add",
                    "subtract",
                    "share",
                    "dropper",
                    "comment",
                    "sort",
                    "edit",
                    "filter",
                    "copy",
                    "pin",
                    "unpin",
                    "delete",
                    "show",
                    "hide",
                    "bolt",
                    "attach",
                    "link",
                    "unlink",
                    "compare",
                    "sendFilled",
                    "send",
                    "at",
                    "history",
                    "review",
                    "restricted",
                    "unrestricted",
                    "viewList",
                    "viewGrid",
                  ].map((iconName) => (
                    <div key={iconName} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Icon name={iconName} className="text-foreground" />
                      <span className="text-sm text-muted-foreground">{iconName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interactions */}
            <Card className="border-0 shadow-none my-2">
              <CardHeader>
                <CardTitle>Interactions</CardTitle>
                <CardDescription>User interaction tools, text formatting, and drawing elements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    "cursor",
                    "arrow",
                    "textAlignLeft",
                    "textAlignCenter",
                    "textAlignRight",
                    "format",
                    "boundingBox",
                    "image",
                    "clone",
                    "text",
                    "bold",
                    "connectedDisc",
                    "disc",
                    "movePlayer",
                    "disc",
                    "line",
                    "freehand",
                    "circle",
                    "square",
                    "polygon",
                    "circle3D",
                    "square3D",
                    "polygon3D",
                  ].map((iconName) => (
                    <div key={iconName} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Icon name={iconName} className="text-foreground" />
                      <span className="text-sm text-muted-foreground">{iconName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="border-0 shadow-none my-2">
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
                <CardDescription>Status indicators and user feedback elements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {["information", "confirmation", "warning", "critical"].map((iconName) => (
                    <div key={iconName} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Icon name={iconName} className="text-foreground" />
                      <span className="text-sm text-muted-foreground">{iconName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Media playback */}
            <Card className="border-0 shadow-none my-2">
              <CardHeader>
                <CardTitle>Media playback</CardTitle>
                <CardDescription>Audio and video playback controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    "play",
                    "pause",
                    "stop",
                    "rewind",
                    "fastForward",
                    "skipBack",
                    "skipForward",
                    "volume",
                    "volumeMute",
                    "replay",
                    "autoSkip",
                    "loop",
                    "normalPlay",
                    "slowForward",
                    "slowBackward",
                    "previous",
                    "next",
                    "playbackSpeed",
                  ].map((iconName) => (
                    <div key={iconName} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Icon name={iconName} className="text-foreground" />
                      <span className="text-sm text-muted-foreground">{iconName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technology */}
            <Card className="border-0 shadow-none my-2">
              <CardHeader>
                <CardTitle>Technology</CardTitle>
                <CardDescription>Device status, connectivity, and technical indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    "wifi",
                    "wifiDisconnected",
                    "wifiWarning",
                    "streaming",
                    "resolution4K",
                    "resolution1080",
                    "resolution720",
                    "batteryFull",
                    "battery75",
                    "battery50",
                    "battery25",
                    "batteryLow",
                    "batteryCharging",
                    "deviceLandscape",
                    "devicePortrait",
                    "tv",
                    "airplay",
                    "ethernet",
                    "sync",
                    "biometrics",
                    "textMessage",
                    "authenticator",
                  ].map((iconName) => (
                    <div key={iconName} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Icon name={iconName} className="text-foreground" />
                      <span className="text-sm text-muted-foreground">{iconName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Forms */}
            <Card className="border-0 shadow-none my-2">
              <CardHeader>
                <CardTitle>Forms</CardTitle>
                <CardDescription>Form input controls and selection elements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {["checkboxEmpty", "checkboxFilled", "radioEmpty", "radioFilled", "textInput"].map((iconName) => (
                    <div key={iconName} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Icon name={iconName} className="text-foreground" />
                      <span className="text-sm text-muted-foreground">{iconName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Video features */}
            <Card className="border-0 shadow-none my-2">
              <CardHeader>
                <CardTitle>Video features</CardTitle>
                <CardDescription>Video-specific functionality and editing tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {["clip", "keyboardShortcuts", "playlist", "playlistAdd", "tag", "videoCast", "pip", "pipExit"].map(
                    (iconName) => (
                      <div key={iconName} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Icon name={iconName} className="text-foreground" />
                        <span className="text-sm text-muted-foreground">{iconName}</span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Users */}
            <Card className="border-0 shadow-none my-2">
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>User management, profiles, and social interaction icons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {["user", "userCircle", "userAdd", "userBan", "userRemove", "userGroup"].map((iconName) => (
                    <div key={iconName} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Icon name={iconName} className="text-foreground" />
                      <span className="text-sm text-muted-foreground">{iconName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
