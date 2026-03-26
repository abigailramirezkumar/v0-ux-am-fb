import { Suspense } from "react"
import { ExploreV1 } from "@/components/explore/explore-v1"

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-sidebar" />}>
      <ExploreV1 />
    </Suspense>
  )
}
