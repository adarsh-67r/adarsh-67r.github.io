export const BALL_SIZE = 21
export const BALL_SPEED = 10

export const PADDLE_WIDTH = 96
export const PADDLE_HEIGHT = 24
export const PADDLE_SPEED = 16

// Brick width is now defined per-logo (see logos.ts); height stays fixed.
export const BRICK_HEIGHT = 24
export const BRICK_SHADOW_THICKNESS = 3
export const BRICK_SCORE = 10

export const FONT_URL =
  "https://assets.adarsh-67r.github.io/fonts/DepartureMono-Regular.otf"

export const SOUND_BOUNCE_URL =
  "https://assets.adarsh-67r.github.io/sounds/arkanoid/bounce.mp3"
export const SOUND_BREAK_URL =
  "https://assets.adarsh-67r.github.io/sounds/arkanoid/break.mp3"
export const SOUND_GAME_OVER_URL =
  "https://assets.adarsh-67r.github.io/sounds/arkanoid/game-over.mp3"

export const BALL_LIGHT_URL =
  "https://assets.adarsh-67r.github.io/images/arkanoid/ball-light.png?v=2"
export const BALL_DARK_URL =
  "https://assets.adarsh-67r.github.io/images/arkanoid/ball-dark.png?v=2"

export const PADDLE_LIGHT_URL =
  "https://assets.adarsh-67r.github.io/images/arkanoid/paddle-light.png?v=2"
export const PADDLE_DARK_URL =
  "https://assets.adarsh-67r.github.io/images/arkanoid/paddle-dark.png?v=2"

export function uncheckedClamp(
  min: number,
  max: number,
  value: number
): number {
  return Math.min(Math.max(value, min), max)
}
