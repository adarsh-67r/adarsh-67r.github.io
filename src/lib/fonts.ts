import { Caveat } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import { GeistSerif } from "geist/font/serif"

import { cn } from "@/lib/utils"

const fontSans = GeistSans
const fontMono = GeistMono

const fontSerif = GeistSerif

const fontHandwritten = Caveat({
  weight: "400",
  display: "swap",
  variable: "--font-handwritten",
})

import localFont from "next/font/local"

export const fontPixel = localFont({
  src: "../assets/fonts/DepartureMono-Regular.woff2",
  weight: "400",
  fallback: ["monospace"],
  variable: "--font-pixel",
})

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontSerif.variable,
  fontHandwritten.variable,
  fontPixel.variable,
  "[--font-sans:var(--font-geist-sans)]",
  "[--font-mono:var(--font-geist-mono)]",
  "[--font-serif:var(--font-geist-serif)]"
)
