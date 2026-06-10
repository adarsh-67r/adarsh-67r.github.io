export default function Avatar({ size = 72 }) {
  return (
    <img
      src="https://avatars.githubusercontent.com/u/83777943?v=4"
      alt="Adarsh"
      width={size}
      height={size}
      loading="lazy"
      className="avatar-ring"
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        flexShrink: 0,
        display: 'block',
      }}
    />
  )
}
