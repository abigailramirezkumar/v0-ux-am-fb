import { Suspense } from "react"
import { notFound } from "next/navigation"
import { AthleteProfileWrapper } from "@/components/profile/athlete-profile-wrapper"
import { athletes, nameToSlug } from "@/lib/athletes-data"

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ athleteId: string }>
}

export default async function Page({ params }: PageProps) {
  const { athleteId } = await params
  
  // Find athlete by slug
  const athlete = athletes.find((a) => nameToSlug(a.name) === athleteId.toLowerCase())

  if (!athlete) {
    notFound()
  }

  return (
    <Suspense fallback={<div className="h-full bg-background" />}>
      <AthleteProfileWrapper athlete={athlete} />
    </Suspense>
  )
}

// ---------------------------------------------------------------------------
// Generate static params for all athletes (optional optimization)
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return athletes.map((athlete) => ({
    athleteId: nameToSlug(athlete.name),
  }))
}
