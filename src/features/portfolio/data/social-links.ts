import type { SocialProfile } from "@/features/portfolio/types/social-links"

/**
 * Keyed registry of social profiles — the single source of truth. Icons are
 * bound separately in `social-link-icons.tsx` (keyed by the same `SocialName`),
 * so adding a profile here forces the icon map to stay in sync at compile time.
 */
export const SOCIAL = {
  x: {
    title: "X",
    handle: "",
    href: "",
  },
  github: {
    title: "GitHub",
    handle: "adarsh-67r",
    href: "https://github.com/adarsh-67r",
    sameAs: true,
  },
  linkedin: {
    title: "LinkedIn",
    handle: "adarsh67",
    href: "https://www.linkedin.com/in/adarsh67",
    sameAs: true,
  },
  dailydotdev: {
    title: "daily.dev",
    handle: "",
    href: "",
  },
  discord: {
    title: "Discord",
    handle: "",
    href: "",
  },
  youtube: {
    title: "YouTube",
    handle: "",
    href: "",
  },
} satisfies Record<string, SocialProfile>

export const EMAIL = "adarshanshuman6@gmail.com"

export type SocialName = keyof typeof SOCIAL

export type SocialLink = SocialProfile & { name: SocialName }

export const SOCIAL_LINKS: SocialLink[] = (
  Object.entries(SOCIAL) as [SocialName, SocialProfile][]
)
  .filter(([, profile]) => Boolean(profile.href))
  .map(([name, profile]) => ({ name, ...profile }))
