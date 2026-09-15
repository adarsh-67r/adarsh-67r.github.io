"use client"

import dynamic from "next/dynamic"
import { useReducedMotion } from "motion/react"

import { useIsClient } from "@/hooks/use-is-client"
import { usePet } from "@/hooks/use-pet"

const ClawdFollowerCore = dynamic(
  () =>
    import("@/features/portfolio/components/clawd-follower/clawd-follower-core"),
  {
    ssr: false,
  }
)

export function ClawdFollower() {
  const isClient = useIsClient()
  const shouldReduceMotion = useReducedMotion()
  const { pet } = usePet()

  // touch allowed: core follows taps/finger drags (duck stays desktop-only)
  const shouldRender = isClient && !shouldReduceMotion && pet === "on"

  if (!shouldRender) return null

  return <ClawdFollowerCore />
}
