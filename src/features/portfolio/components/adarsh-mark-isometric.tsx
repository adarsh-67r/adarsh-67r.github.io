"use client"

import React, { useId, useRef, useEffect } from "react"
import type { Transition } from "motion/react"
import { motion, useInView, useReducedMotion, useMotionValue, useSpring, useTransform } from "motion/react"
import { metalClickSound } from "@/lib/soundcn/metal-click"
import { useSound } from "@/hooks/soundcn/use-sound"

const transition: Transition = {
  type: "spring",
  mass: 0.5,
  damping: 18,
  stiffness: 200,
}

// Isometric projection
const DX = 0.866
const DY = 0.5

function IsoBlock({
  paths,
  depth,
  xOffset = 0,
  yOffset = 0,
  scale = 1,
  id
}: {
  paths: { x: number, y: number }[][]
  depth: number
  xOffset?: number
  yOffset?: number
  scale?: number
  id: string
}) {
  const toIso = (x: number, y: number, z: number) => {
    const sx = (x * DX - y * DX) * scale
    const sy = (x * DY + y * DY) * scale - z * scale
    return { x: sx + xOffset, y: sy + yOffset }
  }

  // Generate walls
  const walls: React.ReactNode[] = []
  
  paths.forEach(path => {
    for (let i = 0; i < path.length; i++) {
      const p1 = path[i]
      const p2 = path[(i + 1) % path.length]
      
      // Determine if wall is visible from the front in isometric view
      // Normal vector in 2D
      const nx = p2.y - p1.y
      const ny = -(p2.x - p1.x)
      
      // We only see walls facing +X or +Y in our grid space
      if (nx > 0 || ny > 0) {
        const top1 = toIso(p1.x, p1.y, depth)
        const top2 = toIso(p2.x, p2.y, depth)
        const bot1 = toIso(p1.x, p1.y, 0)
        const bot2 = toIso(p2.x, p2.y, 0)
        
        // Darker shade for X-facing walls (left), lighter for Y-facing (right)
        const fill = nx > 0 
          ? "color-mix(in oklab, var(--background) 90%, var(--foreground))" 
          : "color-mix(in oklab, var(--background) 95%, var(--foreground))"

        walls.push(
          <polygon
            key={`${p1.x}-${p1.y}-${p2.x}-${p2.y}`}
            points={`${top1.x},${top1.y} ${top2.x},${top2.y} ${bot2.x},${bot2.y} ${bot1.x},${bot1.y}`}
            fill={fill}
            stroke="var(--stroke)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )
      }
    }
  })

  // Generate top faces
  const topPaths = paths.map(path => {
    return path.map(p => {
      const iso = toIso(p.x, p.y, depth)
      return `${iso.x},${iso.y}`
    }).join(" L ")
  })

  // SVG path data (M ... L ... Z) for outer and holes
  const topPathData = topPaths.map((p, i) => `M ${p} Z`).join(" ")
  
  // Base shadow
  const botPaths = paths.map(path => {
    return path.map(p => {
      const iso = toIso(p.x, p.y, 0)
      return `${iso.x},${iso.y}`
    }).join(" L ")
  })
  const botPathData = botPaths.map((p, i) => `M ${p} Z`).join(" ")

  return (
    <motion.g
      variants={{
        normal: { y: 0 },
        pressed: { y: depth * scale * 0.6 } // Compress down 60%
      }}
      transition={transition}
    >
      <path d={botPathData} fill="var(--background)" />
      {walls}
      <path 
        d={topPathData} 
        fill={`url(#facePattern-${id})`}
        stroke="var(--stroke)" 
        strokeWidth="1.5"
        strokeLinejoin="round" 
        fillRule="evenodd"
      />
      <path 
        d={topPathData} 
        fill="none"
        stroke={`url(#gradient-${id})`} 
        strokeWidth="1.5"
        strokeLinejoin="round" 
      />
    </motion.g>
  )
}

export function AdarshMarkIsometric() {
  const ref = useRef<SVGSVGElement>(null)
  const [play] = useSound(metalClickSound)
  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { margin: "80px" })
  const id = useId()

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const cx = useSpring(useTransform(mouseX, [0, 1], [0, 556]), { stiffness: 300, damping: 30, mass: 0.1 })
  const cy = useSpring(useTransform(mouseY, [0, 1], [0, 354]), { stiffness: 300, damping: 30, mass: 0.1 })

  useEffect(() => {
    if (shouldReduceMotion || !isInView) return
    if (window.matchMedia("(hover: none)").matches) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [shouldReduceMotion, isInView, mouseX, mouseY])

  // Define 2D polygons for A and R (Clockwise for outer, Counter-Clockwise for holes)
  const A_OUTER = [[0,0], [4,0], [4,5], [3,5], [3,3], [1,3], [1,5], [0,5]]
  const A_HOLE = [[1,1], [1,2], [3,2], [3,1]] // Counter-clockwise
  const R_OUTER = [[0,0], [4,0], [4,3], [3,3], [3,5], [2,5], [2,3], [1,3], [1,5], [0,5]]
  const R_HOLE = [[1,1], [1,2], [3,2], [3,1]] // Counter-clockwise

  // Helper to convert arrays to objects
  const toPoints = (arr: number[][]) => arr.map(p => ({ x: p[0], y: p[1] }))

  const letterA = [toPoints(A_OUTER), toPoints(A_HOLE)]
  const letterR = [toPoints(R_OUTER), toPoints(R_HOLE)]

  const DEPTH = 2
  const SCALE = 24

  return (
    <motion.svg
      ref={ref}
      className="h-auto w-full touch-manipulation overflow-visible [--pattern:color-mix(in_oklab,var(--foreground)_12%,var(--background))] [--stroke:color-mix(in_oklab,var(--foreground)_16%,var(--background))]"
      viewBox="0 0 556 354"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      initial="normal"
      whileTap="pressed"
      onTap={() => play()}
    >
      <defs>
        <pattern id={`facePattern-${id}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M-1 1l2 -2M0 10l10 -10M9 11l2 -2" stroke="var(--pattern)" strokeWidth="1" />
          <rect width="10" height="10" fill="var(--background)" fillOpacity="0.8" />
        </pattern>
        <motion.radialGradient id={`gradient-${id}`} cx={cx} cy={cy} r="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-zinc-700)" className="dark:[stop-color:#fff]" />
          <stop offset="1" stopColor="var(--color-zinc-400)" stopOpacity="0" className="dark:[stop-color:var(--color-zinc-600)]" />
        </motion.radialGradient>
      </defs>

      <g className="stroke-line" strokeWidth="1" strokeDasharray="4 2" stroke="var(--stroke)">
        <path d="M-477.55 756.57L1254.51 -243.41" />
        <path d="M977.37 788.58L-754.67 -211.42" />
        <path d="M1143.65 692.58L-588.39 -307.42" />
      </g>

      {/* Center the cluster in the SVG viewBox (278, 177) */}
      <g>
        {/* A 1 */}
        <IsoBlock paths={letterA} depth={DEPTH} scale={SCALE} xOffset={278 - 140} yOffset={200 - 30} id={id} />
        {/* A 2 */}
        <IsoBlock paths={letterA} depth={DEPTH} scale={SCALE} xOffset={278 + 0} yOffset={200 + 10} id={id} />
        {/* R */}
        <IsoBlock paths={letterR} depth={DEPTH} scale={SCALE} xOffset={278 + 140} yOffset={200 + 50} id={id} />
      </g>
    </motion.svg>
  )
}
