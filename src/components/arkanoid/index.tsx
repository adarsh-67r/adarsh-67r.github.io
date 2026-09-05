"use client"

import dynamic from "next/dynamic"

export const Arkanoid = dynamic(
  () => import("./component").then((mod) => mod.Arkanoid),
  {
    ssr: false,
    loading: () => <div className="h-150 w-200 ring-1 ring-border" />,
  }
)
