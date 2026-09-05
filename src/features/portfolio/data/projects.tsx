import { BotIcon, GlobeIcon } from "lucide-react"

import type { Project } from "../types/projects"

export const PROJECTS: Project[] = [
  {
    id: "adarsh-portfolio",
    title: "adarsh-67r.github.io",
    period: {
      start: "01.2025",
    },
    link: "https://adarsh-67r.github.io",
    skills: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
    ],
    description: "Personal portfolio and blog. Built with Next.js (this site).",
    icon: <GlobeIcon />,
    isExpanded: true,
  },
  {
    id: "routemind",
    title: "RouteMind",
    period: {
      start: "05.2025",
    },
    link: "https://routemind-ai-app.vercel.app",
    skills: [
      "React",
      "FastAPI",
      "Supabase",
    ],
    description: "AI model routing platform — dispatches requests to the best-suited model (GPT, Claude, Gemini) for quality, speed, and cost.",
    icon: <BotIcon />,
  },
]
