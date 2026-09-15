"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import { useReducedMotion } from "motion/react"

import { useIsClient } from "@/hooks/use-is-client"
import { usePet } from "@/hooks/use-pet"

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false
  return "ontouchstart" in window || navigator.maxTouchPoints > 0
}

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

  const isTouch = useMemo(() => {
    if (!isClient) return true
    return isTouchDevice()
  }, [isClient])

  const shouldRender =
    isClient && !shouldReduceMotion && !isTouch && pet === "on"

  if (!shouldRender) return null

  return <ClawdFollowerCore />
}
