import type React from "react"
import { CatapultImportProvider } from "@/lib/catapult-import-context"

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <CatapultImportProvider>{children}</CatapultImportProvider>
}
