export default function Avatar({ size = 72 }) {
  return (
    <img
      src="https://avatars.githubusercontent.com/u/83777943?v=4"
      alt="Adarsh"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid var(--border)',
        objectFit: 'cover',
        flexShrink: 0,
        display: 'block',
      }}
    />
  )
}
