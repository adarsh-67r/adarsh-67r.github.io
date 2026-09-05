export function AdarshMark({
  className,
  id,
  ...props
}: {
  className?: string
  id?: string
} & React.ComponentProps<"svg">) {
  return (
    <svg
      id={id}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 896 256"
      aria-hidden
      {...props}
    >
      <path
        fill="currentColor"
        d="M64 0H192V64H64ZM0 64H64V256H0ZM192 64H256V256H192ZM64 128H192V192H64ZM384 0H512V64H384ZM320 64H384V256H320ZM512 64H576V256H512ZM384 128H512V192H384ZM640 0H704V256H640ZM704 0H832V64H704ZM832 64H896V128H832ZM704 128H832V192H704ZM832 192H896V256H832Z"
      />
    </svg>
  )
}

export function getMarkSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 896 256"><path fill="currentColor" d="M64 0H192V64H64ZM0 64H64V256H0ZM192 64H256V256H192ZM64 128H192V192H64ZM384 0H512V64H384ZM320 64H384V256H320ZM512 64H576V256H512ZM384 128H512V192H384ZM640 0H704V256H640ZM704 0H832V64H704ZM832 64H896V128H832ZM704 128H832V192H704ZM832 192H896V256H832Z"/></svg>`
}
