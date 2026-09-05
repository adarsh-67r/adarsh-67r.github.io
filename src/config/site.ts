import type { Route } from "next"

import type { NavItem } from "@/types/nav"
import { SOCIAL } from "@/features/portfolio/data/social-links"
import { USER } from "@/features/portfolio/data/user"

export const SITE_INFO = {
  name: USER.displayName,
  url: process.env.NEXT_PUBLIC_APP_URL || "https://adarsh-67r.github.io",
  ogImage: USER.ogImage,
  description: USER.bio,
  keywords: USER.keywords,
}

export const LICENSE = {
  name: "MIT License",
  url: "https://github.com/adarsh-67r/adarsh-67r.github.io/blob/main/LICENSE",
}

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}

export const MAIN_NAV: NavItem<Route>[] = [
  {
    title: "Blog",
    href: "/blog",
  },
]

export const MOBILE_NAV: NavItem<Route>[] = [
  {
    title: "Home",
    href: "/",
  },
  ...MAIN_NAV,
]

export const X_HANDLE = SOCIAL.x.handle
export const GITHUB_USERNAME = SOCIAL.github.handle
export const SOURCE_CODE_GITHUB_REPO = "adarsh-67r/adarsh-67r.github.io"
export const SOURCE_CODE_GITHUB_URL = "https://github.com/adarsh-67r/adarsh-67r.github.io"

export const SPONSORSHIP_URL = "https://github.com/sponsors/adarsh-67r"

export const UTM_PARAMS = {
  utm_source: "adarsh-67r.github.io",
}
