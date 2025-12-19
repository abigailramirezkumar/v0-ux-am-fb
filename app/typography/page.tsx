import { Typography } from "@/components/ui/typography"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function TypographyPage() {
  return (
    <div className="space-y-8 bg-sidebar min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Typography</h1>
        <p className="text-muted-foreground">Typography system with display, lead, title, and text variants</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Display Styles</CardTitle>
              <CardDescription>Large display text for headlines and hero sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Typography variant="display-large" className="text-foreground">
                  Display Large
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Bold Italic / 60px / 100% line height</p>
              </div>

              <div>
                <Typography variant="display-medium" className="text-foreground">
                  Display Medium
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Bold Italic / 48px / 100% line height</p>
              </div>

              <div>
                <Typography variant="display-small" className="text-foreground">
                  Display Small
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Bold Italic / 30px / 100% line height</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Lead Styles</CardTitle>
              <CardDescription>Prominent text for introductions and important content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Typography variant="lead-large" className="text-foreground">
                  Lead Large
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Medium / 24px / 140% line height</p>
              </div>

              <div>
                <Typography variant="lead-medium" className="text-foreground">
                  Lead Medium
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Medium / 20px / 140% line height</p>
              </div>

              <div>
                <Typography variant="lead-small" className="text-foreground">
                  Lead Small
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Medium / 18px / 140% line height</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Title Styles</CardTitle>
              <CardDescription>Heading text for sections and content organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Typography variant="title-xxlarge" className="text-foreground">
                  Title XXLarge
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Bold / 36px / 120% line height</p>
              </div>

              <div>
                <Typography variant="title-xlarge" className="text-foreground">
                  Title XLarge
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Bold / 30px / 120% line height</p>
              </div>

              <div>
                <Typography variant="title-large" className="text-foreground">
                  TITLE LARGE
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Bold / 24px / 120% line height</p>
              </div>

              <div>
                <Typography variant="title-medium" className="text-foreground">
                  Title Medium
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Bold / 20px / 120% line height</p>
              </div>

              <div>
                <Typography variant="title-small" className="text-foreground">
                  Title Small
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Bold / 18px / 120% line height</p>
              </div>

              <div>
                <Typography variant="title-xsmall" className="text-foreground">
                  Title XSmall
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Bold / 16px / 120% line height</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Text Styles</CardTitle>
              <CardDescription>Body text for content and interface elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Typography variant="text-large" className="text-foreground">
                  Text Large
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Medium / 18px / 140% line height</p>
              </div>

              <div>
                <Typography variant="text-default" className="text-foreground">
                  Text Default
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Medium / 16px / 140% line height</p>
              </div>

              <div>
                <Typography variant="text-small" className="text-foreground">
                  Text Small
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Medium / 14px / 140% line height</p>
              </div>

              <div>
                <Typography variant="text-micro" className="text-foreground">
                  Text Micro
                </Typography>
                <p className="text-xs text-muted-foreground -mt-2">Barlow Medium / 12px / 140% line height</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
