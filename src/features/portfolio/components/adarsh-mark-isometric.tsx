"use client"

import { useEffect, useId, useRef } from "react"
import type { Transition } from "motion/react"
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { metalClickSound } from "@/lib/soundcn/metal-click"
import { useSound } from "@/hooks/soundcn/use-sound"

const transition: Transition = {
  type: "spring",
  mass: 0.5,
  damping: 18,
  stiffness: 200,
}

export function AdarshMarkIsometric() {
  const id = useId()
  const ids = {
    facePattern: `adarsh-face-pattern-${id}`,
    faceFill: `adarsh-face-fill-${id}`,
    stroke: `adarsh-stroke-${id}`,
    radialGradient: `adarsh-radial-gradient-${id}`,
  }

  const ref = useRef<SVGSVGElement>(null)

  const [play] = useSound(metalClickSound)

  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { margin: "80px" })

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const cx = useSpring(useTransform(mouseX, [0, 1], [0, 556]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  })

  const cy = useSpring(useTransform(mouseY, [0, 1], [0, 354]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  })

  useEffect(() => {
    if (shouldReduceMotion || !isInView) {
      return
    }

    if (window.matchMedia("(hover: none)").matches) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [shouldReduceMotion, isInView, mouseX, mouseY])

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
        <pattern
          id={ids.facePattern}
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M-1 1l2 -2M0 10l10 -10M9 11l2 -2"
            stroke="var(--pattern)"
            strokeWidth="1"
          />
        </pattern>

        <motion.g
          id={ids.faceFill}
          variants={{
            normal: {
              transform: "translate(0px, 0px)",
            },
            pressed: {
              transform: "translate(0px, 12px)",
            },
          }}
          transition={transition}
        >
          <path d="M56.3 229L111.72 197L139.44 213L167.15 197L250.29 245L222.57 261L194.86 245L139.44 277L167.15 293L139.44 309L56.3 261L84.01 245Z M84.01 245L139.44 213L167.15 229L111.72 261Z" />
          <path d="M194.86 149L250.29 117L278 133L305.71 117L388.85 165L361.14 181L333.43 165L278 197L305.71 213L278 229L194.86 181L222.57 165Z M222.57 165L278 133L305.71 149L250.29 181Z" />
          <path d="M305.71 85L388.85 37L416.56 53L444.28 37L471.99 53L444.28 69L471.99 85L499.7 69L527.42 85L499.7 101L471.99 85L416.56 117L444.28 133L416.56 149Z M361.14 85L416.56 53L444.28 69L388.85 101Z" />
        </motion.g>

        <motion.path
          id={ids.stroke}
          variants={{
            normal: {
              d: [
                "M56.3 229L111.72 197L139.44 213L167.15 197L250.29 245L222.57 261L194.86 245L139.44 277L167.15 293L139.44 309L56.3 261L84.01 245Z M84.01 245L139.44 213L167.15 229L111.72 261Z",
                "M194.86 149L250.29 117L278 133L305.71 117L388.85 165L361.14 181L333.43 165L278 197L305.71 213L278 229L194.86 181L222.57 165Z M222.57 165L278 133L305.71 149L250.29 181Z",
                "M305.71 85L388.85 37L416.56 53L444.28 37L471.99 53L444.28 69L471.99 85L499.7 69L527.42 85L499.7 101L471.99 85L416.56 117L444.28 133L416.56 149Z M361.14 85L416.56 53L444.28 69L388.85 101Z",
                "M250.29 269L222.57 285",
                "M222.57 285L194.86 269",
                "M194.86 269L139.44 301",
                "M167.15 317L139.44 333",
                "M139.44 333L56.3 285",
                "M84.01 269L56.3 253",
                "M84.01 269L139.44 237",
                "M139.44 237L167.15 253",
                "M388.85 189L361.14 205",
                "M361.14 205L333.43 189",
                "M333.43 189L278 221",
                "M305.71 237L278 253",
                "M278 253L194.86 205",
                "M222.57 189L194.86 173",
                "M222.57 189L278 157",
                "M278 157L305.71 173",
                "M471.99 77L444.28 93",
                "M527.42 109L499.7 125",
                "M499.7 125L471.99 109",
                "M471.99 109L416.56 141",
                "M444.28 157L416.56 173",
                "M416.56 173L305.71 109",
                "M361.14 109L416.56 77",
                "M416.56 77L444.28 93",
                "M250.29 245L250.29 269",
                "M222.57 261L222.57 285",
                "M194.86 245L194.86 269",
                "M139.44 277L139.44 301",
                "M167.15 293L167.15 317",
                "M139.44 309L139.44 333",
                "M56.3 261L56.3 285",
                "M84.01 245L84.01 269",
                "M56.3 229L56.3 253",
                "M139.44 213L139.44 237",
                "M167.15 229L167.15 253",
                "M388.85 165L388.85 189",
                "M361.14 181L361.14 205",
                "M333.43 165L333.43 189",
                "M278 197L278 221",
                "M305.71 213L305.71 237",
                "M278 229L278 253",
                "M194.86 181L194.86 205",
                "M222.57 165L222.57 189",
                "M194.86 149L194.86 173",
                "M278 133L278 157",
                "M305.71 149L305.71 173",
                "M471.99 53L471.99 77",
                "M444.28 69L444.28 93",
                "M527.42 85L527.42 109",
                "M499.7 101L499.7 125",
                "M471.99 85L471.99 109",
                "M416.56 117L416.56 141",
                "M444.28 133L444.28 157",
                "M416.56 149L416.56 173",
                "M305.71 85L305.71 109",
                "M361.14 85L361.14 109",
                "M416.56 53L416.56 77",
              ].join(""),
            },
            pressed: {
              d: [
                "M56.3 241L111.72 209L139.44 225L167.15 209L250.29 257L222.57 273L194.86 257L139.44 289L167.15 305L139.44 321L56.3 273L84.01 257Z M84.01 257L139.44 225L167.15 241L111.72 273Z",
                "M194.86 161L250.29 129L278 145L305.71 129L388.85 177L361.14 193L333.43 177L278 209L305.71 225L278 241L194.86 193L222.57 177Z M222.57 177L278 145L305.71 161L250.29 193Z",
                "M305.71 97L388.85 49L416.56 65L444.28 49L471.99 65L444.28 81L471.99 97L499.7 81L527.42 97L499.7 113L471.99 97L416.56 129L444.28 145L416.56 161Z M361.14 97L416.56 65L444.28 81L388.85 113Z",
                "M250.29 269L222.57 285",
                "M222.57 285L194.86 269",
                "M194.86 269L139.44 301",
                "M167.15 317L139.44 333",
                "M139.44 333L56.3 285",
                "M84.01 269L56.3 253",
                "M84.01 269L139.44 237",
                "M139.44 237L167.15 253",
                "M388.85 189L361.14 205",
                "M361.14 205L333.43 189",
                "M333.43 189L278 221",
                "M305.71 237L278 253",
                "M278 253L194.86 205",
                "M222.57 189L194.86 173",
                "M222.57 189L278 157",
                "M278 157L305.71 173",
                "M471.99 77L444.28 93",
                "M527.42 109L499.7 125",
                "M499.7 125L471.99 109",
                "M471.99 109L416.56 141",
                "M444.28 157L416.56 173",
                "M416.56 173L305.71 109",
                "M361.14 109L416.56 77",
                "M416.56 77L444.28 93",
                "M250.29 257L250.29 269",
                "M222.57 273L222.57 285",
                "M194.86 257L194.86 269",
                "M139.44 289L139.44 301",
                "M167.15 305L167.15 317",
                "M139.44 321L139.44 333",
                "M56.3 273L56.3 285",
                "M84.01 257L84.01 269",
                "M56.3 241L56.3 253",
                "M139.44 225L139.44 237",
                "M167.15 241L167.15 253",
                "M388.85 177L388.85 189",
                "M361.14 193L361.14 205",
                "M333.43 177L333.43 189",
                "M278 209L278 221",
                "M305.71 225L305.71 237",
                "M278 241L278 253",
                "M194.86 193L194.86 205",
                "M222.57 177L222.57 189",
                "M194.86 161L194.86 173",
                "M278 145L278 157",
                "M305.71 161L305.71 173",
                "M471.99 65L471.99 77",
                "M444.28 81L444.28 93",
                "M527.42 97L527.42 109",
                "M499.7 113L499.7 125",
                "M471.99 97L471.99 109",
                "M416.56 129L416.56 141",
                "M444.28 145L444.28 157",
                "M416.56 161L416.56 173",
                "M305.71 97L305.71 109",
                "M361.14 97L361.14 109",
                "M416.56 65L416.56 77",
              ].join(""),
            },
          }}
          transition={transition}
        />

        <motion.radialGradient
          id={ids.radialGradient}
          cx={cx}
          cy={cy}
          r="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            className="dark:[stop-color:#fff]"
            stopColor="var(--color-zinc-700)"
          />
          <stop
            className="dark:[stop-color:var(--color-zinc-600)]"
            offset="1"
            stopColor="var(--color-zinc-400)"
            stopOpacity="0"
          />
        </motion.radialGradient>
      </defs>

      <g className="stroke-line" strokeWidth="1" strokeDasharray="4 2">
        <path d="M-477.55 756.57L1254.51 -243.41" />
        <path d="M977.37 788.58L-754.67 -211.42" />
        <path d="M1143.65 692.58L-588.39 -307.42" />
      </g>

      <g className="fill-background" fillRule="evenodd" clipRule="evenodd">
        <motion.path
          variants={{
            normal: {
              d: "M250.29 245L222.57 261L222.57 285L250.29 269Z",
            },
            pressed: {
              d: "M250.29 257L222.57 273L222.57 285L250.29 269Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M222.57 261L194.86 245L194.86 269L222.57 285Z",
            },
            pressed: {
              d: "M222.57 273L194.86 257L194.86 269L222.57 285Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M194.86 245L139.44 277L139.44 301L194.86 269Z",
            },
            pressed: {
              d: "M194.86 257L139.44 289L139.44 301L194.86 269Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M167.15 293L139.44 309L139.44 333L167.15 317Z",
            },
            pressed: {
              d: "M167.15 305L139.44 321L139.44 333L167.15 317Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M139.44 309L56.3 261L56.3 285L139.44 333Z",
            },
            pressed: {
              d: "M139.44 321L56.3 273L56.3 285L139.44 333Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M84.01 245L56.3 229L56.3 253L84.01 269Z",
            },
            pressed: {
              d: "M84.01 257L56.3 241L56.3 253L84.01 269Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M84.01 245L139.44 213L139.44 237L84.01 269Z",
            },
            pressed: {
              d: "M84.01 257L139.44 225L139.44 237L84.01 269Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M139.44 213L167.15 229L167.15 253L139.44 237Z",
            },
            pressed: {
              d: "M139.44 225L167.15 241L167.15 253L139.44 237Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M388.85 165L361.14 181L361.14 205L388.85 189Z",
            },
            pressed: {
              d: "M388.85 177L361.14 193L361.14 205L388.85 189Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M361.14 181L333.43 165L333.43 189L361.14 205Z",
            },
            pressed: {
              d: "M361.14 193L333.43 177L333.43 189L361.14 205Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M333.43 165L278 197L278 221L333.43 189Z",
            },
            pressed: {
              d: "M333.43 177L278 209L278 221L333.43 189Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M305.71 213L278 229L278 253L305.71 237Z",
            },
            pressed: {
              d: "M305.71 225L278 241L278 253L305.71 237Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M278 229L194.86 181L194.86 205L278 253Z",
            },
            pressed: {
              d: "M278 241L194.86 193L194.86 205L278 253Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M222.57 165L194.86 149L194.86 173L222.57 189Z",
            },
            pressed: {
              d: "M222.57 177L194.86 161L194.86 173L222.57 189Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M222.57 165L278 133L278 157L222.57 189Z",
            },
            pressed: {
              d: "M222.57 177L278 145L278 157L222.57 189Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M278 133L305.71 149L305.71 173L278 157Z",
            },
            pressed: {
              d: "M278 145L305.71 161L305.71 173L278 157Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M471.99 53L444.28 69L444.28 93L471.99 77Z",
            },
            pressed: {
              d: "M471.99 65L444.28 81L444.28 93L471.99 77Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M527.42 85L499.7 101L499.7 125L527.42 109Z",
            },
            pressed: {
              d: "M527.42 97L499.7 113L499.7 125L527.42 109Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M499.7 101L471.99 85L471.99 109L499.7 125Z",
            },
            pressed: {
              d: "M499.7 113L471.99 97L471.99 109L499.7 125Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M471.99 85L416.56 117L416.56 141L471.99 109Z",
            },
            pressed: {
              d: "M471.99 97L416.56 129L416.56 141L471.99 109Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M444.28 133L416.56 149L416.56 173L444.28 157Z",
            },
            pressed: {
              d: "M444.28 145L416.56 161L416.56 173L444.28 157Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M416.56 149L305.71 85L305.71 109L416.56 173Z",
            },
            pressed: {
              d: "M416.56 161L305.71 97L305.71 109L416.56 173Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M361.14 85L416.56 53L416.56 77L361.14 109Z",
            },
            pressed: {
              d: "M361.14 97L416.56 65L416.56 77L361.14 109Z",
            },
          }}
          transition={transition}
        />
        <motion.path
          variants={{
            normal: {
              d: "M416.56 53L444.28 69L444.28 93L416.56 77Z",
            },
            pressed: {
              d: "M416.56 65L444.28 81L444.28 93L416.56 77Z",
            },
          }}
          transition={transition}
        />
      </g>

      <use href={`#${ids.faceFill}`} className="fill-background" />
      <use href={`#${ids.faceFill}`} fill={`url(#${ids.facePattern})`} />

      <use href={`#${ids.stroke}`} stroke="var(--stroke)" />
      <use href={`#${ids.stroke}`} stroke={`url(#${ids.radialGradient})`} />
    </motion.svg>
  )
}
