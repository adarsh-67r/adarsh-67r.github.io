export function AdarshWordmark({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
    >
      Adarsh
    </span>
  )
}

export function getWordmarkSVG() {
  return `<svg viewBox="0 0 512 128" xmlns="http://www.w3.org/2000/svg"><text x="0" y="96" font-weight="bold" font-size="96" fill="currentColor">Adarsh</text></svg>`
}
