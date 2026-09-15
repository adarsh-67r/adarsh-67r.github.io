"use client"

import { useEffect, useRef, useState } from "react"

const SIZE = 64
const SPEED = 1.1 // slow stroll — desktop walks ~1.5px/16ms, no rush to catch cursor
const CURSOR_OFFSET = { x: -12, y: 40 }

// desktop idle brain, verbatim: renderer.js IDLE_PHASES + IDLE_DURATIONS
const IDLE_PHASES = [
  "idle", // rest
  "look-right",
  "idle",
  "look-left",
  "idle",
  "scratch",
  "idle",
  "thuglife",
  "idle",
] as const
const IDLE_DURATIONS = [4000, 2000, 3000, 2000, 5000, 1800, 3000, 5000, 2000]
const HAPPY_MS = 2200 // desktop happy.duration
const DROWSY_MS = 4500 // desktop drowsy.delay
const TYPE_MS = 1200
const COPY_MS = 2000 // desktop clipboard.copyHold
const PASTE_MS = 1800 // desktop clipboard.pasteHold
const CHEESE_MS = 2500 // desktop screenshot.duration
const COFFEE_MS = 2000 // desktop coffee sip
const VIBE_MS = 10000

const ALL = [
  ...new Set([
    "idle",
    "drowsy",
    "asleep",
    "happy",
    "typing",
    "copy",
    "paste",
    "cheese",
    "coffee-sip",
    "vibing",
    "charging",
    "low-battery",
    "late-night",
    "edge-peek",
    ...IDLE_PHASES,
  ]),
]

const CSS = `
@keyframes clawd-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-0.8px); }
}
@keyframes clawd-stride-front {
  0%, 100% { transform: rotate(25deg); }
  50% { transform: rotate(-25deg); }
}
@keyframes clawd-stride-back {
  0%, 100% { transform: rotate(-25deg); }
  50% { transform: rotate(25deg); }
}
@keyframes clawd-arm-front {
  0%, 100% { transform: rotate(-20deg); }
  50% { transform: rotate(20deg); }
}
@keyframes clawd-arm-back {
  0%, 100% { transform: rotate(20deg); }
  50% { transform: rotate(-20deg); }
}
@keyframes clawd-bounce {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  30% { transform: translateY(-6px) scale(0.96, 1.05); }
  55% { transform: translateY(0) scale(1.05, 0.94); }
  75% { transform: translateY(-2px) scale(1, 1); }
}
.clawd-walk-bounce {
  animation: clawd-bob 0.4s infinite ease-in-out;
  transform-origin: 8px 15px;
}
.clawd-leg-front {
  animation: clawd-stride-front 0.4s infinite ease-in-out;
  transform-origin: 7.5px 12px;
}
.clawd-leg-back {
  animation: clawd-stride-back 0.4s infinite ease-in-out;
  transform-origin: 9.5px 12px;
}
.clawd-arm-front {
  animation: clawd-arm-front 0.4s infinite ease-in-out;
  transform-origin: 5.5px 8px;
}
.clawd-arm-back {
  animation: clawd-arm-back 0.4s infinite ease-in-out;
  transform-origin: 10.5px 8px;
}
`

function WalkSvg({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="-2 -2 19 20"
      width={SIZE}
      height={SIZE}
      style={{
        display: "block",
        imageRendering: "pixelated",
        transform: flip ? "scaleX(-1)" : "none",
      }}
      aria-hidden
    >
      <rect x="5" y="15" width="6" height="1" fill="#000" opacity="0.3" />
      <g className="clawd-walk-bounce">
        <g fill="#DE886D">
          <rect x="5" y="5" width="6" height="7" />
          <g className="clawd-leg-front">
            <rect x="7" y="12" width="1" height="3" />
          </g>
          <g className="clawd-leg-back">
            <rect x="9" y="12" width="1" height="3" fill="#C9775D" />
          </g>
          <g className="clawd-arm-front">
            <rect x="5" y="8" width="1" height="2" />
          </g>
          <g className="clawd-arm-back">
            <rect x="10" y="8" width="1" height="2" fill="#C9775D" />
          </g>
        </g>
        <g fill="#000">
          <rect x="9" y="7" width="1" height="2" />
        </g>
      </g>
    </svg>
  )
}

function clamp(v: number, max: number) {
  return Math.max(0, Math.min(v, max))
}

export default function ClawdFollowerCore() {
  const [expr, setExpr] = useState("idle")
  const [dir, setDir] = useState<"left" | "right">("left")

  // outer = position only, inner = art only (never fight over one element)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const pos = useRef({ x: 100, y: 20 })
  const target = useRef({ x: 100, y: 20 })
  const lastMove = useRef(0)
  const happyUntil = useRef(0)
  const typeUntil = useRef(0)
  const copyUntil = useRef(0)
  const pasteUntil = useRef(0)
  const cheeseUntil = useRef(0)
  const coffeeUntil = useRef(0)
  const vibeUntil = useRef(0)
  const chargeUntil = useRef(0) // desktop: 3s celebration on plug-in, not a stuck state
  const batteryLow = useRef(false)
  const lateNight = useRef(false)
  const idleIndex = useRef(0)
  const idlePhase = useRef<string>("idle")
  const exprRef = useRef("idle")
  const dirRef = useRef<"left" | "right">("left")
  const movingRef = useRef(false)
  // independence: nag meter fills on frantic chasing, solo mode ignores cursor
  const nag = useRef(0)
  const soloUntil = useRef(0)
  const tapStart = useRef({ x: 0, y: 0, t: 0 })

  useEffect(() => {
    ALL.forEach((f) => {
      const im = new Image()
      im.src = `/images/clawd/${f}.svg`
    })
    pos.current = { x: window.innerWidth - SIZE - 20, y: 20 }
    target.current = { ...pos.current }
    lastMove.current = Date.now()
    let raf = 0

    const randomStroll = () => {
      const ang = Math.random() * Math.PI * 2
      const dist = 150 + Math.random() * 250
      target.current = {
        x: clamp(
          pos.current.x + Math.cos(ang) * dist,
          window.innerWidth - SIZE
        ),
        y: clamp(
          pos.current.y + Math.sin(ang) * dist,
          window.innerHeight - SIZE
        ),
      }
    }
    const startSolo = (ms: number) => {
      soloUntil.current = Date.now() + ms
      nag.current = 0
      randomStroll()
    }

    // shared steering for mouse + touch
    const pointTo = (clientX: number, clientY: number) => {
      lastMove.current = Date.now()
      // solo mode: he ignores you for a while
      if (Date.now() < soloUntil.current) return
      const next = {
        x: clamp(clientX - CURSOR_OFFSET.x, window.innerWidth - SIZE),
        y: clamp(clientY - CURSOR_OFFSET.y, window.innerHeight - SIZE),
      }
      // dead-zone: ignore tiny jitters while stopped (duck uses 50px)
      if (!movingRef.current) {
        const jx = next.x - target.current.x
        const jy = next.y - target.current.y
        if (Math.hypot(jx, jy) < 28) return
      }
      target.current = next
      // nag fills while he's made to chase; decays in tick
      if (movingRef.current) {
        nag.current += 2
        // ~4-5s of frantic chasing before he rebels (was unreachable at +1/0.985)
        if (nag.current > 250) startSolo(10000)
      }
    }

    const onMove = (e: MouseEvent) => {
      pointTo(e.clientX, e.clientY)
    }
    // touch: finger drags steer him, quick taps celebrate (click also fires)
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      tapStart.current = { x: t.clientX, y: t.clientY, t: Date.now() }
      pointTo(t.clientX, t.clientY)
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      pointTo(t.clientX, t.clientY)
    }
    const onTouchEnd = (e: TouchEvent) => {
      const s = tapStart.current
      const c = e.changedTouches[0]
      lastMove.current = Date.now()
      if (
        Date.now() - s.t < 300 &&
        Math.hypot(c.clientX - s.x, c.clientY - s.y) < 12
      ) {
        happyUntil.current = Date.now() + HAPPY_MS
      }
    }
    const onClick = () => {
      happyUntil.current = Date.now() + HAPPY_MS
      lastMove.current = Date.now()
    }
    const onDblClick = () => {
      happyUntil.current = 0 // clicks fired first — let cheese win
      cheeseUntil.current = Date.now() + CHEESE_MS // say cheese
      lastMove.current = Date.now()
    }
    const onKey = () => {
      typeUntil.current = Date.now() + TYPE_MS
      lastMove.current = Date.now()
    }
    const onCopy = () => {
      copyUntil.current = Date.now() + COPY_MS
      lastMove.current = Date.now()
    }
    const onPaste = () => {
      pasteUntil.current = Date.now() + PASTE_MS
      lastMove.current = Date.now()
    }
    const onPlay = () => {
      vibeUntil.current = Date.now() + VIBE_MS
    }
    const onPrint = () => {
      cheeseUntil.current = Date.now() + CHEESE_MS
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("click", onClick, { passive: true })
    window.addEventListener("dblclick", onDblClick, { passive: true })
    window.addEventListener("keydown", onKey, { passive: true })
    window.addEventListener("copy", onCopy)
    window.addEventListener("paste", onPaste)
    document.addEventListener("play", onPlay, true)
    window.addEventListener("beforeprint", onPrint)

    // coffee break: desktop pours 8s after action starts, then every 18s;
    // web sips when idle a while — first one early so it's discoverable
    const maybeCoffee = () => {
      if (Date.now() - lastMove.current > 12000) {
        coffeeUntil.current = Date.now() + COFFEE_MS
      }
    }
    const coffeeFirst = window.setTimeout(maybeCoffee, 20000)
    const coffeeTimer = window.setInterval(maybeCoffee, 60000)

    // late-night flag like desktop isLateNight()
    const checkNight = () => {
      const h = new Date().getHours()
      lateNight.current = h >= 23 || h < 5
    }
    checkNight()
    const nightTimer = window.setInterval(checkNight, 60000)

    // battery like desktop low-battery/charging
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        charging: boolean
        level: number
        addEventListener: (t: string, f: () => void) => void
      }>
    }
    let batteryStop = false
    if (nav.getBattery) {
      nav
        .getBattery()
        .then((b) => {
          let wasCharging = b.charging
          const syncBatt = () => {
            if (batteryStop) return
            // desktop: 3s celebration on plug-in, then back to normal
            if (!wasCharging && b.charging) {
              chargeUntil.current = Date.now() + 3000
            }
            wasCharging = b.charging
            batteryLow.current = !b.charging && b.level <= 0.2
          }
          syncBatt()
          b.addEventListener("chargingchange", syncBatt)
          b.addEventListener("levelchange", syncBatt)
        })
        .catch(() => {})
    }

    // desktop advanceIdle chain, verbatim rhythm
    let idleTimer = 0
    const advanceIdle = () => {
      idleIndex.current = (idleIndex.current + 1) % IDLE_PHASES.length
      idlePhase.current = IDLE_PHASES[idleIndex.current]
      idleTimer = window.setTimeout(
        advanceIdle,
        IDLE_DURATIONS[idleIndex.current]
      )
    }
    idleTimer = window.setTimeout(advanceIdle, IDLE_DURATIONS[0])

    const sync = (
      nextExpr: string,
      nextDir: "left" | "right",
      nextMoving: boolean
    ) => {
      if (exprRef.current !== nextExpr) {
        exprRef.current = nextExpr
        setExpr(nextExpr)
      }
      if (dirRef.current !== nextDir) {
        dirRef.current = nextDir
        setDir(nextDir)
      }
      movingRef.current = nextMoving
    }

    // desktop random-walk: long idle → strolls off on his own
    const soloTimer = window.setInterval(() => {
      if (
        Date.now() >= soloUntil.current &&
        !movingRef.current &&
        Date.now() - lastMove.current > 25000 &&
        Math.random() < 0.5
      ) {
        startSolo(8000)
      }
    }, 9000)

    const tick = () => {
      nag.current *= 0.995 // calm down between chases
      const dx = target.current.x - pos.current.x
      const dy = target.current.y - pos.current.y
      const dist = Math.hypot(dx, dy)
      const now = Date.now()
      let nextDir = dirRef.current

      if (dist > 8) {
        const step = Math.min(SPEED, dist)
        pos.current = {
          x: clamp(pos.current.x + (dx / dist) * step, window.innerWidth - SIZE),
          y: clamp(pos.current.y + (dy / dist) * step, window.innerHeight - SIZE),
        }
        if (Math.abs(dx) > 14) nextDir = dx > 0 ? "right" : "left"
        sync("walking", nextDir, true)
      } else {
        // priority: click > clipboard > typing > cheese > coffee > vibe > power > edge > night > idle cycle > sleep
        let next: string = idlePhase.current
        if (now < happyUntil.current) next = "happy"
        else if (now < copyUntil.current) next = "copy"
        else if (now < pasteUntil.current) next = "paste"
        else if (now < typeUntil.current) next = "typing"
        else if (now < cheeseUntil.current) next = "cheese"
        else if (now < coffeeUntil.current) next = "coffee-sip"
        else if (now < vibeUntil.current) next = "vibing"
        else if (now < chargeUntil.current) next = "charging"
        // solo mode: shades on while he's ignoring you
        else if (now < soloUntil.current) next = "thuglife"
        else if (batteryLow.current) next = "low-battery"
        else {
          const idleFor = now - lastMove.current
          if (idleFor > DROWSY_MS + 4500) next = "asleep"
          else if (idleFor > DROWSY_MS) next = "drowsy"
          else {
            const maxX = window.innerWidth - SIZE
            if (pos.current.x <= 2 || pos.current.x >= maxX - 2)
              next = "edge-peek"
            else if (lateNight.current && next === "idle") next = "late-night"
          }
        }
        sync(next, nextDir, false)
      }

      boxRef.current?.style.setProperty(
        "transform",
        `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // battery: freeze the loop in background tabs
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!raf) {
        lastMove.current = Date.now()
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      batteryStop = true
      cancelAnimationFrame(raf)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("click", onClick)
      window.removeEventListener("dblclick", onDblClick)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("copy", onCopy)
      window.removeEventListener("paste", onPaste)
      document.removeEventListener("play", onPlay, true)
      window.removeEventListener("beforeprint", onPrint)
      document.removeEventListener("visibilitychange", onVis)
      window.clearTimeout(idleTimer)
      window.clearTimeout(coffeeFirst)
      window.clearInterval(coffeeTimer)
      window.clearInterval(nightTimer)
      window.clearInterval(soloTimer)
    }
  }, [])

  const walking = expr === "walking"

  return (
    <>
      <style>{CSS}</style>
      <div
        ref={boxRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: SIZE,
          height: SIZE,
          zIndex: 60,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        {walking ? (
          <WalkSvg flip={dir === "left"} />
        ) : (
          <img
            src={`/images/clawd/${expr}.svg`}
            alt=""
            draggable={false}
            width={SIZE}
            height={SIZE}
            style={{
              display: "block",
              width: SIZE,
              height: SIZE,
              imageRendering: "pixelated",
              userSelect: "none",
              animation:
                expr === "happy" ? "clawd-bounce 0.6s ease-out" : "none",
            }}
          />
        )}
      </div>
    </>
  )
}
