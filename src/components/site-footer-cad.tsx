import Link from "next/link"

import { Separator } from "@/components/base/ui/separator"
import { DmcaIcon, GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons"
import { SiteFooterInteractiveLogotype } from "@/components/site-footer-brand"
import { SOCIAL } from "@/features/portfolio/data/social-links"
import { AdarshMark } from "./adarsh-mark"

/** Footer laid out as the title block of a technical drawing. */
export function SiteFooterCad() {
  const xLink = SOCIAL.x
  const githubLink = SOCIAL.github
  const linkedinLink = SOCIAL.linkedin

  return (
    <footer className="max-w-screen overflow-x-clip px-2">
      <div className="mx-auto border-x group-has-data-[slot=layout-wide]/layout:container md:max-w-3xl">
        <div className="screen-line-top screen-line-bottom screen-line-top-border before:z-1">
          <div className="stripe-divider h-12" />
        </div>


        <div className="screen-line-top screen-line-bottom flex items-center gap-3 screen-line-bottom-border px-4 py-3 text-muted-foreground">
          <Link
            href="/"
            className="mr-auto text-muted-foreground transition-[color] hover:text-foreground"
            aria-label="Home"
          >
            <AdarshMark className="h-4" />
          </Link>

          <a
            className="flex items-center transition-[color] hover:text-foreground"
            href={xLink.href}
            target="_blank"
            rel="noopener"
            aria-label="X Profile"
          >
            <XIcon className="size-4" />
          </a>

          <Separator
            orientation="vertical"
            className="data-vertical:h-4 data-vertical:self-center"
          />

          <a
            className="flex items-center transition-[color] hover:text-foreground"
            href={githubLink.href}
            target="_blank"
            rel="noopener"
            aria-label="GitHub Profile"
          >
            <GitHubIcon className="size-4" />
          </a>

          <Separator
            orientation="vertical"
            className="data-vertical:h-4 data-vertical:self-center"
          />

          <a
            className="flex items-center transition-[color] hover:text-foreground"
            href={linkedinLink.href}
            target="_blank"
            rel="noopener"
            aria-label="LinkedIn Profile"
          >
            <LinkedInIcon className="size-4" />
          </a>

          <Separator
            orientation="vertical"
            className="data-vertical:h-4 data-vertical:self-center"
          />

          <a
            className="flex items-center transition-[color] hover:text-foreground"
            href={
              process.env.NEXT_PUBLIC_DMCA_URL ||
              "https://www.dmca.com/ProtectionPro.aspx"
            }
            target="_blank"
            rel="noopener"
            aria-label="DMCA.com Protection Status"
          >
            <DmcaIcon className="h-4 w-auto" />
          </a>
        </div>
      </div>

      <SiteFooterInteractiveLogotype />

      <div className="h-(--fade-bottom-height)" />
      <div className="pb-[env(safe-area-inset-bottom,0)]" />
    </footer>
  )
}
