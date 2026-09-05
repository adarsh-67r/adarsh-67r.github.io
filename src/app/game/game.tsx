"use client"

import { useSearchParams } from "next/navigation"

import { Arkanoid } from "@/components/arkanoid"

export function Game() {
  const searchParams = useSearchParams()
  const defaultLogo = searchParams.get("logo")

  return <Arkanoid defaultLogo={defaultLogo ?? undefined} />
}
